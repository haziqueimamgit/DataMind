"""
DataPilot – Requirement Parser Service

Converts a natural-language business requirement into a structured intent dict.

Modes:
  - "demo" / default  → Enhanced rule-based keyword & entity matching
  - OpenAI / LLM      → Structured JSON extraction via LLM
"""
from __future__ import annotations
import re
from app.core.config import settings

# ── Domain keyword maps ──────────────────────────────────────────────────────

_DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "jobs":      ["job", "opening", "hire", "hiring", "career", "developer", "engineer", "remote", "position", "recruitment", "vacancy", "role"],
    "market":    ["market", "crypto", "bitcoin", "ethereum", "price", "valuation", "coin", "financial", "trading", "ticker", "token"],
    "leads":     ["lead", "opportunity", "sponsor", "sponsorship", "pitch", "partnership", "founder", "startup", "venture", "hn"],
    "sales":     ["sale", "order", "revenue", "transaction", "purchase", "invoice"],
    "customers": ["customer", "client", "user", "buyer", "contact"],
    "products":  ["product", "sku", "inventory", "item", "catalogue", "catalog"],
    "employees": ["employee", "staff", "hr", "human resource", "payroll", "workforce"],
}

_DOMAIN_CONNECTOR_MAP: dict[str, str] = {
    "jobs": "jobs",
    "market": "crypto_market",
    "leads": "hn_leads",
    "sales": "demo",
    "customers": "demo",
    "products": "demo",
    "employees": "demo",
}

_QUALITY_KEYWORDS: dict[str, list[str]] = {
    "deduplicate":      ["duplicate", "dedup", "unique", "distinct"],
    "fill_nulls":       ["missing", "null", "empty", "fill", "incomplete", "impute"],
    "validate_types":   ["validate", "type", "format", "correct", "verify", "schema"],
    "normalize":        ["normalize", "standardize", "clean", "consistent"],
}


def _rule_based_parse(requirement: str) -> dict:
    """Keyword-matching parser – zero dependencies, always available."""
    text = requirement.lower()

    # Determine domain by counting keyword matches
    domain = "sales"
    best_score = 0
    for dom, keywords in _DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            domain = dom

    # Quality operations
    quality_ops = ["fill_nulls", "deduplicate", "validate_types"]
    for op, keywords in _QUALITY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            if op not in quality_ops:
                quality_ops.append(op)

    # Record limit extraction
    limit_match = re.search(r"\b(\d{1,5})\s*(record|row|sample|entry|listing|lead|coin|item)", text)
    record_limit = int(limit_match.group(1)) if limit_match else 100

    # Suggested source connector based on domain
    suggested_connector = _DOMAIN_CONNECTOR_MAP.get(domain, "demo")

    # Extract column mentions if any
    potential_cols = ["salary", "company", "location", "email", "price", "volume", "market_cap", "title", "rating", "skills"]
    extracted_columns = [col for col in potential_cols if col in text]

    # Objective summary
    clean_domain_name = domain.replace("_", " ").capitalize()
    objective = f"Collect, clean, and validate {clean_domain_name} intelligence based on: '{requirement[:140]}'"

    return {
        "domain":               domain,
        "objective":            objective,
        "filters":              [],
        "columns":              extracted_columns,
        "quality_ops":          quality_ops,
        "record_limit":         min(record_limit, 500),
        "suggested_connector":  suggested_connector,
        "parser":               "rule-based-nlp",
    }


def _openai_parse(requirement: str) -> dict:
    """OpenAI-powered parser – richer intent extraction."""
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    system = (
        "You are an AI data engineering pipeline designer. Extract structured intent from a "
        "natural-language business data requirement. Return ONLY valid JSON with keys: "
        "domain (jobs|market|leads|sales|customers|products|employees|general), "
        "objective (str), filters (list[str]), columns (list[str]), "
        "quality_ops (list from: fill_nulls, deduplicate, validate_types, normalize), "
        "record_limit (int, 20-500), suggested_connector (jobs|crypto_market|hn_leads|demo)."
    )
    resp = client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": requirement},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    import json
    result = json.loads(resp.choices[0].message.content)
    result["parser"] = settings.AI_MODEL
    return result


def parse_requirement(requirement: str) -> dict:
    """
    Parse a natural-language requirement into a structured intent.
    Uses OpenAI when configured, else falls back to rule-based NLP.
    """
    use_ai = (
        settings.AI_MODEL != "demo"
        and settings.OPENAI_API_KEY
        and settings.OPENAI_API_KEY.startswith("sk-")
    )
    if use_ai:
        try:
            return _openai_parse(requirement)
        except Exception:
            pass

    return _rule_based_parse(requirement)
