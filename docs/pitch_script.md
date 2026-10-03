# 🎤 DataPilot — Pitch Script (5–7 Minutes)

> **Code Cubicle 6.0 — Problem Statement 01: AI-Powered Data Intelligence Platform**
> Presenter: **Hazique Imam**

---

## 🟢 OPENING — The Hook (30 seconds)

> "Imagine you're a startup founder. You need market data, competitor pricing, job trends, and tech leads — all from different sources, in different formats, with no way to trust the quality. You spend **60% of your time just collecting and cleaning data** before you can even begin analysis.
>
> What if you could just **type what you need in plain English**, and an AI builds the entire pipeline for you — collects, cleans, validates, deduplicates, scores, and delivers production-ready data in seconds?
>
> That's **DataPilot**."

---

## 🔵 THE PROBLEM (45 seconds)

> "The problem statement asked us to build an **AI-Powered Data Intelligence Platform** — and here's why it matters:
>
> 1. **Data is scattered** — job listings on one API, crypto prices on another, tech news on a third. Each has different formats, schemas, rate limits.
>
> 2. **Manual pipelines are fragile** — engineers write custom scripts for every source. When an API changes, everything breaks.
>
> 3. **Quality is invisible** — you get raw data dumps with no way to know: Are there duplicates? Missing fields? Inconsistent formats?
>
> 4. **No traceability** — once data is processed, you lose track of *where* it came from and *how* it was transformed.
>
> These aren't theoretical problems — every data team faces them daily."

---

## 🟣 THE SOLUTION — DataPilot Overview (60 seconds)

> "DataPilot solves all four problems with a single, AI-driven platform. Here's how:
>
> **Step 1: Natural Language Input** — You don't write code. You type a prompt like *'Collect remote Python developer jobs with salary info'* or *'Get top 50 cryptocurrency market data'*.
>
> **Step 2: AI Requirement Parser** — Our NLP engine analyzes your prompt, identifies the data domain, maps it to the right source connector, and extracts parameters like row count, filters, and fields.
>
> **Step 3: Automated 6-Stage Pipeline** — The system executes:
> - **Collect** → pulls from the appropriate API
> - **Clean** → standardizes formats, trims whitespace, fixes types
> - **Validate** → enforces schema rules, flags anomalies
> - **Deduplicate** → removes exact and near-duplicate records
> - **Score** → calculates a composite data quality score (0–100)
> - **Persist** → stores the clean dataset with full metadata
>
> **Step 4: Rich Frontend** — Explore your data with search, sort, pagination, quality charts, source lineage, and one-click CSV/JSON export.
>
> The entire journey — from English prompt to production-ready dataset — takes **under 10 seconds**."

---

## 🟠 LIVE DEMO WALKTHROUGH (90 seconds)

> *[Share screen showing the DataPilot dashboard]*
>
> "Let me walk you through a live demo.
>
> **Dashboard** — Here you see KPIs at a glance: total workflows run, datasets created, average quality score, and active connectors. There's also a quick-prompt bar right here for instant tasks.
>
> **New Task** — I'll click 'New Task' and type: *'Collect 100 remote software engineering jobs with salary and location data'*.
>
> Watch what happens — the AI parser identifies this as the **jobs domain**, selects the **Arbeitnow Live Jobs connector**, sets row count to 100, and generates a **workflow plan** before executing. You can preview the plan before running it.
>
> *[Click Execute]*
>
> **Workflow runs** — You see the 6 pipeline stages executing in real time. Collection... cleaning... validation... dedup... scoring... done. 100 rows collected, quality score: **86 out of 100**.
>
> **Dataset Explorer** — Click into the dataset and you get a full data grid with search and sort. Switch to the **Quality tab** — see the score breakdown: completeness, consistency, uniqueness. The **Lineage tab** shows exactly which API endpoint, what parameters, and timestamps.
>
> **Export** — One click to download as CSV or JSON. Ready for your analytics pipeline or spreadsheet.
>
> That's the full journey — **natural language in, clean data out**."

