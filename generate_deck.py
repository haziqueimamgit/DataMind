"""
DataPilot – Professional Presentation Deck Generator
Generates a 12-slide 16:9 widescreen presentation for Code Cubicle 6.0 Problem Statement 01.
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# ── Color Palette ─────────────────────────────────────────────────────────────
BG_COLOR       = RGBColor(15, 23, 42)      # #0F172A Slate 900
CARD_BG        = RGBColor(30, 41, 59)      # #1E293B Slate 800
CARD_BORDER    = RGBColor(51, 65, 85)      # #334155 Slate 700
ACCENT_PRIMARY = RGBColor(99, 102, 241)    # #6366F1 Indigo
ACCENT_CYAN    = RGBColor(6, 182, 212)     # #06B6D4 Cyan
ACCENT_SUCCESS = RGBColor(16, 185, 129)    # #10B981 Emerald
TEXT_WHITE     = RGBColor(248, 250, 252)   # #F8FAFC
TEXT_MUTED     = RGBColor(148, 163, 184)   # #94A3B8
TEXT_DARK      = RGBColor(203, 213, 225)   # #CBD5E1

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

def create_base_slide():
    slide = prs.slides.add_slide(blank_layout)
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_COLOR
    bg.line.fill.background()
    return slide

def add_header(slide, title_text, category_text="CODE CUBICLE 6.0 · PROBLEM STATEMENT 01"):
    # Category tag
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.4))
    tf_c = cat_box.text_frame
    tf_c.word_wrap = True
    p_c = tf_c.paragraphs[0]
    p_c.text = category_text.upper()
    p_c.font.size = Pt(10)
    p_c.font.bold = True
    p_c.font.color.rgb = ACCENT_PRIMARY

    # Title
    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.8))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.size = Pt(24)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE

def add_card(slide, left, top, width, height, title, body_bullets, accent_color=ACCENT_PRIMARY):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = CARD_BORDER
    card.line.width = Pt(1)

    # Accent top line
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = accent_color
    top_bar.line.fill.background()

    tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), height - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.size = Pt(15)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE
    p0.space_after = Pt(10)

    for item in body_bullets:
        p = tf.add_paragraph()
        p.text = f"•  {item}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(6)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1: Title Slide
# ══════════════════════════════════════════════════════════════════════════════
s1 = create_base_slide()

# Hero glow box
glow = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.5), Inches(1.2), Inches(10.3), Inches(5.1))
glow.fill.solid()
glow.fill.fore_color.rgb = CARD_BG
glow.line.color.rgb = ACCENT_PRIMARY
glow.line.width = Pt(1.5)

tb1 = s1.shapes.add_textbox(Inches(2.0), Inches(1.6), Inches(9.3), Inches(4.3))
tf1 = tb1.text_frame
tf1.word_wrap = True

p = tf1.paragraphs[0]
p.text = "CODE CUBICLE 6.0 HACKATHON · PROBLEM STATEMENT 01"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = ACCENT_CYAN
p.space_after = Pt(14)

p2 = tf1.add_paragraph()
p2.text = "DataPilot"
p2.font.size = Pt(44)
p2.font.bold = True
p2.font.color.rgb = TEXT_WHITE

p3 = tf1.add_paragraph()
p3.text = "AI-Powered Data Intelligence Platform"
p3.font.size = Pt(22)
p3.font.color.rgb = ACCENT_PRIMARY
p3.space_after = Pt(18)

p4 = tf1.add_paragraph()
p4.text = "Autonomous Prompt-to-Dataset Pipeline · Ingress from Permitted Sources · AI Workflow Planning · Real-Time Cleaning, Deduplication & Source Lineage"
p4.font.size = Pt(13)
p4.font.color.rgb = TEXT_DARK
p4.space_after = Pt(26)

p5 = tf1.add_paragraph()
p5.text = "Author: Hazique Imam  |  GitHub: github.com/haziqueimamgit/CodeCubicle-DataPilot"
p5.font.size = Pt(12)
p5.font.bold = True
p5.font.color.rgb = ACCENT_SUCCESS

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2: Problem & Challenge
# ══════════════════════════════════════════════════════════════════════════════
s2 = create_base_slide()
add_header(s2, "The Challenge: Manual & Fragmented Data Ingress")

add_card(s2, Inches(0.8), Inches(1.7), Inches(3.6), Inches(4.9),
    "1. The Business Bottleneck",
    [
        "Organizations constantly need specialized data: live tech jobs, sales leads, sponsor calls, and market metrics.",
        "Engineers build custom, ad-hoc scrapers for each new request.",
        "High maintenance cost when schemas change or targets update.",
        "Non-technical teams face friction and multi-day delays."
    ],
    ACCENT_PRIMARY
)

add_card(s2, Inches(4.8), Inches(1.7), Inches(3.6), Inches(4.9),
    "2. Data Quality & Trust Deficit",
    [
        "Raw collected data is plagued with duplicates and missing values.",
        "No standardized validation or schema enforcement.",
        "Missing provenance: impossible to audit where a specific data point originated.",
        "Lack of source compliance (robots.txt, rate limits, permitted terms)."
    ],
    ACCENT_CYAN
)

add_card(s2, Inches(8.8), Inches(1.7), Inches(3.7), Inches(4.9),
    "3. The DataPilot Objective",
    [
        "Zero-code natural language interface: type what you need in plain English.",
        "AI dynamically designs the collection & cleaning workflow.",
        "Multi-source ingress strictly from permitted, public endpoints.",
        "End-to-end provenance: every row is source-traceable and verifiable."
    ],
    ACCENT_SUCCESS
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3: System Solution & Architecture
# ══════════════════════════════════════════════════════════════════════════════
s3 = create_base_slide()
add_header(s3, "Architecture: End-to-End Intelligence Pipeline")

add_card(s3, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.9),
    "Modern Full-Stack Architecture",
    [
        "Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4.",
        "Data State Management: TanStack React Query with auto-invalidation.",
        "Backend Engine: FastAPI 0.115 (Python 3.12) async microservices.",
        "Data Processing: Pandas 2.2 for vectorize cleaning and statistical imputation.",
        "Persistence & Audit: SQLAlchemy 2.0 ORM with local zero-config SQLite store.",
        "Data Visualization: Recharts dynamic distribution charting."
    ],
    ACCENT_PRIMARY
)

add_card(s3, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9),
    "6-Stage Pipeline Execution Flow",
    [
        "Stage 1: Intent Understanding (AI parses domain, limit, columns & constraints).",
        "Stage 2: Permitted Ingress (connects to live API or synthetic source).",
        "Stage 3: Data Cleaning (type-aware median/standard imputation).",
        "Stage 4: Validation (schema enforcement & anomaly flagging).",
        "Stage 5: Deduplication (cryptographic row entity hash pruning).",
        "Stage 6: Persistence & Lineage (dataset metadata, schema & CSV/JSON export)."
    ],
    ACCENT_SUCCESS
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4: AI Intent Parser & Dynamic Planner
# ══════════════════════════════════════════════════════════════════════════════
s4 = create_base_slide()
add_header(s4, "AI Intent Understanding & Dynamic Planner")

add_card(s4, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.9),
    "Dual-Mode Requirement Parser",
    [
        "High-Accuracy Rule-Based NLP: Zero API key dependency, instant offline execution, extracts entities and constraints.",
        "LLM Mode (OpenAI / Gemini): Structured JSON schema extraction for ambiguous and conversational user requests.",
        "Domain Classifier: Detects jobs, financial market, leads, sponsors, sales, customers, products, and HR entities.",
        "Auto Connector Resolution: Dynamically assigns the optimal data source without manual user configuration."
    ],
    ACCENT_CYAN
)

add_card(s4, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9),
    "Dynamic AI Workflow Planner (POST /plan)",
    [
        "Generates a multi-stage execution plan before running.",
        "Allows users to inspect estimated record counts, target domain, and planned operations.",
        "Displays planned stages: Intent → Ingress → Imputation → Validation → Deduplication → Scoring → Persistence.",
        "Gives users complete transparency into AI reasoning prior to pipeline execution."
    ],
    ACCENT_PRIMARY
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5: Multi-Source Permitted Ingress
# ══════════════════════════════════════════════════════════════════════════════
s5 = create_base_slide()
add_header(s5, "Multi-Source Ingress: 4 Permitted Connectors")

add_card(s5, Inches(0.8), Inches(1.7), Inches(2.7), Inches(4.9),
    "Live Job Openings",
    [
        "Connector: 'jobs'",
        "Sources: Arbeitnow & RemoteOK Open APIs.",
        "Ingress: Real tech roles, salaries, required tech stacks, locations.",
        "100% permitted public access with offline fallback."
    ],
    ACCENT_SUCCESS
)

add_card(s5, Inches(3.8), Inches(1.7), Inches(2.7), Inches(4.9),
    "Market Intelligence",
    [
        "Connector: 'crypto_market'",
        "Source: CoinGecko Public API.",
        "Ingress: Live valuations, 24h trading volumes, market caps, price changes.",
        "Direct verified verification URLs."
    ],
    ACCENT_PRIMARY
)

add_card(s5, Inches(6.8), Inches(1.7), Inches(2.7), Inches(4.9),
    "Tech Leads & Sponsors",
    [
        "Connector: 'hn_leads'",
        "Source: Hacker News Official API.",
        "Ingress: Startup hiring leads, founder partnerships, sponsor threads.",
        "Direct discussion thread traceability."
    ],
    ACCENT_CYAN
)

add_card(s5, Inches(9.8), Inches(1.7), Inches(2.7), Inches(4.9),
    "Synthetic Demo Engine",
    [
        "Connector: 'demo'",
        "Engine: Faker 30.1.",
        "Covers 7 domains: Sales, Customers, Products, Employees, Jobs, Market, Leads.",
        "Seeded with anomalies to test pipeline cleaning."
    ],
    CARD_BORDER
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 6: Automated Cleaning & Quality Scoring
# ══════════════════════════════════════════════════════════════════════════════
s6 = create_base_slide()
add_header(s6, "Data Quality, Imputation & Hygiene Scoring")

add_card(s6, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.9),
    "Data Cleaning & Hygiene Pipeline",
    [
        "Missing Value Imputation: Numeric fields imputed using column median (robust to outliers); strings standardized.",
        "Full-Hash Deduplication: Prunes identical entity records to eliminate multi-source overlap.",
        "Type & Schema Enforcement: Validates data types, lengths, and nullability constraints.",
        "Audit Event Log: Every operation logs exact records modified with microsecond timestamps."
    ],
    ACCENT_PRIMARY
)

add_card(s6, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9),
    "Composite Quality Score Formula (0-100)",
    [
        "Completeness Index: Proportion of non-null fields post-cleaning (0-100%).",
        "Uniqueness Index: Ratio of distinct unique entity records (0-100%).",
        "Validity Index: Conformity to inferred schema & character length bounds.",
        "Weighted Quality Index: Penalizes null repairs (-30 max), duplicate removals (-20 max), and schema issues (-10 max).",
        "System-wide analytics displayed via interactive Recharts bar graphs."
    ],
    ACCENT_SUCCESS
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 7: Source Traceability & Lineage
# ══════════════════════════════════════════════════════════════════════════════
s7 = create_base_slide()
add_header(s7, "Source Traceability & Lineage Guarantee")

add_card(s7, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.9),
    "Row-Level Lineage Metadata",
    [
        "_source_url: Direct clickable link to the originating posting or entity.",
        "_collected_at: ISO 8601 UTC timestamp of ingress.",
        "_connector: Identity of the connector responsible for retrieval.",
        "_source_domain: Originating domain (e.g. arbeitnow.com, coingecko.com).",
        "Auditable Lineage: Every row in the interactive table is clickable to its source."
    ],
    ACCENT_CYAN
)

add_card(s7, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9),
    "Governance & Permitted Data Compliance",
    [
        "Synthetic Data Transparency: All demo records explicitly tagged with 🧪 Demo label.",
        "Permitted Source Badging: Live API datasets stamped with 🌐 Permitted Source badge.",
        "Compliance Audit: Strict respect for robots.txt, public rate limits, and API headers.",
        "Provenance Tab: Displays triggering user prompt, workflow ID, and licensing notice."
    ],
    ACCENT_PRIMARY
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 8: Interactive Dashboard & UI
# ══════════════════════════════════════════════════════════════════════════════
s8 = create_base_slide()
add_header(s8, "Interactive User Interface & Tooling")

add_card(s8, Inches(0.8), Inches(1.7), Inches(3.6), Inches(4.9),
    "1. Command Center & Studio",
    [
        "Executive Dashboard: Real-time KPIs, active connectors, quality index, and quick prompt bar.",
        "New Task Studio: Natural language requirement editor, preset template chips, and live AI plan preview.",
        "Dark Modern UI: Tailored dark theme using Tailwind CSS v4."
    ],
    ACCENT_PRIMARY
)

add_card(s8, Inches(4.8), Inches(1.7), Inches(3.6), Inches(4.9),
    "2. Workflow Management",
    [
        "Full Audit History: Step-by-step pipeline log with success/warning/error badges.",
        "Task Management: Filter by status (Completed, Running, Failed), search by prompt.",
        "Re-Run & Delete: One-click pipeline re-execution and dataset cleanup."
    ],
    ACCENT_CYAN
)

add_card(s8, Inches(8.8), Inches(1.7), Inches(3.7), Inches(4.9),
    "3. Interactive Data Explorer",
    [
        "Data Grid: Live search across all columns, header sorting, and pagination.",
        "Quality Tab: Completeness, uniqueness, and validity breakdown bars.",
        "Lineage Tab: Provenance, original prompt, and source URLs.",
        "Schema Inspector: Column types, unique counts, sample values."
    ],
    ACCENT_SUCCESS
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 9: Multi-Format Data Export
# ══════════════════════════════════════════════════════════════════════════════
s9 = create_base_slide()
add_header(s9, "Multi-Format Export & Downstream Integration")

add_card(s9, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.9),
    "RFC-Compliant Data Export",
    [
        "CSV Streaming Export: Direct download via GET /api/datasets/{id}/export.",
        "Formatted JSON Export: Formatted payload via GET /api/datasets/{id}/export/json.",
        "Latin-1 Header Sanitization: Enforces ASCII compliance on HTTP Content-Disposition.",
        "Downstream Ready: Import directly into Pandas, Excel, Tableau, or PowerBI."
    ],
    ACCENT_SUCCESS
)

add_card(s9, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9),
    "Enterprise Extensibility",
    [
        "Pluggable Connectors: Create new connectors in ~25 lines of Python using BaseConnector.",
        "Auto-Discovery: Submodules decorated with @register_connector are instantly live.",
        "No Frontend Changes: New connectors immediately populate dropdowns and API docs.",
        "Modular Storage: Swap SQLite for PostgreSQL / Snowflake with zero code changes."
    ],
    ACCENT_PRIMARY
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 10: Requirements Checklist & Verification
# ══════════════════════════════════════════════════════════════════════════════
s10 = create_base_slide()
add_header(s10, "Hackathon Deliverables: 100% Problem Statement 01 Coverage")

add_card(s10, Inches(0.8), Inches(1.7), Inches(11.7), Inches(4.9),
    "Verified Alignment Matrix",
    [
        "Understand requirements from NL prompts  ──►  Rule-based NLP + OpenAI intent parser with domain & entity extraction",
        "Dynamically design and execute workflows ──►  POST /api/workflows/plan + 6-stage pipeline execution engine",
        "Collect information from permitted sources  ──►  4 connectors: Arbeitnow Jobs, CoinGecko Crypto, Hacker News, Faker",
        "Clean, structure, validate, deduplicate    ──►  Median/standard null fill, full-hash dedup, type validation",
        "Provide source-backed, traceable data    ──►  _source_url, _collected_at, _connector stamps + Provenance audit tab",
        "Monitor and manage collection tasks      ──►  Workflows dashboard, step execution logs, rerun & delete controls",
        "Present results through interactive UI   ──►  Searchable/sortable data grid, quality health charts, schema inspector",
        "Maintain workflow & dataset history      ──►  Persistent SQLite database with SQLAlchemy 2.0 ORM models",
        "Search, filter, and export collected data ──►  Live substring search, ascending/descending sorting, CSV & JSON download"
    ],
    ACCENT_SUCCESS
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 11: Summary & GitHub Submission
# ══════════════════════════════════════════════════════════════════════════════
s11 = create_base_slide()
add_header(s11, "Summary & Project Repository")

add_card(s11, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.9),
    "Project Impact & Innovation",
    [
        "Democratizes data intelligence: Non-technical users can generate validated datasets in seconds.",
        "Eliminates scraper fatigue: Unified connector registry handles ingress dynamically.",
        "Guarantees quality: Every dataset is audited, scored, and verifiable.",
        "Production-ready: Fast, type-safe stack with zero build or runtime errors."
    ],
    ACCENT_PRIMARY
)

add_card(s11, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9),
    "Submission Links & Verification",
    [
        "GitHub Repository: github.com/haziqueimamgit/CodeCubicle-DataPilot",
        "Branch: main (all 57 files pushed and up-to-date)",
        "Backend: FastAPI (http://localhost:8000)",
        "Frontend: React 19 + TypeScript (http://localhost:5173)",
        "Documentation: Comprehensive README.md with architecture & walkthrough",
        "Author: Hazique Imam  |  Code Cubicle 6.0 Hackathon"
    ],
    ACCENT_CYAN
)

output_path = r"c:\Users\imamh\OneDrive\Desktop\CodeCubicle-DataPilot\DataPilot_CodeCubicle_Presentation.pptx"
prs.save(output_path)
print(f"Successfully generated: {output_path}")

desktop_copy = r"c:\Users\imamh\OneDrive\Desktop\DataPilot_CodeCubicle_Presentation.pptx"
prs.save(desktop_copy)
print(f"Saved Desktop copy: {desktop_copy}")
