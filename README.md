# DataPilot — AI-Powered Data Intelligence Platform

> **Code Cubicle 6.0 Hackathon · Problem Statement 01**  
> Prompt-Based AI Data Intelligence Platform: Natural Language → Dynamic Workflow Planning → Ingress from Permitted Sources → Cleaning & Imputation → Validation & Deduplication → Source Traceability & Lineage → Centralized Interactive Dashboard → CSV/JSON Export.

---

## 🎯 Problem Statement 01 Alignment

| Problem Statement 01 Goal | DataPilot Implementation |
|---|---|
| **Understand data requirements from NL prompts** | AI Requirement Parser (`requirement_parser.py`) with entity extraction, domain recognition (jobs, market, leads, sales), and OpenAI/Gemini or rule-based NLP modes. |
| **Dynamically design and execute collection workflows** | Dynamic AI Planner (`POST /api/workflows/plan`) previews execution stages prior to launch; automated multi-stage pipeline executes collect → clean → validate → dedup → score → persist. |
| **Collect information from multiple permitted sources** | 4 registered source connectors: **Live Job Openings** (Arbeitnow Open API), **Market & Financial Intelligence** (CoinGecko API), **Tech Leads & Sponsors** (Hacker News Public API), and **Synthetic Demo Connector** (Faker). |
| **Clean, structure, validate, and deduplicate results** | Automated type inference, column-median and standard label null imputation, full-hash duplicate row pruning, and schema constraint checks. |
| **Provide source-backed, traceable data** | Every row carries `_source_url`, `_collected_at`, `_connector`, and `_source_domain`. Dedicated **Source Traceability & Lineage** tab in dataset inspector. |
| **Monitor and manage collection tasks** | Comprehensive Workflow Management (`/workflows`) with live status badges, re-run capability, deletion, and step-by-step timestamped execution traces. |
| **Present results through an interactive dashboard** | Centralized Dashboard (`/`), Interactive Data Grid (`/datasets/:id`) with column sorting, live substring search across all fields, and server-side pagination. |
| **Maintain workflow and dataset history** | Persistent SQLite store with SQLAlchemy ORM models (`workflows`, `datasets`). |
| **Search, filter, and export collected data** | Multi-column search, column header sorting, CSV export (`/api/datasets/{id}/export`), and JSON export (`/api/datasets/{id}/export/json`). |

---

## 🏛️ System Architecture

```
CodeCubicle-DataPilot/
├── backend/                             FastAPI backend (Python 3.12)
│   ├── main.py                          Uvicorn entry point (port 8000)
│   ├── requirements.txt                 Production dependencies
│   ├── .env                             Environment configuration
│   ├── datapilot.db                     Persistent SQLite database
│   └── app/
│       ├── main.py                      FastAPI app factory & CORS
│       ├── core/
│       │   ├── config.py                Pydantic-Settings
│       │   └── database.py              SQLAlchemy 2.0 engine & session
│       ├── models/
│       │   ├── workflow.py              Workflow ORM model & step logs
│       │   └── dataset.py               Dataset ORM model & provenance
│       ├── api/
│       │   ├── health.py                GET /api/health
│       │   ├── workflows.py             POST/GET/DELETE /api/workflows/, plan, rerun, stats
│       │   ├── datasets.py              GET/DELETE /api/datasets/, records, quality, provenance, CSV/JSON
│       │   ├── quality.py               GET /api/quality/overview
│       │   └── connectors.py            GET /api/connectors/
│       ├── services/
│       │   ├── requirement_parser.py    AI/NLP prompt intent extraction
│       │   └── pipeline.py              Pipeline orchestrator (collect→clean→validate→dedup→score→persist)
│       └── connectors/
│           ├── base.py                  BaseConnector ABC & auto-discovery registry
│           ├── jobs_connector.py        Live tech jobs from permitted open API
│           ├── market_connector.py      Real-time financial & crypto market intelligence
│           ├── leads_connector.py       Startup hiring & sponsor opportunities (Hacker News API)
│           └── demo_connector.py        Deterministic synthetic datasets (Faker)
│
└── frontend/                            React 19 + TypeScript + Vite + Tailwind CSS v4
    └── src/
        ├── api.ts                       Full typed Axios client & query interfaces
        ├── App.tsx                      React Router v7 routes
        ├── components/
        │   └── Layout.tsx               Sidebar navigation & live engine status pill
        └── pages/
            ├── DashboardPage.tsx        Executive dashboard with KPI metrics & quick prompt
            ├── NewTaskPage.tsx          AI prompt studio with preset templates & plan preview
            ├── WorkflowsPage.tsx        Workflow management, status filters, logs, & rerun
            ├── DatasetsPage.tsx         Dataset catalog with quality scores & multi-format export
            ├── DatasetDetailPage.tsx    Interactive data explorer, quality audit, lineage, & schema
            ├── DataQualityPage.tsx      Recharts quality distribution & governance protocols
            ├── SourcesPage.tsx          Permitted source directory with live ping health check
            └── SettingsPage.tsx         AI engine configuration & data cleaning rules
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python 3.12+**
- **Node.js 18+** & **npm**

### 2. Backend Setup & Run

```powershell
cd backend
python -m pip install -r requirements.txt
python main.py
```
- API Server: **http://localhost:8000**
- Interactive Swagger Docs: **http://localhost:8000/api/docs**
- Health Endpoint: **http://localhost:8000/api/health**

### 3. Frontend Setup & Run (in a second terminal)

```powershell
cd frontend
npm install
npm run dev
```
- Frontend Web App: **http://localhost:5173**

---

## 🚀 End-to-End Walkthrough

1. Open **http://localhost:5173** in your browser.
2. Click **New Data Task** (or choose a quick preset from the Dashboard):
   - *Example 1 (Jobs)*: `"Collect recent remote AI and Python engineering jobs with salary ranges and required tech skills"`
   - *Example 2 (Market)*: `"Aggregate market cap, volume, and 24h price trends for top digital assets"`
   - *Example 3 (Leads)*: `"Extract startup hiring leads and sponsorship opportunities from tech founders"`
   - *Example 4 (Demo)*: `"Clean sales order transactions, fill missing emails, and deduplicate"`
3. Click **Preview AI Execution Plan** to inspect the multi-stage pipeline design synthesized by the AI.
4. Click **Run End-to-End Workflow** — watch the pipeline collect, clean, validate, score, and persist data in real-time.
5. In **Workflows**, expand any task to inspect the AI parsed intent and step-by-step audit log.
6. In **Datasets**, click **Interactive Explorer & Lineage** on any dataset:
   - Search across all records dynamically.
   - Sort columns ascending/descending.
   - Switch between **Data Explorer**, **Quality Metrics**, **Source Lineage**, and **Schema Inspector**.
   - Download the clean data as **CSV** or **JSON**.
7. Visit **Data Quality** to view the Recharts distribution chart and platform hygiene health index.
8. Visit **Sources** to test live connection latency to registered public endpoints.