---

## 🔴 TECHNICAL ARCHITECTURE (60 seconds)

> "Under the hood, DataPilot is a full-stack application:
>
> **Backend**: Python with FastAPI — chosen for async performance and auto-generated API docs. SQLAlchemy ORM with SQLite for rapid development (swappable to PostgreSQL for production).
>
> **Frontend**: React 19 with TypeScript, Vite for blazing-fast builds, and Tailwind CSS v4 for a clean, responsive UI. Recharts for data visualization.
>
> **AI Engine**: Dual-mode requirement parser —
> - **Rule-based NLP** mode: Works offline with zero API costs. Uses keyword scoring, regex extraction, and domain classification. This is our default mode.
> - **LLM mode**: Optional integration with OpenAI/Gemini for complex, ambiguous queries.
>
> **4 Source Connectors** — all using **permitted public APIs** only:
> 1. **Arbeitnow API** — live job listings (no auth required)
> 2. **CoinGecko API** — cryptocurrency market data (free tier)
> 3. **Hacker News API** — tech news, stories, and leads (public)
> 4. **Synthetic Demo** — Faker-based data for testing and demos
>
> Every connector has a **fallback cache** — if the API is down or rate-limited, we serve cached sample data so the platform never fails during a demo or in production.
>
> The architecture is **fully pluggable** — adding a new connector takes about 50 lines of code with our decorator-based registry system."

---

## 🟡 KEY DIFFERENTIATORS (45 seconds)

> "What makes DataPilot different from existing tools?
>
> 1. **Zero-code, NL-driven** — Unlike traditional ETL tools like Airflow or Prefect that require Python DAGs, DataPilot takes plain English. A non-technical user can operate it.
>
> 2. **Built-in quality scoring** — Most platforms give you raw data. We score every dataset on completeness, consistency, and uniqueness — and show you a visual breakdown.
>
> 3. **Source lineage & traceability** — Every record is tracked back to its source API, endpoint, and collection timestamp. Full provenance chain.
>
> 4. **AI workflow planning** — Before execution, the AI generates a plan you can review. Transparency, not a black box.
>
> 5. **Resilient by design** — Fallback caching, graceful error handling, domain-keyword matching. The platform adapts, it doesn't crash."

---

## 🟢 CLOSING — Impact & Vision (30 seconds)

> "DataPilot transforms data collection from a **weeks-long engineering project** into a **10-second conversation**. 
>
> For startups, it means faster market insights. For analysts, it means clean data without writing scripts. For enterprises, it means auditable, traceable data pipelines.
>
> We built this in under a week for Code Cubicle 6.0, and the architecture is designed to scale — more connectors, more AI models, more data domains.
>
> **DataPilot: Just tell it what data you need.**
>
> Thank you. I'm happy to take questions."

---

## ⏱️ TIMING GUIDE

| Section | Target Time | Cumulative |
|---------|------------|------------|
| Opening Hook | 0:30 | 0:30 |
| The Problem | 0:45 | 1:15 |
| Solution Overview | 1:00 | 2:15 |
| Live Demo | 1:30 | 3:45 |
| Technical Architecture | 1:00 | 4:45 |
| Differentiators | 0:45 | 5:30 |
| Closing | 0:30 | 6:00 |

> [!TIP]
> **If time is tight**, shorten the Demo section by just describing it verbally instead of screen-sharing. If you have **extra time**, expand the demo with a second query (e.g., crypto market data).

---

## 📋 PRE-PRESENTATION CHECKLIST

- [ ] Backend server running (`cd backend && python -m uvicorn app.main:create_app --factory --port 8000`)
- [ ] Frontend dev server running (`cd frontend && npm run dev`)
- [ ] Open browser to `http://localhost:5173`
- [ ] Pre-run at least 1 workflow so Dashboard has data
- [ ] Test screen share in your video call app
- [ ] Have this script open on a second monitor/tab
- [ ] Close unnecessary tabs and notifications
- [ ] Good internet connection for live API calls (or use demo connector as backup)
