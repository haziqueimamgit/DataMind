"""
DataPilot – Demo Connector

Provides a controlled, realistic built-in synthetic dataset for reliable demos across all domains.
Uses Faker to generate deterministic synthetic records.
Data is clearly labeled as synthetic (is_demo=True) throughout the pipeline.
"""
from __future__ import annotations
import random
from datetime import datetime
import pandas as pd
from faker import Faker
from app.connectors.base import BaseConnector, ConnectorMeta, register_connector

fake = Faker("en_US")
Faker.seed(42)
random.seed(42)

# ── Domain dataset generators ────────────────────────────────────────────────

def _gen_sales(n: int = 200) -> pd.DataFrame:
    collected_at = datetime.utcnow().isoformat() + "Z"
    records = []
    for i in range(n):
        records.append({
            "order_id": f"ORD-{1000 + i}",
            "customer_name": fake.name() if i % 15 != 0 else None,   # sprinkle nulls
            "customer_email": fake.email() if i % 10 != 0 else fake.email(),  # some dupes
            "product": random.choice(["Laptop", "Phone", "Tablet", "Monitor", "Keyboard"]),
            "category": random.choice(["Electronics", "Accessories", "Electronics", "Electronics"]),
            "quantity": random.randint(1, 10),
            "unit_price": round(random.uniform(49.99, 1999.99), 2),
            "discount_pct": random.choice([0, 0, 0, 5, 10, 15, 20]),
            "region": random.choice(["North", "South", "East", "West"]),
            "sale_date": fake.date_between(start_date="-1y", end_date="today").isoformat(),
            "status": random.choice(["completed", "completed", "pending", "refunded"]),
            "_source_url": "demo://sales-synthetic",
            "_collected_at": collected_at,
            "_connector": "demo",
        })
    records += records[5:10]
    return pd.DataFrame(records)


def _gen_customers(n: int = 150) -> pd.DataFrame:
    collected_at = datetime.utcnow().isoformat() + "Z"
    records = []
    for i in range(n):
        records.append({
            "customer_id": f"CUST-{2000 + i}",
            "name": fake.name(),
            "email": fake.email(),
            "phone": fake.phone_number() if i % 8 != 0 else None,
            "city": fake.city(),
            "state": fake.state_abbr(),
            "country": "US",
            "age": random.randint(18, 75) if i % 12 != 0 else None,
            "segment": random.choice(["Premium", "Standard", "Basic"]),
            "signup_date": fake.date_between(start_date="-3y", end_date="today").isoformat(),
            "is_active": random.choice([True, True, True, False]),
            "_source_url": "demo://customers-synthetic",
            "_collected_at": collected_at,
            "_connector": "demo",
        })
    records += records[0:5]
    return pd.DataFrame(records)


def _gen_products(n: int = 80) -> pd.DataFrame:
    collected_at = datetime.utcnow().isoformat() + "Z"
    categories = ["Electronics", "Office", "Accessories", "Software"]
    records = []
    for i in range(n):
        cat = random.choice(categories)
        records.append({
            "sku": f"SKU-{3000 + i}",
            "name": f"{fake.word().capitalize()} {cat[:-1]} {random.randint(100,999)}",
            "category": cat,
            "brand": fake.company(),
            "price": round(random.uniform(9.99, 2499.99), 2),
            "stock": random.randint(0, 500),
            "rating": round(random.uniform(1.0, 5.0), 1) if i % 10 != 0 else None,
            "reviews_count": random.randint(0, 5000),
            "launch_date": fake.date_between(start_date="-5y", end_date="today").isoformat(),
            "_source_url": "demo://products-synthetic",
            "_collected_at": collected_at,
            "_connector": "demo",
        })
    return pd.DataFrame(records)


def _gen_employees(n: int = 100) -> pd.DataFrame:
    collected_at = datetime.utcnow().isoformat() + "Z"
    depts = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations"]
    records = []
    for i in range(n):
        records.append({
            "emp_id": f"EMP-{4000 + i}",
            "name": fake.name(),
            "department": random.choice(depts),
            "title": fake.job(),
            "email": fake.company_email(),
            "salary": round(random.uniform(35000, 150000), 2) if i % 20 != 0 else None,
            "hire_date": fake.date_between(start_date="-10y", end_date="today").isoformat(),
            "performance_score": round(random.uniform(1.0, 5.0), 1),
            "remote": random.choice([True, False]),
            "_source_url": "demo://employees-synthetic",
            "_collected_at": collected_at,
            "_connector": "demo",
        })
    records += records[1:4]
    return pd.DataFrame(records)


