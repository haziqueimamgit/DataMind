# ❓ DataPilot — Q&A Preparation Guide

> **Code Cubicle 6.0 — Online Round | Anticipated Questions & Answers**

---

## 🔴 HIGH PROBABILITY — Expect These Questions

### Q1: "Why didn't you use web scraping? Wouldn't that give you more data?"

> **Answer:**
> "Great question. We deliberately chose **not** to use web scraping for three reasons:
>
> 1. **Legal compliance** — Scraping violates most sites' Terms of Service and robots.txt. For a production platform, that's a liability.
> 2. **Reliability** — Scraped data breaks when HTML changes. APIs provide structured, versioned responses.
> 3. **Ethics** — The problem statement emphasizes *responsible* data collection. We use only **permitted public APIs** — Arbeitnow (no auth), CoinGecko (free tier), and Hacker News (public Firebase API).
>
> We get structured, reliable, and legally clean data. That's a better foundation than fragile scrapers."

---

### Q2: "How does your AI parser work without calling OpenAI or any LLM?"

> **Answer:**
> "Our default mode is **rule-based NLP** — no external API calls needed. Here's how it works:
>
> 1. **Keyword scoring** — We maintain domain-specific keyword dictionaries (jobs, market, tech, demo). Each word in the user's prompt is scored against these dictionaries.
> 2. **Regex extraction** — We extract numerical parameters like row count using regex patterns (e.g., 'collect 100' → count=100).
> 3. **Domain classification** — The highest-scoring domain wins, and we map it to the appropriate connector.
> 4. **Confidence scoring** — We calculate how confident the parser is in its classification. Low confidence triggers a fallback to the demo connector.
>
> This gives us **zero-latency, zero-cost** parsing that works offline. We *also* support optional OpenAI/Gemini integration for complex ambiguous queries — it's a config toggle."

---

### Q3: "What makes this different from existing ETL tools like Airflow, Prefect, or Fivetran?"

> **Answer:**
> "Three fundamental differences:
>
> 1. **Natural language interface** — Airflow requires Python DAGs, Prefect requires flow decorators, Fivetran requires connector configuration. DataPilot takes a single English sentence.
> 2. **Built-in quality scoring** — ETL tools move data, they don't assess it. We calculate completeness, consistency, and uniqueness scores for every dataset.
> 3. **Target user** — ETL tools are built for data engineers. DataPilot is built for **anyone** — a product manager, a startup founder, an analyst — who needs clean data without writing code.
>
> We're not replacing Airflow for 500-table enterprise migrations. We're solving the '**I just need clean data quickly**' problem."

---

### Q4: "Is this scalable? SQLite won't work in production."

> **Answer:**
> "Absolutely right — SQLite is our development choice for rapid prototyping. But the architecture is **designed for swappability**:
>
> - Our database layer uses **SQLAlchemy ORM** — switching to PostgreSQL or MySQL is a single config change (`DATABASE_URL` environment variable). No code changes needed.
> - Our connector system uses a **registry pattern with decorators** — adding a new connector is ~50 lines of code, plug it in, it auto-registers.
> - FastAPI is **async-native** — it can handle concurrent requests and can be deployed behind Uvicorn workers or Gunicorn.
> - For heavy scale, we'd add a **task queue** (Celery/RQ) for pipeline execution and a **Redis cache** for connector results.
>
> The foundation is production-ready; we chose lightweight tools for the hackathon timeline."

---

### Q5: "How do you handle API rate limiting?"

> **Answer:**
> "Every connector has a **multi-layer resilience strategy**:
>
> 1. **Timeout management** — We use `httpx` with configurable timeouts (10 seconds default). No hanging requests.
> 2. **Fallback caching** — If an API call fails (rate limit, timeout, 500 error), we serve **pre-cached sample data**. The platform never crashes — the user gets data and a flag saying 'fallback data used'.
> 3. **Graceful degradation** — We limit request sizes (e.g., max 200 rows per call) to stay within free tier limits.
> 4. **Error propagation** — Pipeline stages log errors but don't halt. If collection gets 80 rows instead of 100, we proceed with 80 and report it.
>
> In production, we'd add exponential backoff and proper Redis-based rate tracking."

