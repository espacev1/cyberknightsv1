# Cyber Knights — Next-Gen APK Upload and Threat Analysis Platform

A web-based pre-installation Android APK security analysis platform that performs static analysis to detect malware threats and generate transparent risk reports.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `server/data/setup.sql`
3. Copy your project URL, anon key, and service role key

### 2. Configure Environment

**Server** (`server/.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
# Backend
cd server
npm install
node server.js

# Frontend (new terminal)
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`

## Architecture

```
User → React Frontend → Express Backend → Analysis Engine → Supabase
```

**Analysis Pipeline:**
1. APK Upload → Multer validation
2. Manifest Extraction → adm-zip + xml2js
3. Permission Analysis → dangerous permissions classification
4. SHA-256 Hash Scan → malware signature matching
5. URL Extraction → suspicious URL detection
6. API Detection → suspicious Android API scanning
7. Risk Score → `R = (P×5) + (M×40) + (U×10) + (A×8)`
8. Report Generation → stored in Supabase, downloadable as PDF

## Risk Classification

| Score | Classification |
|-------|---------------|
| 0–30 | ✅ Safe |
| 31–60 | ⚠️ Medium Risk |
| 61–100 | 🔴 High Risk |

## Project Structure

```
cyberknightss/
├── client/           # Vite + React Frontend
│   └── src/
│       ├── components/  (Navbar, FileUploader, RiskGauge, ProtectedRoute)
│       ├── pages/       (Landing, Login, Signup, Dashboard, Upload, Report, History, Admin)
│       ├── services/    (API layer)
│       └── context/     (AuthContext)
├── server/           # Node.js + Express Backend
│   ├── routes/       (scan, admin)
│   ├── services/     (manifestExtractor, permissionAnalyzer, hashScanner, urlExtractor, apiDetector, riskEngine, reportGenerator)
│   ├── middleware/   (auth, upload)
│   └── data/         (seed data, SQL setup)
```