def _gen_jobs(n: int = 100) -> pd.DataFrame:
    collected_at = datetime.utcnow().isoformat() + "Z"
    roles = [
        ("AI Research Engineer", "Engineering", "Python, PyTorch, Transformers"),
        ("Senior Backend Developer", "Engineering", "Python, FastAPI, PostgreSQL"),
        ("Machine Learning Ops Lead", "Data & ML", "Kubernetes, Docker, MLflow"),
        ("Full Stack React/Python Engineer", "Engineering", "React, TypeScript, Python"),
        ("Data Pipeline Engineer", "Data & Analytics", "SQL, Spark, Kafka, Airflow"),
        ("Python AI Agent Developer", "AI & ML", "LangChain, Vector DB, LLM Agents"),
        ("Distributed Systems Architect", "Infrastructure", "Go, Rust, Distributed Systems"),
    ]
    records = []
    for i in range(n):
        role_info = roles[i % len(roles)]
        records.append({
            "job_id": f"JOB-{5000 + i}",
            "company_name": fake.company(),
            "job_title": role_info[0],
            "category": role_info[1],
            "location": random.choice(["Remote", "Hybrid - San Francisco", "Remote - New York", "Remote - Global"]),
            "employment_type": random.choice(["Full-time", "Contract", "Full-time"]),
            "salary_range": f"${random.randint(130, 220)},000 - ${random.randint(230, 310)},000" if i % 10 != 0 else None,
            "skills": role_info[2],
            "apply_url": f"https://careers.example.com/jobs/{5000 + i}",
            "_source_url": f"demo://jobs-synthetic/{5000 + i}",
            "_collected_at": collected_at,
            "_connector": "demo",
        })
    records += records[0:4]  # duplicates
    return pd.DataFrame(records)


def _gen_market(n: int = 50) -> pd.DataFrame:
    collected_at = datetime.utcnow().isoformat() + "Z"
    assets = ["Bitcoin", "Ethereum", "Solana", "Cardano", "Avalanche", "Chainlink", "Near Protocol"]
    records = []
    for i in range(n):
        name = assets[i % len(assets)]
        records.append({
            "asset_id": f"AST-{6000 + i}",
            "asset_name": name,
            "symbol": name[:3].upper(),
            "price_usd": round(random.uniform(5.0, 70000.0), 2),
            "market_cap_usd": round(random.uniform(1e9, 1e12), 2),
            "volume_24h_usd": round(random.uniform(1e7, 1e10), 2) if i % 12 != 0 else None,
            "change_24h_pct": round(random.uniform(-10.0, 15.0), 2),
            "_source_url": "demo://market-synthetic",
            "_collected_at": collected_at,
            "_connector": "demo",
        })
    records += records[0:2]
    return pd.DataFrame(records)


def _gen_leads(n: int = 50) -> pd.DataFrame:
    collected_at = datetime.utcnow().isoformat() + "Z"
    records = []
    for i in range(n):
        records.append({
            "lead_id": f"LEAD-{7000 + i}",
            "company": fake.company(),
            "founder": fake.name(),
            "opportunity": random.choice(["Engineering Hiring", "Seed Sponsor", "Cloud Partnership", "Integration Lead"]),
            "stage": random.choice(["Seed", "Series A", "Series B"]) if i % 9 != 0 else None,
            "contact_email": fake.company_email(),
            "_source_url": "demo://leads-synthetic",
            "_collected_at": collected_at,
            "_connector": "demo",
        })
    records += records[0:2]
    return pd.DataFrame(records)


_DOMAIN_MAP = {
    "sales": _gen_sales,
    "customers": _gen_customers,
    "products": _gen_products,
    "employees": _gen_employees,
    "jobs": _gen_jobs,
    "market": _gen_market,
    "leads": _gen_leads,
}


@register_connector
class DemoConnector(BaseConnector):
    """Built-in synthetic data source – always available, no auth required."""

    meta = ConnectorMeta(
        connector_id="demo",
        display_name="Built-in Demo Dataset",
        description=(
            "Synthetic data generated with Faker for showcase purposes across all domains. "
            "Records are clearly labeled as demo data and do NOT represent "
            "real individuals, companies, or transactions."
        ),
        is_demo=True,
        requires_auth=False,
        supported_domains=list(_DOMAIN_MAP.keys()),
    )

    def fetch(self, domain: str = "sales", n: int = 200, **kwargs) -> pd.DataFrame:
        """
        Fetch a domain-specific synthetic dataset.
        Gracefully falls back to best-matching domain generator if an unknown domain is supplied.
        """
        Faker.seed(42)
        random.seed(42)

        gen = _DOMAIN_MAP.get(domain)
        if not gen:
            dom = domain.lower()
            if "job" in dom or "career" in dom or "hire" in dom or "recruit" in dom:
                gen = _gen_jobs
            elif "market" in dom or "crypto" in dom or "price" in dom or "finance" in dom:
                gen = _gen_market
            elif "lead" in dom or "sponsor" in dom or "pitch" in dom:
                gen = _gen_leads
            elif "cust" in dom or "user" in dom or "client" in dom:
                gen = _gen_customers
            elif "prod" in dom or "item" in dom:
                gen = _gen_products
            elif "emp" in dom or "staff" in dom or "hr" in dom:
                gen = _gen_employees
            else:
                gen = _gen_sales

        return gen(n=n)
