# LANZEY — Mining Intelligence

<p align="center">
  <strong>Turn mining documents into verified data, operational insight, and clearer decisions.</strong>
</p>

<p align="center">
  <a href="https://mining-intelligence-urbannova.vercel.app/"><img src="https://img.shields.io/badge/🚀_Open_Live_Preview-Vercel-black?logo=vercel" alt="Open the live LANZEY preview"></a>
  <a href="https://github.com/Kirtika44/MINING_INTELLIGENCE"><img src="https://img.shields.io/badge/Source-GitHub-181717?logo=github" alt="View source on GitHub"></a>
  <a href="./Lanzey_SIH_Evaluator_Report.pdf"><img src="https://img.shields.io/badge/📄_Evaluator_Report-PDF-b31b1b" alt="Read the evaluator report"></a>
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel" alt="Deployed on Vercel"></a>
</p>

> **Live preview:** [Open LANZEY](https://mining-intelligence-urbannova.vercel.app/) · [Vercel project](https://vercel.com/urbannova/mining-intelligence)  
> The current deployment hosts the frontend. Login and data workflows need a separately hosted backend and a configured `VITE_API_URL`; those backend services are not part of this live preview yet.

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

The landing page is live on Vercel. The GitHub repository is connected to the Vercel project, so new commits can trigger deployments.

For a full end-to-end demo, deploy the backend separately and set `VITE_API_URL` in the Vercel project to its HTTPS API base URL (for example, `https://your-api.example.com/api`). Until then, authentication, uploads, dashboards, and other API-backed flows will not work on the live site.

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
| Data layer | Prisma ORM with SQLite for the demo |
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

These accounts are for a seeded local/demo database. They are not a working login for the current Vercel preview until a backend is deployed and connected.

All demo accounts use password `lanzey123`.

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
| `DATABASE_URL` | Backend | SQLite database location |
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
- **Production preview:** [mining-intelligence-urbannova.vercel.app](https://mining-intelligence-urbannova.vercel.app/)

To enable API-backed features, deploy the backend to a host that supports the Express server and persistent storage, then set `VITE_API_URL` in Vercel to the backend's HTTPS API URL and redeploy.

### Backend

The backend starts with `node src/index.js` (or `npm run dev` for local development). The demo uses SQLite and stores uploaded files locally. For a production backend, use durable database and file storage and set the backend environment variables from [`.env.example`](./.env.example).

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
| GET / POST | `/api/documents` | List and upload documents |
| GET | `/api/documents/:id/status` | Processing status |
| GET | `/api/production/*` | Production records and trends |
| GET | `/api/geology/*` | Geological data and seams |
| GET | `/api/machinery/*` | Machinery and telemetry |
| GET | `/api/environment/*` | Environmental records |
| GET | `/api/reserve/*` | Reserve records |
| GET / POST | `/api/reports` | List and generate reports |
| GET / POST | `/api/query` | Ask LANZEY |
| GET / PATCH | `/api/hitl/*` | Human review workflow |
| GET | `/api/knowledge/*` | Knowledge base |
| GET | `/api/admin/*` | Administration and audit data |

</details>

## Known limitations

- OCR for scanned PDFs needs an external OCR service; the current PDF path handles text PDFs.
- Field extraction is rule-based and should be reviewed by a human.
- SQLite and local file uploads are suitable for a demo, not a multi-instance production deployment.
- The current Vercel deployment is frontend-only until a backend URL is configured.

---

<p align="center">
  <a href="https://mining-intelligence-urbannova.vercel.app/"><strong>🚀 Open LANZEY</strong></a>
  &nbsp;·&nbsp;
  <a href="#quick-start"><strong>Run it locally</strong></a>
  &nbsp;·&nbsp;
  <a href="./Lanzey_SIH_Evaluator_Report.pdf"><strong>Read the project report</strong></a>
</p>
