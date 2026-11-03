# Secure Guard (Social Guard)

> **Understand. Detect. Protect.**
> An enterprise-grade, zero-knowledge social media cybersecurity platform engineered to assess behavioral security posture, analyze emerging phishing threats, and educate users on account safeguarding.

---

## 🌟 Key Features

* **14-Domain Deterministic Risk Engine**: Computes weighted scores across 7 security categories:
  * Password Security (20%)
  * Multi-Factor Authentication (20%)
  * Phishing Awareness (20%)
  * Privacy Exposure (15%)
  * Third-Party Applications (10%)
  * Recovery Security (10%)
  * Security Awareness (5%)
* **Phishing Simulator Lab**: Interactive simulations exposing fake copyright appeals, urgency traps, and OAuth authorization scams.
* **Security Awareness & Training Modules**: Bite-sized interactive training courses with integrated knowledge evaluation quizzes.
* **Client-Side Zero-Knowledge Password Analyzer**: Evaluates password entropy, length, character diversity, and estimated crack time without sending credentials across the network.
* **Heuristics URL Threat Analyzer**: Detects typosquatting, direct IP hostnames, known URL shorteners, and brand impersonation.
* **Platform-Specific MFA Checklists**: Step-by-step verification checklists for Instagram, Facebook, X, LinkedIn, WhatsApp, and generic accounts.
* **Incident Reporting & Management**: End-to-end incident logging, severity triage, and administrative status resolution.
* **Full Administrative Portal**: Live analytics on registered users, risk distribution, incident tickets, and platform feedback.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
* **Backend**: Node.js, Fastify, TypeScript, Zod, Helmet, Rate Limiting
* **Database**: Supabase PostgreSQL with Row Level Security (RLS) & Audit Event Logging
* **Deployment**: Vercel Serverless Functions & Static Edge Hosting

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* npm

### Installation

1. **Clone repository**:
   ```bash
   git clone https://github.com/samruddhiderle80-coder/secure_guard.git
   cd secure_guard
   ```

2. **Install all dependencies**:
   ```bash
   npm run postinstall
   ```

3. **Set up Environment Variables**:
   In `backend/.env`:
   ```env
   PORT=3001
   HOST=0.0.0.0
   CORS_ORIGIN=http://localhost:5173
   DATABASE_URL=your_supabase_postgresql_url
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=development
   ```

   In `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:3001
   ```

4. **Run locally**:
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173`
   * Backend API: `http://localhost:3001`

---

## ☁️ Deployment on Vercel

This repository is pre-configured with [`vercel.json`](./vercel.json) and [`api/index.js`](./api/index.js) for unified full-stack serverless deployment on Vercel.

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Configure environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV=production`).
3. Deploy!

# secure_guard