---

### Q6: "Walk me through the data quality scoring — how is the score calculated?"

> **Answer:**
> "Our quality score is a **composite of three metrics**, each scored 0–100:
>
> 1. **Completeness** (weight: 40%) — What percentage of cells in the dataset are non-null? If 95 out of 100 cells have values, completeness = 95.
> 2. **Consistency** (weight: 30%) — Are data types consistent within columns? E.g., is a 'salary' column all numeric, or are there string values mixed in?
> 3. **Uniqueness** (weight: 30%) — What's the duplicate ratio? After deduplication, we measure how many unique records remain vs. the original count.
>
> Final score = `0.4 × completeness + 0.3 × consistency + 0.3 × uniqueness`
>
> A score above 80 is green (good), 60–80 is yellow (acceptable), below 60 is red (needs attention). This is visible in both the dataset detail page and the quality overview dashboard."

---

### Q7: "Can you show us the code for [specific component]?"

> **Answer (be ready to navigate to these files):**
> - **AI Parser**: `backend/app/services/requirement_parser.py` — show the keyword dictionaries and `parse()` method
> - **Pipeline**: `backend/app/services/pipeline.py` — show the 6-stage `run()` method
> - **Connector example**: `backend/app/connectors/jobs_connector.py` — show how clean a connector implementation is (~60 lines)
> - **Registry pattern**: `backend/app/connectors/base.py` — show the `@register_connector` decorator
> - **Frontend API**: `frontend/src/api.ts` — show the typed API client
> - **Dataset Explorer**: `frontend/src/pages/DatasetDetailPage.tsx` — show the 4-tab layout

---

## 🟡 MEDIUM PROBABILITY — Be Prepared

### Q8: "What about data privacy and security?"

> **Answer:**
> "We take this seriously:
> - All data sources are **public APIs** — no personal data, no PII scraping
> - Our synthetic demo connector uses **Faker** to generate realistic but entirely fake data — labeled clearly as synthetic
> - Data is stored locally in SQLite — no cloud transmission unless the user deploys it that way
> - API keys (if used for LLM mode) are stored in `.env` files, excluded from git via `.gitignore`
> - In production, we'd add authentication (JWT), RBAC, and encryption at rest"

---

### Q9: "Why FastAPI and not Django or Flask?"

> **Answer:**
> "Three reasons:
> 1. **Async support** — FastAPI is built on Starlette and is natively async. Our API connectors make HTTP calls — async means we don't block while waiting for external APIs.
> 2. **Auto-documentation** — FastAPI generates OpenAPI/Swagger docs automatically at `/docs`. Great for development and judge review.
> 3. **Type safety** — FastAPI uses Pydantic models for request/response validation. We catch type errors at the API boundary, not deep in business logic.
>
> Django is great for full-featured web apps, but for a **REST API backend**, FastAPI is faster to develop and performs better."

---

### Q10: "Why React + TypeScript instead of plain JavaScript?"

> **Answer:**
> "TypeScript gives us **compile-time safety** for our API interfaces. Our frontend talks to 10+ backend endpoints — each with different request/response shapes. TypeScript catches mismatches at build time, not at runtime in production. Plus, our `api.ts` file has fully typed interfaces for every data structure — Workflow, Dataset, QualityMetrics — which makes the code self-documenting."

---

### Q11: "How do you handle errors in the pipeline? What if one stage fails?"

> **Answer:**
> "Each pipeline stage is wrapped in error handling:
> - If **collection fails** — we check for fallback cache data. If available, proceed with cached data and log a warning.
> - If **cleaning/validation fails** — we pass through the raw data with an error flag. The workflow status shows 'completed with warnings'.
> - If **any stage crashes** — the pipeline catches the exception, logs the full traceback in the workflow's `steps_log`, sets status to 'failed', and returns the error to the user.
>
> The user can then **rerun** the workflow from the UI — we have a dedicated rerun endpoint that clones the configuration and tries again."

