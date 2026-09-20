# Post-Implementation Setup & Deployment Guide

This document specifies the exact configuration instructions required to deploy and operate the production AI financial document intelligence platform.

---

## 1. Gemini API Key Configuration

> [!IMPORTANT]
> The Gemini API key is a private server-side secret. It must **NEVER** be committed to Git, placed in the React client application, included in client environment files, or exposed to the browser.

### Local Development Setup:
* **Project:** `backend`
* **Local File:** `backend/.env` (create from `backend/.env.example`, ignored by Git)
* **Variable:** `GEMINI_API_KEY`
* **Value:** `YOUR_NEW_GEMINI_API_KEY`

```env
# backend/.env
NODE_ENV=development
PORT=8000
GEMINI_API_KEY=YOUR_NEW_GEMINI_API_KEY
GEMINI_EXTRACTION_MODEL=gemini-2.0-flash
GEMINI_FALLBACK_MODEL=gemini-1.5-pro
GEMINI_CHAT_MODEL=gemini-2.0-flash
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_UPLOAD_SIZE_MB=25
REQUEST_TIMEOUT_MS=60000
LOG_LEVEL=info
```

### Production Deployment Setup:
For production (e.g., Vercel Serverless, Google Cloud Run, AWS ECS, or Render), **DO NOT upload or commit `backend/.env`**. Instead, configure `GEMINI_API_KEY` directly in your deployment platform's secure Environment Variables / Secrets dashboard.

---

## 2. React Frontend Backend URL Configuration

### Local Development Setup:
* **Project:** `React` (frontend root)
* **Local File:** `.env.local`
* **Variable:** `VITE_API_BASE_URL`
* **Variable:** `VITE_API_MODE`
* **Value:**

```env
# .env.local (in project root)
VITE_API_MODE=backend
VITE_API_BASE_URL=http://localhost:8000
```

### Production Deployment Setup:
When deploying the React frontend to Vercel, Netlify, Cloudflare Pages, or AWS S3/CloudFront:
* **Project:** `React`
* **Variable:** `VITE_API_BASE_URL`
* **Value:** `https://YOUR-BACKEND-DOMAIN`
* **Variable:** `VITE_API_MODE`
* **Value:** `backend`

---

## 3. Deployment Sequence

1. **Configure Backend Environment**:
   Generate a new Google Gemini API key from Google AI Studio. Set `GEMINI_API_KEY` in `backend/.env` (or in your host provider's Secrets settings).
2. **Deploy Backend Service**:
   Deploy the Node.js TypeScript service located in `backend/`.
3. **Verify Backend Health**:
   Execute `GET https://YOUR-BACKEND-DOMAIN/api/v1/health` to ensure `status: "ok"` and `geminiConfigured: true`.
4. **Configure React Frontend**:
   Set `VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN` in the frontend build environment.
5. **Build and Deploy React Frontend**:
   Run `npm run build` in the root and deploy the resulting `dist/` directory.
6. **Perform End-to-End Verification**:
   Upload a financial PDF in the React UI, inspect the extracted tables, check validation and reconciliation status, converse in document chat, and download the verified `.xlsx` workbook.
