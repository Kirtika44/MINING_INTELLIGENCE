'use strict'

const express = require('express')
const { prisma } = require('../utils/prisma')
const { authenticate } = require('../middleware/auth')

const router = express.Router()
router.use(authenticate)

// GET /api/reports
router.get('/', async (req, res, next) => {
  try {
    const { department, type, siteId, status, page = 1, limit = 20 } = req.query
    const where = {}
    if (req.user.role !== 'ADMIN') where.department = req.user.department || req.user.role.toLowerCase()
    if (department) where.department = department
    if (type)       where.type       = type
    if (siteId)     where.siteId     = siteId
    if (status)     where.status     = status

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          generatedBy: { select: { name: true } },
          site:        { select: { name: true, code: true } },
        },
      }),
    ])

    res.json({ reports, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) { next(err) }
})

// POST /api/reports/generate — generate a new report
router.post('/generate', async (req, res, next) => {
  try {
    const { title, type, department, siteId, period, documentIds } = req.body

    if (!title || !type || !department) {
      return res.status(400).json({ error: 'title, type and department are required.' })
    }

    const requestedDocumentIds = Array.isArray(documentIds)
      ? [...new Set(documentIds.filter(id => typeof id === 'string' && id.trim()))]
      : []
    const uploadedDocuments = requestedDocumentIds.length
      ? await prisma.document.findMany({ where: { id: { in: requestedDocumentIds } } })
      : []

    if (uploadedDocuments.length !== requestedDocumentIds.length) {
      return res.status(404).json({ error: 'One or more uploaded documents were not found.' })
    }

    const userDepartment = req.user.department || req.user.role.toLowerCase()
    if (req.user.role !== 'ADMIN' && uploadedDocuments.some(doc => doc.department !== userDepartment)) {
      return res.status(403).json({ error: 'You are not authorized to use one or more selected documents.' })
    }

    if (uploadedDocuments.some(doc => doc.status !== 'READY')) {
      return res.status(409).json({ error: 'Wait until document processing is complete before generating its report.' })
    }

    const extractedFields = requestedDocumentIds.length
      ? await prisma.knowledgeEntry.findMany({
          where: { documentId: { in: requestedDocumentIds } },
          orderBy: [{ documentId: 'asc' }, { fieldName: 'asc' }],
        })
      : []
    const reportSiteId = siteId || (uploadedDocuments.length === 1 ? uploadedDocuments[0].siteId : null)

    // Fetch site + data for report content (Promise.all — SQLite compatible)
    const [site, productions, seams, geoData, reserves, envData, machines, riskItems] =
      await Promise.all([
        reportSiteId ? prisma.site.findUnique({ where: { id: reportSiteId } }) : Promise.resolve(null),
        reportSiteId ? prisma.production.findMany({ where: { siteId: reportSiteId }, orderBy: { date: 'asc' } }) : Promise.resolve([]),
        reportSiteId ? prisma.geologicalSeam.findMany({ where: { siteId: reportSiteId } }) : Promise.resolve([]),
        reportSiteId ? prisma.geologicalData.findMany({ where: { siteId: reportSiteId } }) : Promise.resolve([]),
        reportSiteId ? prisma.reserveData.findMany({ where: { siteId: reportSiteId } }) : Promise.resolve([]),
        reportSiteId ? prisma.environmentalData.findMany({ where: { siteId: reportSiteId }, orderBy: { monitoringDate: 'desc' }, take: 20 }) : Promise.resolve([]),
        reportSiteId ? prisma.machinery.findMany({ where: { siteId: reportSiteId } }) : Promise.resolve([]),
        reportSiteId ? prisma.riskItem.findMany({ where: { siteId: reportSiteId, status: 'OPEN' } }) : Promise.resolve([]),
      ])

    // Build report content based on type
    const content = buildReportContent({
      type, period, site,
      productions, seams, geoData, reserves,
      envData, machines, riskItems, uploadedDocuments, extractedFields,
    })

    const report = await prisma.report.create({
      data: {
        title,
        type,
        department,
        siteId:       reportSiteId || null,
        period:       period || null,
        summary:      content.summary,
        content:      JSON.stringify(content),   // SQLite: store as JSON string
        status:       'GENERATED',
        generatedById: req.user.id,
      },
    })

    // Link documents if provided
    if (requestedDocumentIds.length > 0) {
      await prisma.reportDocument.createMany({
        data: requestedDocumentIds.map(docId => ({ reportId: report.id, documentId: docId })),
        skipDuplicates: true,
      })
    }

    res.status(201).json({ report, message: 'Report generated successfully.' })
  } catch (err) { next(err) }
})