---

### Q12: "How many APIs are you using? Why these specific ones?"

> **Answer:**
> "We use **3 live APIs + 1 synthetic source**:
>
> | Source | API | Why |
> |--------|-----|-----|
> | Jobs | Arbeitnow | No auth required, returns structured JSON, diverse job data |
> | Market | CoinGecko | Free tier, real-time crypto data, good for demonstrating market intelligence |
> | Tech Leads | Hacker News (Firebase) | Fully public, high-quality tech stories, good for trend analysis |
> | Demo | Faker (local) | Generates any domain's synthetic data for testing without API calls |
>
> We chose APIs that are **free, reliable, require no API keys**, and cover diverse data domains to showcase the platform's versatility."

---

### Q13: "What would you add if you had more time?"

> **Answer:**
> "Our roadmap includes:
> 1. **Scheduled pipelines** — cron-based recurring data collection (e.g., 'collect market data every 6 hours')
> 2. **Data transformation layer** — let users define custom cleaning rules in natural language
> 3. **Collaborative features** — team workspaces, shared datasets, role-based access
> 4. **More connectors** — GitHub API, Twitter/X API, weather data, stock market
> 5. **Advanced AI** — anomaly detection on collected data, predictive quality scoring
> 6. **Export integrations** — direct push to Google Sheets, Notion, or S3
>
> The pluggable architecture means each of these is an incremental addition, not a rewrite."

---

## 🟢 LOWER PROBABILITY — But Good to Know

### Q14: "How does the deduplication work?"

> "We compute a **hash fingerprint** for each row based on key columns. Exact duplicates (identical hashes) are removed, keeping the first occurrence. For near-duplicates, we compare string similarity on text fields using normalized values. This runs as stage 4 of the pipeline, after cleaning and validation."

### Q15: "Can multiple users use this simultaneously?"

> "The current implementation is single-user with SQLite. For multi-user, we'd switch to PostgreSQL (one config change), add JWT authentication, and use connection pooling. The API architecture is already stateless and request-scoped, so it scales horizontally."

### Q16: "Why not use a NoSQL database?"

> "Our data has **structured schemas** — workflows have defined fields, datasets have consistent columns. SQL gives us relational integrity (workflow → dataset foreign keys), ACID transactions, and powerful queries. For unstructured data scenarios, we'd add MongoDB alongside, not replace SQL."

### Q17: "How did you test this?"

> "We have **FastAPI TestClient tests** for all API endpoints — workflows CRUD, datasets CRUD, quality endpoints, connector listing. Each test creates data, verifies response codes and JSON structure, and tests edge cases. We also manually tested end-to-end flows through the UI during development."

### Q18: "What's the latency of the pipeline?"

> "For 100 rows: typically **3–8 seconds** end-to-end, depending on the source API's response time. The pipeline stages themselves (clean, validate, dedup, score) add about 200–500ms total. The bottleneck is always the external API call. Our fallback cache responses are near-instant (~50ms)."

---

## 🎯 GENERAL TIPS FOR THE Q&A

> [!IMPORTANT]
> ### Do's
> - **Be honest** — If you don't know something, say "That's a great point, I haven't implemented that yet, but here's how I'd approach it..."
> - **Be concise** — Aim for 30–60 second answers. Don't ramble.
> - **Bridge to strengths** — If asked about a weakness, acknowledge it and pivot to what you *did* build well.
> - **Use numbers** — "6-stage pipeline", "4 connectors", "quality score 0–100", "under 10 seconds". Numbers are memorable.
> - **Show enthusiasm** — You built this. Be proud of it.

> [!WARNING]
> ### Don'ts
> - Don't **make up features** you didn't build
> - Don't **get defensive** about design choices — explain the tradeoff
> - Don't say **"it's just a hackathon project"** — frame it as a solid MVP with a clear roadmap
> - Don't **read from notes** during Q&A — know these answers, don't read them
