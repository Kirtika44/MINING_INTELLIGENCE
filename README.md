# MINING INTELLIGENCE
## AI-Powered Coal Mining Intelligence Platform

> From Documents → Verified Data → AI Insights → Automated Reports → Better Mining Decisions

---

## Project Overview

MINING INTELLIGENCE (LANZEY) is an enterprise AI platform built for Indian coal mining companies — CIL, SCCL and their subsidiaries. It transforms unstructured mining documents into actionable intelligence through OCR, AI extraction, Human-in-the-Loop verification, and automated report generation.

---

## Technology Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v3** (styling)
- **React Router v6** (routing)
- **Lucide React** (icons)
- No external UI component library

### Backend
- **Node.js** + **Express.js**
- **Prisma ORM** + **SQLite** (zero-installation database)
- **JWT** authentication
- **bcryptjs** password hashing
- **multer** file uploads
- **pdf-parse**, **xlsx**, **mammoth** (OCR/text extraction)
- **helmet**, **cors**, **express-rate-limit** (security)

---

## Features

- **Landing Page** — mining background, department cards, nav
- **Login** — JWT auth, demo accounts, SSO placeholders
- **Role-Based Dashboards** — 7 departments (CIL, CMPDI, Geological, Environmental, Machinery, Reserve, Admin)
- **Document Processing** — drag-and-drop upload, real OCR pipeline, live status polling
- **OCR & Extraction** — extracted fields with confidence scores, tabs (Info/Tables/Images/Metadata)
- **Human-in-the-Loop (HITL)** — AI validates extracted fields, exceptions flagged, CMPDI approves/rejects per field
- **Knowledge Base** — browse all AI-extracted fields, filter by department/site/field
- **Ask LANZEY** — natural language queries over indexed documents
- **Risk Intelligence** — risk matrix, category breakdown, detail panel
- **Automated Report Generation** — 6 report types with source traceability
- **Report Validation** — AI quality scoring (0–100), approve/reject with reason
- **Admin Dashboard** — user management, report review with inline AI analysis + approve/reject
- **Audit Trail** — full activity log with department/action filters
- **Official Query Assistant** — production trend queries for parliamentary responses

---

## Installation

### Prerequisites
- Node.js 18+
- npm

### 1. Frontend

```bash
cd frontend
npm install
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node src/utils/seed.js
```

---

## Run (Development)

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:4000

Health check: http://localhost:4000/api/health

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Demo Accounts

All accounts use password: `lanzey123`

| Email | Role | Dashboard |
|-------|------|-----------|
| admin@lanzey.in | ADMIN | /dashboard/admin |
| cil@lanzey.in | CIL | /dashboard/cil |
| cmpdi@lanzey.in | CMPDI | /dashboard/cmpdi |
| geo@lanzey.in | GEOLOGICAL | /dashboard/geological |
| env@lanzey.in | ENVIRONMENT | /dashboard/environment |
| mach@lanzey.in | MACHINERY | /dashboard/machinery |
| reserve@lanzey.in | RESERVE_CHECKER | /dashboard/reserve |

---

## Environment Variables

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:4000/api
```

### Backend (`backend/.env`)

```
DATABASE_URL=file:./prisma/lanzey.db
JWT_SECRET=<your-long-random-secret>
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50
```

---

## Production Build

### Frontend

```bash
cd frontend
npm run build
```

Output: `frontend/dist/` — deploy to Vercel, Netlify, or any static host.

### Backend

```bash
cd backend
NODE_ENV=production node src/index.js
```

---

## Deployment

### Recommended: Frontend on Vercel + Backend on Railway/Render

#### Frontend (Vercel)

1. Push to GitHub
2. Import repo on https://vercel.com
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Root directory: `frontend`
7. Add env variable: `VITE_API_URL=https://your-backend-url/api`

#### Backend (Railway)

1. Import repo on https://railway.app
2. Root directory: `backend`
3. Start command: `node src/index.js`
4. Add all env variables from `backend/.env`
5. For SQLite: Railway persists volume — set `DATABASE_URL=file:/data/lanzey.db`

#### Alternative: Single VPS (DigitalOcean, AWS EC2)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend && pm2 start src/index.js --name lanzey-api

# Build and serve frontend
cd frontend && npm run build
# Serve dist/ with nginx or serve package
```

---

## API Routes

```
GET  /api/health
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

GET  /api/sites
GET  /api/documents
POST /api/documents/upload
GET  /api/documents/:id/status

GET  /api/production/summary
GET  /api/production/trend

GET  /api/geology/seams
GET  /api/geology/summary

GET  /api/machinery
GET  /api/machinery/summary
GET  /api/machinery/:id/telemetry

GET  /api/environment
GET  /api/environment/compliance-summary

GET  /api/reserve
GET  /api/reserve/summary

GET  /api/risk
GET  /api/risk/summary

GET  /api/reports
POST /api/reports/generate
GET  /api/reports/:id

POST /api/query
POST /api/query/official

POST /api/validate/:reportId
POST /api/validate/:reportId/approve
POST /api/validate/:reportId/reject

POST /api/hitl/submit/:docId
GET  /api/hitl/:docId
GET  /api/hitl/pending/all
PATCH /api/hitl/:docId/field
PATCH /api/hitl/:docId/approve-all

GET  /api/knowledge
GET  /api/knowledge/summary
GET  /api/knowledge/search
GET  /api/knowledge/document/:docId
GET  /api/knowledge/trend

GET  /api/admin/users
GET  /api/admin/stats
GET  /api/admin/activity
```

---

## Known Limitations

1. OCR for scanned PDFs requires an external service (Tesseract) — currently uses pdf-parse for text PDFs
2. AI field extraction is rule-based (pattern matching), not LLM-based
3. SQLite is sufficient for demo/SIH — production should migrate to PostgreSQL
4. File uploads stored locally — production should use S3/cloud storage

---

## SIH Project Information

- **Project Name**: Mining Intelligence (LANZEY)
- **Problem Statement**: AI-powered document intelligence for coal mining
- **Technology**: React + Node.js + SQLite + Prisma
- **Demo Password**: `lanzey123` (all accounts)
