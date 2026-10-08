# LANZEY — Mining Intelligence

<p align="center">
  <strong>Turn mining documents into verified data, operational insight, and clearer decisions.</strong>
</p>

<p align="center">
  <a href="https://mining-intelligence-urbannova.vercel.app/"><img src="https://img.shields.io/badge/Live_Preview-Vercel-black?logo=vercel" alt="Open the live LANZEY preview"></a>
  <a href="https://github.com/Kirtika44/MINING_INTELLIGENCE"><img src="https://img.shields.io/badge/Source-GitHub-181717?logo=github" alt="View source on GitHub"></a>
  <a href="./Lanzey_SIH_Evaluator_Report.pdf"><img src="https://img.shields.io/badge/Evaluator_Report-PDF-b31b1b" alt="Read the evaluator report"></a>
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel" alt="Deployed on Vercel"></a>
</p>

> **Live preview:** [Open LANZEY](https://mining-intelligence-urbannova.vercel.app/) · [Vercel project](https://vercel.com/urbannova/mining-intelligence)  
> The frontend and backend are deployed on Vercel. The backend health endpoint is [`/api/health`](https://mining-intelligence-api.vercel.app/api/health), and the backend uses managed Neon PostgreSQL.

## Navigate

- [Overview](#overview)
- [Live preview](#live-preview)
- [Features](#features)
- [Architecture and stack](#architecture-and-stack)
- [Quick start](#quick-start)
- [Demo accounts](#demo-accounts)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [API surface](#api-surface)
- [Known limitations](#known-limitations)

## Overview

LANZEY is an AI-assisted mining intelligence platform for Indian coal mining organizations, including CIL, SCCL, and their subsidiaries. It turns unstructured documents into searchable records and reports, with human review and source traceability built into the workflow.

**From documents → verified data → insights → reports → better mining decisions.**

## Live preview

### [🚀 Launch the live preview](https://mining-intelligence-urbannova.vercel.app/)

The production site and API are live and connected. Sign in with a demo account below to explore the dashboards and seeded mine data.

- **Frontend:** [https://mining-intelligence-urbannova.vercel.app](https://mining-intelligence-urbannova.vercel.app/)
- **Alternate Vercel domain:** [https://mining-intelligence-kappa.vercel.app](https://mining-intelligence-kappa.vercel.app/)
- **API health:** [https://mining-intelligence-api.vercel.app/api/health](https://mining-intelligence-api.vercel.app/api/health)
- **Vercel frontend project:** [mining-intelligence](https://vercel.com/urbannova/mining-intelligence)
- **Vercel backend project:** [mining-intelligence-api](https://vercel.com/urbannova/mining-intelligence-api)

Production uses Neon PostgreSQL. The database is seeded with sample users, mine sites, production, geology, reserve, machinery, environment, and risk data. Uploaded files use temporary Vercel function storage; configure durable object storage before relying on long-term file retention.

[Open the Vercel deployment](https://vercel.com/urbannova/mining-intelligence) · [Read the evaluator report](./Lanzey_SIH_Evaluator_Report.pdf)

## Features

- **Department dashboards** for CIL operations, CMPDI, geology, environment, machinery, reserves, and administration
- **Document intake and extraction** for PDFs, scanned images, spreadsheets, and Word documents
- **Human-in-the-loop review** to inspect extracted fields, resolve exceptions, and approve or correct data
- **Knowledge base** with filters and source-document traceability
- **Ask LANZEY** for natural-language questions over indexed mining documents
- **Risk intelligence** with risk levels, trends, and recommended actions
- **Report generation and validation** with review, approval, and export flows
- **Audit trail** for user and system activity
- **Official query assistant** for production-trend questions

<details>
<summary><strong>How the document workflow fits together</strong></summary>

1. Upload a source document.
2. Extract text and identify candidate fields.
3. Review confidence scores and exceptions.
4. Correct or approve fields with a human reviewer.
5. Search verified records, ask questions, and create traceable reports.

</details>

## Architecture and stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Data layer | Prisma ORM; Neon PostgreSQL in production, SQLite for local development |
| Authentication | JWT and bcrypt |
| Document processing | pdf-parse, mammoth, xlsx, and multer |

### Repository layout

- `frontend/` — Vite web application
- `backend/` — Express API, Prisma schema, and seed script
- `.env.example` — example frontend and backend environment settings
- `Lanzey_SIH_Evaluator_Report.pdf` — project evaluator report

## Quick start

**Prerequisites:** Node.js 18 or newer and npm.

### 1. Start the backend

From the repository root:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node src/utils/seed.js
npm run dev
```

The API runs at `http://localhost:4000`; its health endpoint is `http://localhost:4000/api/health`.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

### 3. Point the frontend at the API

Create `frontend/.env` and set:

```env
VITE_API_URL=http://localhost:4000/api
```

For other environment values, see [Environment variables](#environment-variables) and [`.env.example`](./.env.example).

## Demo accounts

<details>
<summary><strong>Show demo credentials</strong></summary>

These demo accounts are seeded in the live Neon database and can be used on the production site. All use password `lanzey123`. The public demo data is illustrative, not authoritative mining data.

| Email | Role |
| --- | --- |
| `admin@lanzey.in` | Admin |
| `cil@lanzey.in` | CIL |
| `cmpdi@lanzey.in` | CMPDI |
| `geo@lanzey.in` | Geological |
| `env@lanzey.in` | Environment |
| `mach@lanzey.in` | Machinery |
| `reserve@lanzey.in` | Reserve checker |

Replace demo credentials and secrets before exposing a real backend to users.

</details>

## Environment variables

The root [`.env.example`](./.env.example) includes these settings:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Frontend | Public base URL for the backend API |
| `DATABASE_URL` | Backend | Prisma database connection (SQLite locally; Neon PostgreSQL in production) |
| `JWT_SECRET` | Backend | Secret used to sign tokens; use a long random value |
| `JWT_EXPIRES_IN` | Backend | Token lifetime |
| `PORT` | Backend | API server port |
| `NODE_ENV` | Backend | Runtime environment |
| `FRONTEND_URL` | Backend | Allowed frontend origin for CORS |
| `UPLOAD_DIR` | Backend | Local upload directory |
| `MAX_FILE_SIZE_MB` | Backend | Maximum upload size |

Do not put backend secrets in Vite variables. Values prefixed with `VITE_` are included in the browser build.

## Deployment

### Frontend on Vercel

The Vercel project is configured for this repository:

- **Project:** [mining-intelligence](https://vercel.com/urbannova/mining-intelligence)
- **Root directory:** `frontend`
- **Framework:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Live production URL:** [mining-intelligence-urbannova.vercel.app](https://mining-intelligence-urbannova.vercel.app/)

The backend is deployed as the `mining-intelligence-api` Express project on Vercel. Its API base URL is `https://mining-intelligence-api.vercel.app/api`; the frontend's `VITE_API_URL` points to this address in Production and Preview.

### Backend

The backend starts with `node src/index.js` (or `npm run dev` locally). Production uses Neon PostgreSQL; local development can use SQLite. Uploaded files are temporarily stored in the Vercel function's temporary filesystem, so they may not persist between invocations. Configure Vercel Blob or another durable object store for persistent uploads. Set local backend values from [`.env.example`](./.env.example).

<details>
<summary><strong>Build the frontend locally</strong></summary>

```bash
cd frontend
npm install
npm run build
```

The generated site is written to `frontend/dist/`.

</details>

## API surface

The Express API is mounted under `/api`. See the backend source for request and response schemas.

<details>
<summary><strong>Show API routes</strong></summary>

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/sites` | List sites |
| GET | `/api/documents` | List documents |
| POST | `/api/documents/upload` | Upload a document |
| GET | `/api/documents/:id/status` | Processing status |
| GET | `/api/production/summary`, `/api/production/trend` | Production summaries and trends |
| GET | `/api/geology/seams`, `/api/geology/summary` | Geological data |
| GET | `/api/machinery`, `/api/machinery/summary` | Machinery records |
| GET | `/api/environment`, `/api/environment/compliance-summary` | Environmental records |
| GET | `/api/reserve`, `/api/reserve/summary` | Reserve records |
| GET | `/api/reports`, `/api/reports/:id` | List and read reports |
| POST | `/api/reports/generate` | Generate a report |
| POST | `/api/query`, `/api/query/official` | Ask LANZEY |
| POST / PATCH | `/api/validate/:reportId` | Validate, approve, or reject a report |
| GET / POST / PATCH | `/api/hitl/*` | Human review workflow |
| GET | `/api/knowledge/*` | Knowledge base |
| GET | `/api/admin/*` | Administration and audit data |

</details>

## Known limitations

- OCR for scanned PDFs needs an external OCR service; the current PDF path handles text PDFs.
- Field extraction is rule-based and should be reviewed by a human.
- Production uses managed Neon PostgreSQL; local development can use SQLite.
- Uploaded files use temporary Vercel function storage and are not durable. Configure Vercel Blob or another object store for long-term retention.
- CIL and Government SSO are demo placeholders and are not configured.

---

<p align="center">
  <a href="https://mining-intelligence-urbannova.vercel.app/"><strong>🚀 Open LANZEY</strong></a>
  &nbsp;·&nbsp;
  <a href="#quick-start"><strong>Run it locally</strong></a>
  &nbsp;·&nbsp;
  <a href="./Lanzey_SIH_Evaluator_Report.pdf"><strong>Read the project report</strong></a>
</p>