// GET /api/reports/:id
router.get('/:id', async (req, res, next) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        generatedBy: { select: { name: true, email: true } },
        site:        true,
        documents:   { include: { document: { select: { originalName: true, status: true } } } },
      },
    })
    if (!report) return res.status(404).json({ error: 'Report not found.' })
    // SQLite: parse content JSON string back to object
    if (report.content && typeof report.content === 'string') {
      try { report.content = JSON.parse(report.content) } catch {}
    }
    res.json({ report })
  } catch (err) { next(err) }
})

// DELETE /api/reports/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.report.delete({ where: { id: req.params.id } })
    res.json({ message: 'Report deleted.' })
  } catch (err) { next(err) }
})

// ── Report content builder ────────────────────────────────────────────
function buildReportContent({ type, period, site, productions, seams, geoData, reserves, envData, machines, riskItems, uploadedDocuments = [], extractedFields = [] }) {
  const now     = new Date().toISOString()
  const siteName = site?.name || 'All Sites'

  const sources = []

  let summary = ''
  let sections = []

  if (type === 'production' || type === 'official') {
    const totalProd = productions.reduce((s, r) => s + r.productionMT, 0)
    summary = `Production report for ${siteName}. Total recorded production: ${totalProd.toFixed(2)} MT across ${productions.length} records.`
    if (productions.length === 0) summary = 'Data not available — no production records found for the selected period.'

    sections.push({
      title: 'Production Summary',
      data: productions.length > 0 ? {
        total:   +totalProd.toFixed(3),
        records: productions.length,
        byYear:  groupByYear(productions),
      } : 'Insufficient source data',
      note: productions.length === 0 ? 'No production data available for this site/period.' : null,
    })

    productions.forEach(r => {
      if (r.sourceDoc) sources.push({ value: `${r.productionMT} MT`, source: r.source, doc: r.sourceDoc, page: r.sourcePage })
    })
  }

  if (type === 'geological') {
    const seamCount = seams.length
    const avgThick  = seams.length ? (seams.reduce((s, x) => s + (x.thickness || 0), 0) / seams.length).toFixed(2) : null
    summary = `Geological report for ${siteName}. ${seamCount} seams identified. Average thickness: ${avgThick ? avgThick + ' m' : 'Data not available'}.`

    sections.push({
      title: 'Geological Overview',
      data: geoData.length > 0 ? geoData : 'Data not available',
    })
    sections.push({
      title: 'Seam Details',
      data: seams.length > 0 ? seams.map(s => ({
        seam: s.seamName, thicknessM: s.thickness, depthM: s.depth,
        grade: s.gradeDesignation, gcv: s.gCV,
        source: s.source, doc: s.sourceDoc, page: s.sourcePage,
      })) : 'Data not available',
    })

    seams.forEach(s => {
      if (s.sourceDoc) sources.push({ value: `Seam ${s.seamName}`, source: s.source, doc: s.sourceDoc, page: s.sourcePage })
    })
  }

  if (type === 'reserve') {
    const totalReserve  = reserves.reduce((s, r) => s + (r.totalReserveMT || 0), 0)
    const mineable      = reserves.reduce((s, r) => s + (r.mineableReserveMT || 0), 0)
    summary = reserves.length > 0
      ? `Reserve report for ${siteName}. Total reserve: ${totalReserve.toFixed(2)} MT, Mineable: ${mineable.toFixed(2)} MT.`
      : 'Insufficient source data — no reserve records found.'

    sections.push({
      title: 'Reserve Data',
      data: reserves.length > 0 ? reserves.map(r => ({
        block: r.blockName, category: r.category,
        totalMT: r.totalReserveMT ?? 'Insufficient source data',
        mineableMT: r.mineableReserveMT ?? 'Insufficient source data',
        status: r.verificationStatus,
        source: r.source, doc: r.sourceDoc, page: r.sourcePage,
      })) : 'Insufficient source data',
    })
  }

  if (type === 'environmental') {
    const nonCompliant = envData.filter(r => r.compliant === false).length
    summary = `Environmental report for ${siteName}. ${envData.length} monitoring records. Non-compliant: ${nonCompliant}.`
    if (envData.length === 0) summary = 'Data not available — no environmental monitoring records found.'

    sections.push({
      title: 'Environmental Monitoring',
      data: envData.length > 0 ? envData.map(r => ({
        date: r.monitoringDate, type: r.paramType, parameter: r.parameter,
        value: r.value, unit: r.unit, standard: r.standard,
        compliant: r.compliant, source: r.source, doc: r.sourceDoc, page: r.sourcePage,
      })) : 'Data not available',
    })
  }

  if (type === 'machinery') {
    const operational = machines.filter(m => m.status === 'OPERATIONAL').length
    summary = `Machinery report for ${siteName}. ${machines.length} machines, ${operational} operational.`
    if (machines.length === 0) summary = 'Data not available — no machinery records found.'

    sections.push({
      title: 'Machinery Status',
      data: machines.length > 0 ? machines.map(m => ({
        id: m.machineId, name: m.name, type: m.type,
        status: m.status, make: m.make, model: m.model,
      })) : 'Data not available',
    })
  }

  if (uploadedDocuments.length > 0) {
    const documentsById = new Map(uploadedDocuments.map(doc => [doc.id, doc]))
    const fieldsByDocument = new Map()
    for (const field of extractedFields) {
      if (!fieldsByDocument.has(field.documentId)) fieldsByDocument.set(field.documentId, [])
      fieldsByDocument.get(field.documentId).push(field)
    }

    const findings = extractedFields.map(field => {
      const doc = documentsById.get(field.documentId)
      return {
        document: doc?.originalName || 'Uploaded document',
        field: field.fieldName,
        value: field.fieldValue,
        confidence: field.confidence,
        page: field.sourcePage,
      }
    })
    sections.unshift({
      title: 'Uploaded Document Findings',
      data: findings.length ? findings : 'Document processed, but no structured fields were extracted.',
      note: 'Values below were extracted from the selected uploaded document(s). Review them against the source before making operational decisions.',
    })

    const documentSummary = uploadedDocuments.map(doc => {
      const count = (fieldsByDocument.get(doc.id) || []).length
      return `${doc.originalName} (${count} extracted fields)`
    }).join('; ')
    summary = summary
      ? `${summary} Uploaded source: ${documentSummary}.`
      : `Report generated from uploaded source: ${documentSummary}.`

    for (const doc of uploadedDocuments) {
      sources.push({ source: 'Uploaded document', doc: doc.originalName })
    }
    for (const field of extractedFields) {
      const doc = documentsById.get(field.documentId)
      sources.push({
        value: `${field.fieldName}: ${field.fieldValue}`,
        source: 'Extracted field',
        doc: doc?.originalName,
        page: field.sourcePage,
      })
    }
  }

  // Risk section for all report types
  if (riskItems.length > 0) {
    sections.push({
      title: 'Active Risks',
      data: riskItems.map(r => ({
        title: r.title, level: r.level, category: r.category,
        severity: r.severity, likelihood: r.likelihood,
      })),
    })
  }

  return {
    generatedAt: now,
    reportType:  type,
    period:      period || 'Not specified',
    site:        site ? { id: site.id, name: site.name, code: site.code } : { name: 'All Sites' },
    summary,
    sections,
    sources,
    disclaimer: 'This report is AI-generated based on available structured data. All values reference source documents where available.',
  }
}

function groupByYear(productions) {
  const map = {}
  for (const r of productions) {
    if (!map[r.year]) map[r.year] = { year: r.year, productionMT: 0 }
    map[r.year].productionMT += r.productionMT
  }
  return Object.values(map).sort((a, b) => a.year - b.year)
}

module.exports = router
