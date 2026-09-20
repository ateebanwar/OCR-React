# Production Financial Document Intelligence Backend Service

High-performance, secure Node.js & TypeScript backend service providing AI document extraction, deterministic financial validation, mathematical reconciliation, canonical dataset compilation, grounded document chat, and authentic `.xlsx` generation & verification.

---

## Architecture Overview

```text
Incoming PDF
     ↓
File Validation & Ingestion (Multer / MIME Verification)
     ↓
Document Inspection (pdf-parse / Structural Density Analysis)
     ↓
AI Extraction (Google GenAI SDK / Gemini 2.0 Flash with 1.5 Pro Fallback)
     ↓
Runtime Schema Validation (Zod GeminiExtractionSchema)
     ↓
Deterministic Structural Validation (DeterministicValidator)
     ↓
Financial Reconciliation Engine (ReconciliationEngine / SafeDecimal)
     ↓
Canonical Dataset (Single Source of Truth)
   /          \
  /            \
 v              v
Document Chat  XLSX Generation (ExcelJS)
                    ↓
               XLSX Read-Back Verification
                    ↓
               Verified File Download
```

---

## Features

1. **Zero Secret Leakage:** The Google Gemini API key is maintained strictly server-side and never exposed to the client or browser.
2. **Deterministic-First Answers:** Queries like "What is the total?", "How many rows?", or "What is the date?" are resolved deterministically with zero hallucination.
3. **Safe Decimal Arithmetic:** Scaled integer arithmetic (`SafeDecimal`) protects all calculations from IEEE-754 floating-point drift.
4. **Mandatory XLSX Read-Back Verification:** Every generated Excel file is parsed back into memory and checked against the Canonical Dataset before download.
5. **Vercel & Serverless Ready:** Built with stateless in-memory sessions and zero heavy database or daemon dependencies.

---

## API Endpoints

### 1. Health Check
* **Route:** `GET /api/v1/health` (also `/health`)
* **Description:** Returns service status and verifies server readiness.

### 2. Document Processing (Single-Turn Pipeline)
* **Route:** `POST /api/v1/documents/process`
* **Content-Type:** `multipart/form-data`
* **Payload:** `file` (PDF document)
* **Description:** Complete end-to-end ingestion, AI extraction, validation, reconciliation, and XLSX verification.

### 3. Step-by-Step Processing (Multi-Step Frontend Integration)
* **Route:** `POST /api/v1/documents/analyze` — Structural inspection and page analysis.
* **Route:** `POST /api/v1/documents/:id/extract` — Structured table extraction.
* **Route:** `POST /api/v1/documents/:id/summary` — Executive financial summary.

### 4. Grounded Document Chat
* **Route:** `POST /api/v1/documents/chat` (also `/api/v1/chat/query` and `/chat/query`)
* **Content-Type:** `application/json`
* **Payload:** `{ documentId: string, question: string, history?: ChatMessage[] }`
* **Description:** Grounded answers referencing verified Canonical Dataset totals and rows.

### 5. Spreadsheet Generation & Verification
* **Route:** `POST /api/v1/spreadsheets/generate` — Generates and downloads verified `.xlsx`.
* **Route:** `POST /api/v1/spreadsheets/verify` — Validates an uploaded spreadsheet buffer against expected dataset.

---

## Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY

# 3. Run development server (with hot reload)
npm run dev

# 4. Run test suite
npm test

# 5. Build for production
npm run build

# 6. Start production server
npm start
```

---

## Deployment to Vercel

1. In the Vercel dashboard, create a new project pointing to the `backend/` directory.
2. In Project Settings → **Environment Variables**, add:
   * `GEMINI_API_KEY`: Your secure Google Gemini API key.
   * `GEMINI_EXTRACTION_MODEL`: `gemini-2.0-flash`
   * `GEMINI_FALLBACK_MODEL`: `gemini-1.5-pro`
   * `GEMINI_CHAT_MODEL`: `gemini-2.0-flash`
   * `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
3. Deploy the backend.
4. Point your React frontend `VITE_API_BASE_URL` to your backend's Vercel deployment URL.
