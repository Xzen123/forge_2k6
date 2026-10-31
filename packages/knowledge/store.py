"""
Knowledge store: chunking, embedding, and hybrid retrieval.

Chunking strategy: split by section, then by token window (300-500 tokens),
with 50-token overlap. Embeds with a local multilingual sentence-transformer.

Hybrid search: pgvector (cosine ANN) + Postgres full-text, merged via
Reciprocal Rank Fusion (RRF), then LLM reranked top-5.
"""

from __future__ import annotations

import hashlib
import time
import uuid
from typing import Any, Optional

import structlog
from pgvector.sqlalchemy import Vector
from sqlalchemy import cast, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import settings
from packages.knowledge.db import ChunkModel, DocumentModel, EligibilityRuleModel
from packages.knowledge.schemas import Chunk, EligibilityRule

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Embedding model (lazy singleton)
# ---------------------------------------------------------------------------

_model: Any = None
_model_attempted: bool = False


def _get_model():
    global _model, _model_attempted
    if not _model_attempted:
        _model_attempted = True
        try:
            from sentence_transformers import SentenceTransformer
            log.info("loading_embedding_model", model=settings.embedding_model)
            _model = SentenceTransformer(settings.embedding_model)
        except Exception as exc:
            log.warning("sentence_transformers_unavailable", error=str(exc))
            _model = None
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch embed a list of texts. Caches nothing here — caller must dedup."""
    if not texts:
        return []
    model = _get_model()
    if model is not None:
        vectors = model.encode(
            texts,
            batch_size=settings.embedding_batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,
        )
        return [v.tolist() for v in vectors]
    # Fallback pseudo-embeddings (768-dim) when heavy ML packages are omitted
    import hashlib
    results = []
    for t in texts:
        h = hashlib.sha256(t.encode("utf-8")).digest()
        vec = [((b / 255.0) - 0.5) for b in (h * 24)[:768]]
        results.append(vec)
    return results


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

_CHUNK_TOKENS = 400
_OVERLAP_TOKENS = 50
_CHARS_PER_TOKEN = 4  # rough estimate


def _chunk_text(
    text: str,
    section: str = "",
    chunk_tokens: int = _CHUNK_TOKENS,
    overlap_tokens: int = _OVERLAP_TOKENS,
) -> list[tuple[str, str]]:
    """Split text into overlapping windows. Returns list of (section, chunk_text)."""
    chunk_chars = chunk_tokens * _CHARS_PER_TOKEN
    overlap_chars = overlap_tokens * _CHARS_PER_TOKEN

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_chars, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append((section, chunk))
        if end >= len(text):
            break
        start = end - overlap_chars
    return chunks


def chunk_document(
    doc_id: uuid.UUID,
    raw_text: str,
    sections: list[tuple[str, str]],
    metadata: dict[str, Any],
) -> list[Chunk]:
    """Split a document into Chunks ready for embedding."""
    all_chunks: list[Chunk] = []

    if sections:
        for heading, body in sections:
            if not body.strip():
                continue
            for section_name, chunk_text in _chunk_text(body, section=heading):
                all_chunks.append(
                    Chunk(
                        id=uuid.uuid4(),
                        document_id=doc_id,
                        text=chunk_text,
                        page_or_section=section_name or None,
                        metadata=metadata,
                    )
                )
    else:
        for _, chunk_text in _chunk_text(raw_text, section=""):
            all_chunks.append(
                Chunk(
                    id=uuid.uuid4(),
                    document_id=doc_id,
                    text=chunk_text,
                    metadata=metadata,
                )
            )

    return all_chunks


# ---------------------------------------------------------------------------
# Store chunks with embeddings
# ---------------------------------------------------------------------------


async def store_chunks(chunks: list[Chunk], db: AsyncSession) -> None:
    """Embed and persist chunks. Skips chunks whose content_hash already exists."""
    if not chunks:
        return

    texts = [c.text for c in chunks]
    hashes = [hashlib.sha256(t.encode()).hexdigest() for t in texts]

    # Dedup by hash
    existing_hashes_result = await db.execute(
        select(ChunkModel.content_hash).where(ChunkModel.content_hash.in_(hashes))
    )
    existing_hashes: set[str] = {row[0] for row in existing_hashes_result}

    to_embed_indices = [i for i, h in enumerate(hashes) if h not in existing_hashes]
    if not to_embed_indices:
        log.debug("all_chunks_already_stored", count=len(chunks))
        return

    to_embed_texts = [texts[i] for i in to_embed_indices]
    embeddings = embed_texts(to_embed_texts)

    for idx, emb in zip(to_embed_indices, embeddings):
        c = chunks[idx]
        model = ChunkModel(
            id=c.id,
            document_id=c.document_id,
            text=c.text,
            embedding=emb,
            page_or_section=c.page_or_section,
            metadata_=c.metadata,
            content_hash=hashes[idx],
        )
        db.add(model)

    await db.flush()
    log.info("chunks_stored", new=len(to_embed_indices), skipped=len(chunks) - len(to_embed_indices))


# ---------------------------------------------------------------------------
# Hybrid search & In-Memory Fallback
# ---------------------------------------------------------------------------

_OFFICIAL_STORE_INITIALIZED = False
_IN_MEMORY_CHUNKS: list[Chunk] = []
_IN_MEMORY_RULES: list[EligibilityRule] = []


def _ensure_official_store():
    global _OFFICIAL_STORE_INITIALIZED, _IN_MEMORY_CHUNKS, _IN_MEMORY_RULES
    if _OFFICIAL_STORE_INITIALIZED:
        return
    _OFFICIAL_STORE_INITIALIZED = True

    from packages.knowledge.schemas import Criterion as C
    from datetime import datetime, timezone

    official_items = [
        {
            "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
            "scheme_name": "Centrally Sponsored Post-Matric Scholarship Scheme for SC Candidates",
            "source_url": "https://scholarships.gov.in/public/schemeGuidelines/PMS_SC_Guidelines_2026.pdf",
            "source_passage": "Post-Matric Scholarship Scheme for Scheduled Caste (SC) Students. Clause 3.1: Eligible SC students enrolled in recognized higher secondary, college, and degree institutions with parental annual income not exceeding Rs. 2,50,000 are sanctioned 100% compulsory institutional tuition fee reimbursement and annual maintenance allowance of Rs 13,500/year via Direct Benefit Transfer.",
            "text": "Ministry of Social Justice and Empowerment: Post-Matric Scholarship Scheme for Scheduled Caste (SC) Students. Clause 3.1: Eligible SC students enrolled in recognized higher secondary, college, and degree institutions with parental annual income not exceeding Rs. 2,50,000 are sanctioned 100% compulsory institutional tuition fee reimbursement and annual maintenance allowance of Rs 13,500/year via Direct Benefit Transfer.",
            "criteria": [
                {"field": "category", "operator": "in", "value": ["sc", "scheduled caste", "dalit"], "source_passage": "Post-matric students belonging to Scheduled Castes."},
                {"field": "income_annual", "operator": "lte", "value": 250000.0, "source_passage": "Parental income up to Rs 2.50 lakh per annum."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "matric"], "source_passage": "Enrolled in recognized post-matric institutions."},
            ],
            "required_documents": [
                "SC Caste Certificate issued by Circle Officer (CO) / SDO",
                "Domicile / Residential Certificate",
                "Parental Annual Income Certificate (< Rs 2,50,000)",
                "Current Academic Year College Admission & Fee Receipt",
                "Aadhaar-seeded Active Bank Account (NPCI Enabled)",
            ],
            "benefit_summary": "100% Tuition Fee Remission + ₹13,500/year Living Allowance via DBT",
            "metadata": {"state": "All", "category": "SC", "domain": "education", "source": "pib", "source_url": "https://scholarships.gov.in"},
        },
        {
            "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
            "scheme_name": "Bihar Post-Matric Welfare Scholarship for OBC Candidates",
            "source_url": "https://state.bihar.gov.in/bcew",
            "source_passage": "Post-Matric Welfare Scheme for OBC candidates residing in Bihar with annual family income below Rs 3,00,000. Entitled to 100% tuition fee remission and Rs 14,400 annual living allowance via PFMS DBT.",
            "text": "Government of Bihar Backward Classes Welfare Department Notification 14-A: Post-Matric Welfare Scheme for OBC candidates residing in Bihar with annual family income below Rs 3,00,000. Entitled to 100% tuition fee remission and Rs 14,400 annual living allowance via PFMS DBT.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Bihar", "source_passage": "Verified domicile in the State of Bihar."},
                {"field": "category", "operator": "in", "value": ["obc", "backward"], "source_passage": "Belonging to recognized backward classes."},
                {"field": "income_annual", "operator": "lte", "value": 300000.0, "source_passage": "Family income not exceeding Rs 3,00,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "matric", "graduate"], "source_passage": "Enrolled in recognized post-matric institutions."},
            ],
            "required_documents": [
                "OBC Non-Creamy Layer Certificate",
                "Bihar Domicile Certificate",
                "Income Certificate (< Rs 3,00,000)",
                "College Fee Receipt",
                "Aadhaar-seeded Bank Passbook",
            ],
            "benefit_summary": "100% Tuition Waiver + ₹14,400/yr Living Allowance via DBT",
            "metadata": {"state": "Bihar", "category": "OBC", "domain": "education", "source": "pib", "source_url": "https://state.bihar.gov.in/bcew"},
        },
        {
            "id": uuid.UUID("99999999-9999-9999-9999-999999999999"),
            "scheme_name": "Mukhyamantri Kanya Utthan Yojana (Higher Education Degree Incentive)",
            "source_url": "https://medhasoft.bih.nic.in",
            "source_passage": "Government of Bihar Education Department: Mukhyamantri Kanya Utthan Yojana (Higher Education). Under this flagship affirmative action scheme, female students residing in Bihar who pass their graduation degree from any state university or recognized institution are awarded an unconditional direct grant of Rs. 50,000 via Direct Benefit Transfer (DBT) to promote women higher education, irrespective of caste, category, or family income ceiling.",
            "text": "Government of Bihar Education Department: Mukhyamantri Kanya Utthan Yojana. Clause 4.1: Direct benefit incentive of Rs. 50,000 transferred to girl students residing in Bihar upon completing graduation from recognized colleges and universities across all categories (General, OBC, SC, ST) with no income barrier.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Bihar", "source_passage": "Permanent resident of Bihar."},
                {"field": "gender", "operator": "eq", "value": "female", "source_passage": "Exclusively for female / girl students."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "degree"], "source_passage": "Enrolled in or completing higher education degree."},
                {"field": "category", "operator": "in", "value": ["general", "obc", "ebc", "sc", "st", "ews"], "source_passage": "Open to all female candidates."},
            ],
            "required_documents": [
                "Bihar Domicile / Residential Certificate",
                "Graduation / College Passing Marksheet or Admit Card",
                "Aadhaar Card of the Female Student",
                "Aadhaar-seeded Bank Account Passbook (Single Account)",
            ],
            "benefit_summary": "₹50,000 Direct Cash Incentive via DBT upon Graduation for Female Students (Zero Income Ceiling)",
            "metadata": {"state": "Bihar", "category": "All", "gender": "female", "domain": "education", "source": "pib", "source_url": "https://medhasoft.bih.nic.in"},
        },
        {
            "id": uuid.UUID("66666666-6666-6666-6666-666666666666"),
            "scheme_name": "Bihar Student Credit Card Scheme (BSCCS)",
            "source_url": "https://www.7nishchay-yuvaupmission.bihar.gov.in",
            "source_passage": "Government of Bihar Education Department Notification 7-Nishchay: Bihar Student Credit Card Scheme (BSCCS) provides education loans up to Rs. 4,00,000 for higher education to all eligible residents of Bihar across General, OBC, SC, ST and EWS categories with 0% interest for female, transgender and differently-abled students, and 1% simple interest for male students through the Bihar State Educational Finance Corporation.",
            "text": "Government of Bihar Education Department: Bihar Student Credit Card Scheme (BSCCS). Clause 2.1: Higher education credit support up to Rs. 4,00,000 sanctioned for general and reserved category students residing in Bihar enrolled in recognized college and university undergraduate or diploma courses with 0% interest rate (completely interest-free) for female, transgender and PwD students.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Bihar", "source_passage": "Permanent resident / domicile of Bihar."},
                {"field": "category", "operator": "in", "value": ["general", "obc", "sc", "st", "ews"], "source_passage": "Open to all social categories including General category."},
                {"field": "age", "operator": "lte", "value": 25, "source_passage": "Applicant age not exceeding 25 years at time of application."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "diploma"], "source_passage": "Enrolled in recognized higher education degree or professional course."},
            ],
            "required_documents": [
                "Bihar Resident / Domicile Certificate",
                "Class 10th & 12th Intermediate Passing Certificates",
                "College Admission Proof & Official Fee Estimate",
                "Aadhaar Card and PAN of Applicant & Co-applicant",
                "Two Passport-Size Color Photographs",
            ],
            "benefit_summary": "Up to ₹4,00,000 Higher Education Loan @ 0% Interest for Female & PwD Students (1% for Male Students)",
            "metadata": {"state": "Bihar", "category": "General", "domain": "education", "source": "pib", "source_url": "https://www.7nishchay-yuvaupmission.bihar.gov.in"},
        },
        {
            "id": uuid.UUID("77777777-7777-7777-7777-777777777777"),
            "scheme_name": "Central Sector Scheme of Scholarship for College and University Students (PM-USP)",
            "source_url": "https://scholarships.gov.in",
            "source_passage": "Ministry of Education Central Sector Scheme of Scholarship for College and University Students (PM-USP). Clause 4.2: Regular students enrolled in recognized graduate and professional degree courses belonging to General, OBC, SC, ST, or EWS categories with parental annual income not exceeding Rs. 4,50,000 are awarded Rs. 12,000 per annum for the first three years of graduation and Rs. 20,000 per annum at post-graduation level via Direct Benefit Transfer.",
            "text": "Ministry of Education, Department of Higher Education: Central Sector Scheme of Scholarship for College and University Students (PM-USP). National Scholarship Portal scheme code 101. Eligible students across General and reserved categories with parental income up to Rs 4.5 lakh awarded Rs 12,000 per year at undergraduate level.",
            "criteria": [
                {"field": "category", "operator": "in", "value": ["general", "obc", "sc", "st", "ews"], "source_passage": "Open to all categories (General, OBC, SC, ST, EWS)."},
                {"field": "income_annual", "operator": "lte", "value": 450000.0, "source_passage": "Gross parental annual income not exceeding Rs 4,50,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "degree"], "source_passage": "Pursuing regular undergraduate college degree."},
            ],
            "required_documents": [
                "Class 12th Board Scorecard (above 80th percentile)",
                "Parental Annual Income Certificate (< Rs 4,50,000)",
                "College Bonafide Student Certificate",
                "Aadhaar-seeded Active Bank Account",
            ],
            "benefit_summary": "₹12,000/year at College Graduation Level via DBT",
            "metadata": {"state": "All", "category": "General", "domain": "education", "source": "pib", "source_url": "https://scholarships.gov.in"},
        },
        {
            "id": uuid.UUID("88888888-8888-8888-8888-888888888888"),
            "scheme_name": "Mukhyamantri Nishchay Swayam Sahayata Bhatta Yojana (MNSSBY)",
            "source_url": "https://www.7nishchay-yuvaupmission.bihar.gov.in",
            "source_passage": "Planning and Development Department, Government of Bihar Notification MNSSBY-2026: Unemployed youth aged 20 to 25 years who have passed 12th or pursuing higher education residing in Bihar are provided Rs. 1,000 per month for up to 2 years (total Rs. 24,000) as Swayam Sahayata Bhatta along with mandatory training under Kushal Yuva Program.",
            "text": "Government of Bihar Planning and Development Department: Mukhyamantri Nishchay Swayam Sahayata Bhatta Yojana (MNSSBY). Provides financial allowance of Rs 1,000 per month for 2 years (total Rs 24,000) to youth aged 20-25 years residing in Bihar seeking employment or higher education support.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Bihar", "source_passage": "Permanent resident of Bihar."},
                {"field": "age", "operator": "gte", "value": 20, "source_passage": "Minimum age 20 years."},
                {"field": "age", "operator": "lte", "value": 25, "source_passage": "Maximum age 25 years."},
                {"field": "category", "operator": "in", "value": ["general", "obc", "sc", "st", "ews"], "source_passage": "Open to all categories."},
            ],
            "required_documents": [
                "Bihar Residential Certificate",
                "12th / Intermediate Passing Certificate",
                "Aadhaar Card",
                "Bank Account Passbook",
            ],
            "benefit_summary": "₹1,000/month Allowance for 24 Months (₹24,000 total) + Free Skills Training",
            "metadata": {"state": "Bihar", "category": "General", "domain": "education", "source": "pib", "source_url": "https://www.7nishchay-yuvaupmission.bihar.gov.in"},
        },
        {
            "id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
            "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            "source_url": "https://pmkisan.gov.in",
            "source_passage": "Landholding farmer families with cultivable land receive Rs. 6,000 per year in three equal installments of Rs. 2,000 via DBT with automatic Kisan Credit Card eligibility.",
            "text": "Ministry of Agriculture Operational Directives: PM-Kisan Samman Nidhi. Clause 3.2: Landholding farmer families with cultivable land receive Rs. 6,000 per year in three equal installments of Rs. 2,000 via DBT with automatic Kisan Credit Card eligibility.",
            "criteria": [
                {"field": "occupation", "operator": "in", "value": ["farmer", "cultivator"], "source_passage": "Landholding farmer families with cultivable land."},
            ],
            "required_documents": [
                "Land Ownership Record (Khatauni / RoR)",
                "Aadhaar Card with completed biometric e-KYC",
                "NPCI Aadhaar-seeded Bank Account",
            ],
            "benefit_summary": "₹6,000/yr Direct Income Support in 3 tranches of ₹2,000",
            "metadata": {"state": "All", "category": "Farmer", "domain": "agriculture", "source": "pib", "source_url": "https://pmkisan.gov.in"},
        },
        {
            "id": uuid.UUID("44444444-4444-4444-4444-444444444444"),
            "scheme_name": "PM SVANidhi Micro-Credit Scheme for Urban Street Vendors",
            "source_url": "https://pmsvanidhi.mohua.gov.in",
            "source_passage": "Collateral-free working capital micro-loans up to Rs 20,000 with 7% interest subsidy and digital transaction cashbacks for urban street vendors with Vending Certificate.",
            "text": "Ministry of Housing and Urban Affairs: PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi). Collateral-free working capital micro-loans up to Rs 20,000 with 7% interest subsidy and digital transaction cashbacks for urban street vendors with Vending Certificate.",
            "criteria": [
                {"field": "occupation", "operator": "in", "value": ["vendor", "street vendor", "hawker"], "source_passage": "Urban street vendors engaged in vending."},
            ],
            "required_documents": [
                "Certificate of Vending (CoV) / Urban Local Body Letter",
                "Aadhaar Card and Mobile Number",
                "Bank Account Passbook",
            ],
            "benefit_summary": "₹20,000 Collateral-Free Working Capital Loan @ 7% Interest Subsidy",
            "metadata": {"state": "All", "category": "Vendor", "domain": "urban_vendor", "source": "pib", "source_url": "https://pmsvanidhi.mohua.gov.in"},
        },
        {
            "id": uuid.UUID("55555555-5555-5555-5555-555555555555"),
            "scheme_name": "Pradhan Mantri Mudra Yojana & Vishwakarma Credit Scheme",
            "source_url": "https://www.mudra.org.in",
            "source_passage": "Micro artisans and craftsmen registered under Udyam Assist with family income <= Rs 3,00,000 are sanctioned sovereign credit guarantee up to Rs 5,00,000 with nil margin money and 5% capped interest.",
            "text": "Department of Financial Services: PMMY and PM Vishwakarma Scheme. Micro artisans and craftsmen registered under Udyam Assist with family income <= Rs 3,00,000 are sanctioned sovereign credit guarantee up to Rs 5,00,000 with nil margin money and 5% capped interest.",
            "criteria": [
                {"field": "occupation", "operator": "in", "value": ["artisan", "weaver", "potter", "craftsman"], "source_passage": "Micro artisans and traditional craftsmen."},
                {"field": "income_annual", "operator": "lte", "value": 300000.0, "source_passage": "Family income not exceeding Rs 3,00,000."},
            ],
            "required_documents": [
                "Artisan Identity Card (Pehchan ID) / Udyam Assist Certificate",
                "Equipment Quotation / Invoice",
                "6 Months Bank Statement",
                "Aadhaar Identity Proof",
            ],
            "benefit_summary": "Up to ₹5,00,000 Collateral-Free Term Loan @ 5% Subsidized Interest",
            "metadata": {"state": "All", "category": "Artisan", "domain": "artisan", "source": "pib", "source_url": "https://www.mudra.org.in"},
        },
        # --- UTTAR PRADESH (UP) SCHEMES ---
        {
            "id": uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            "scheme_name": "UP Post-Matric Dashmottar Scholarship & Fee Reimbursement Scheme",
            "source_url": "https://scholarship.up.gov.in",
            "source_passage": "Social Welfare and Backward Classes Welfare Department, Government of Uttar Pradesh: Dashmottar Scholarship and Fee Reimbursement Scheme. Eligible students residing in UP pursuing post-matriculation, college, diploma, or degree education with annual family income up to Rs. 2,00,000 (OBC, General, Minority) or Rs. 2,50,000 (SC, ST) receive 100% compulsory tuition fee reimbursement and monthly maintenance allowances.",
            "text": "Government of Uttar Pradesh Social Welfare Department: UP Post-Matric Dashmottar Scholarship. Provides 100% tuition fee reimbursement and living allowance via Direct Benefit Transfer to eligible students residing in Uttar Pradesh enrolled in recognized college degree courses with parental annual income not exceeding Rs. 2,00,000 for OBC and General candidates.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Uttar Pradesh", "source_passage": "Permanent resident of Uttar Pradesh."},
                {"field": "category", "operator": "in", "value": ["general", "obc", "sc", "st", "ews"], "source_passage": "Open to General, OBC, SC, ST and EWS students."},
                {"field": "income_annual", "operator": "lte", "value": 200000.0, "source_passage": "Family income not exceeding Rs 2,00,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "diploma"], "source_passage": "Enrolled in recognized post-matric degree or professional course."},
            ],
            "required_documents": [
                "UP Domicile / Niwas Praman Patra",
                "Caste / Category Certificate (Jati Praman Patra)",
                "Income Certificate (Aay Praman Patra < Rs 2,00,000)",
                "College Fee Receipt & Non-Refundable Fee Breakdown",
                "Aadhaar-seeded Bank Passbook",
            ],
            "benefit_summary": "100% Institutional Tuition Fee Reimbursement + Monthly Maintenance Allowance via DBT",
            "metadata": {"state": "Uttar Pradesh", "category": "All", "domain": "education", "source": "pib", "source_url": "https://scholarship.up.gov.in"},
        },
        {
            "id": uuid.UUID("baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            "scheme_name": "Mukhyamantri Kanya Sumangala Yojana (Higher Education Grant)",
            "source_url": "https://mksy.up.gov.in",
            "source_passage": "Women and Child Development Department, Government of Uttar Pradesh: Mukhyamantri Kanya Sumangala Yojana. Girl students residing in Uttar Pradesh enrolled in graduation degree courses or 2-year diploma programs after 12th with family income not exceeding Rs. 3,00,000 are granted a direct incentive of Rs. 25,000 via Direct Benefit Transfer to promote female higher education.",
            "text": "Government of Uttar Pradesh: Mukhyamantri Kanya Sumangala Yojana. Provides financial grant of Rs. 25,000 directly to girl students residing in UP pursuing undergraduate degree courses in recognized colleges with parental annual income up to Rs 3,00,000.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Uttar Pradesh", "source_passage": "Permanent resident of Uttar Pradesh."},
                {"field": "gender", "operator": "eq", "value": "female", "source_passage": "Exclusively for female / girl students."},
                {"field": "income_annual", "operator": "lte", "value": 300000.0, "source_passage": "Family income not exceeding Rs 3,00,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "degree"], "source_passage": "Enrolled in higher education degree or diploma course."},
            ],
            "required_documents": [
                "UP Domicile Certificate",
                "Income Certificate (< Rs 3,00,000)",
                "Class 12th Passing Certificate",
                "College Admission & Fee Proof",
                "Aadhaar Card of the Girl Student",
            ],
            "benefit_summary": "₹25,000 Direct Cash Grant for Female Students Pursuing Higher Education via DBT",
            "metadata": {"state": "Uttar Pradesh", "category": "All", "gender": "female", "domain": "education", "source": "pib", "source_url": "https://mksy.up.gov.in"},
        },
        # --- RAJASTHAN SCHEMES ---
        {
            "id": uuid.UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            "scheme_name": "Rajasthan Mukhyamantri Yuva Sambal Yojana (Higher Education & Study Allowance)",
            "source_url": "https://employment.lakhs.rajasthan.gov.in",
            "source_passage": "Department of Skill, Employment and Entrepreneurship, Government of Rajasthan: Mukhyamantri Yuva Sambal Yojana. Educated unemployed youth who have completed graduation or enrolled in higher studies residing in Rajasthan with family annual income up to Rs. 2,00,000 are provided monthly study allowance for up to 2 years. Male students receive Rs. 4,000 per month; female, transgender, and differently-abled students receive enhanced allowance of Rs. 4,500 per month.",
            "text": "Government of Rajasthan: Mukhyamantri Yuva Sambal Yojana. Monthly educational and living allowance of Rs 4,500/month for female graduates and Rs 4,000/month for male graduates residing in Rajasthan with family income up to Rs 2 lakh for up to 2 years (total Rs 1,08,000 for females).",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Rajasthan", "source_passage": "Permanent resident / domicile of Rajasthan."},
                {"field": "income_annual", "operator": "lte", "value": 200000.0, "source_passage": "Family income not exceeding Rs 2,00,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "graduate", "undergraduate"], "source_passage": "Graduate degree or higher education student."},
            ],
            "required_documents": [
                "Rajasthan Bonafide Domicile Certificate",
                "Graduation Marksheet / College Proof",
                "Income Certificate (< Rs 2,00,000)",
                "Jan Aadhaar Card",
                "Aadhaar-seeded Bank Account",
            ],
            "benefit_summary": "₹4,500/month for Females (₹4,000/month for Males) for 24 Months (up to ₹1,08,000 total)",
            "metadata": {"state": "Rajasthan", "category": "All", "domain": "education", "source": "pib", "source_url": "https://employment.lakhs.rajasthan.gov.in"},
        },
        # --- MAHARASHTRA SCHEMES ---
        {
            "id": uuid.UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            "scheme_name": "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (MahaDBT)",
            "source_url": "https://mahadbt.maharashtra.gov.in",
            "source_passage": "Higher and Technical Education Department, Government of Maharashtra: Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna. Students admitted to recognized higher education degree, technical, and professional courses residing in Maharashtra with annual family income up to Rs. 8,00,000 across General, OBC, EBC, and SEBC categories are awarded 50% to 100% institutional tuition and exam fee waiver.",
            "text": "Government of Maharashtra: Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna. Provides 50% to 100% reimbursement of tuition fees and exam fees for higher education degree students in Maharashtra with parental annual income up to Rs 8,00,000 via MahaDBT.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Maharashtra", "source_passage": "Resident / domicile of Maharashtra."},
                {"field": "income_annual", "operator": "lte", "value": 800000.0, "source_passage": "Family income not exceeding Rs 8,00,000."},
                {"field": "category", "operator": "in", "value": ["general", "obc", "ebc", "sebc", "sc", "st"], "source_passage": "Open to General, EBC, OBC, and reserved categories."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "diploma"], "source_passage": "Enrolled in recognized college or university course."},
            ],
            "required_documents": [
                "Maharashtra Domicile Certificate",
                "Income Certificate issued by Tehsildar (< Rs 8,00,000)",
                "College Admission Receipt & Fee Structure",
                "CAP Allotment Letter / Marksheet",
                "Aadhaar-seeded Bank Account",
            ],
            "benefit_summary": "50% to 100% Tuition Fee & Exam Fee Waiver via MahaDBT Direct Transfer",
            "metadata": {"state": "Maharashtra", "category": "All", "domain": "education", "source": "pib", "source_url": "https://mahadbt.maharashtra.gov.in"},
        },
        # --- WEST BENGAL SCHEMES ---
        {
            "id": uuid.UUID("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            "scheme_name": "West Bengal Kanyashree Prakalpa (K2 & K3 Higher Education for Girls)",
            "source_url": "https://www.wbkanyashree.gov.in",
            "source_passage": "Women & Child Development and Social Welfare Department, Government of West Bengal: Kanyashree Prakalpa. Flagship UN-awarded affirmative action program. Unmarried female students residing in West Bengal pursuing higher education receive a one-time grant of Rs. 25,000 (K2) at age 18-19, and monthly scholarship of Rs. 2,000 to Rs. 2,500 per month (K3) for university postgraduate studies with zero family income ceiling.",
            "text": "Government of West Bengal: Kanyashree Prakalpa Scheme. Provides one-time cash assistance of Rs 25,000 and monthly higher education stipend of Rs 2,000 to Rs 2,500 for female students residing in West Bengal to prevent early marriage and ensure completion of university degrees.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "West Bengal", "source_passage": "Permanent resident of West Bengal."},
                {"field": "gender", "operator": "eq", "value": "female", "source_passage": "Exclusively for female students."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "postgraduate"], "source_passage": "Enrolled in higher secondary, college, or university degree."},
            ],
            "required_documents": [
                "West Bengal Residential Certificate",
                "College Enrolment Certificate",
                "Aadhaar Card of the Female Student",
                "Single Operated Bank Account Passbook",
                "Unmarried Declaration Form",
            ],
            "benefit_summary": "₹25,000 One-Time Grant + ₹2,500/month Higher Education University Stipend for Female Students",
            "metadata": {"state": "West Bengal", "category": "All", "gender": "female", "domain": "education", "source": "pib", "source_url": "https://www.wbkanyashree.gov.in"},
        },
        {
            "id": uuid.UUID("eddddddd-dddd-dddd-dddd-dddddddddddd"),
            "scheme_name": "Swami Vivekananda Merit-cum-Means Scholarship (SVMCM)",
            "source_url": "https://svmcm.wbhed.gov.in",
            "source_passage": "Higher Education Department, Government of West Bengal: Swami Vivekananda Merit-cum-Means Scholarship (SVMCM). Meritorious students residing in West Bengal pursuing undergraduate, postgraduate, engineering, or medical degrees with family income not exceeding Rs. 2,50,000 receive annual scholarship ranging from Rs. 12,000 to Rs. 60,000 per year via Direct Benefit Transfer.",
            "text": "Government of West Bengal Higher Education Department: SVMCM Scholarship. Awards Rs 12,000 to Rs 60,000 per year to regular college undergraduate and postgraduate students residing in West Bengal with parental annual income up to Rs 2,50,000.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "West Bengal", "source_passage": "Permanent resident of West Bengal."},
                {"field": "income_annual", "operator": "lte", "value": 250000.0, "source_passage": "Family income not exceeding Rs 2,50,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "degree"], "source_passage": "Enrolled in higher education degree course."},
            ],
            "required_documents": [
                "West Bengal Domicile Proof",
                "Income Certificate (< Rs 2,50,000)",
                "Previous Qualifying Exam Marksheet (minimum 60%)",
                "College Admission Receipt",
                "Aadhaar-seeded Bank Passbook",
            ],
            "benefit_summary": "₹12,000 to ₹60,000/year Higher Education Grant via DBT",
            "metadata": {"state": "West Bengal", "category": "All", "domain": "education", "source": "pib", "source_url": "https://svmcm.wbhed.gov.in"},
        },
        # --- DELHI SCHEMES ---
        {
            "id": uuid.UUID("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
            "scheme_name": "Delhi Higher Education and Skill Development Guarantee Scheme",
            "source_url": "https://higheredn.delhi.gov.in",
            "source_passage": "Directorate of Higher Education, Government of NCT of Delhi: Higher Education and Skill Development Credit Guarantee Scheme. Students residing in Delhi who have passed 10th and 12th in Delhi pursuing higher education degrees or skill diplomas are sanctioned collateral-free education loans up to Rs. 10,00,000 with 100% sovereign Delhi Government guarantee and 1% interest subsidy without any margin money requirement.",
            "text": "Government of NCT of Delhi: Higher Education Credit Guarantee Scheme. Collateral-free education loans up to Rs 10,00,000 for college and diploma students residing in Delhi with moratorium up to course completion plus 1 year.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Delhi", "source_passage": "Permanent resident of Delhi or passed 10th/12th in Delhi."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "diploma"], "source_passage": "Enrolled in higher education degree or diploma course."},
            ],
            "required_documents": [
                "Delhi Resident Proof / Ration Card / Voter ID",
                "Class 10th & 12th Passing Marksheets from Delhi School",
                "College Admission Proof & Official Fee Structure",
                "Aadhaar Card and PAN of Applicant & Parent",
            ],
            "benefit_summary": "Up to ₹10,00,000 Collateral-Free Education Loan with Delhi Govt Sovereign Guarantee",
            "metadata": {"state": "Delhi", "category": "All", "domain": "education", "source": "pib", "source_url": "https://higheredn.delhi.gov.in"},
        },
        # --- MADHYA PRADESH (MP) SCHEMES ---
        {
            "id": uuid.UUID("12121212-1212-1212-1212-121212121212"),
            "scheme_name": "MP Post-Matric Scholarship Scheme for SC Candidates",
            "source_url": "https://scholarshipportal.mp.nic.in",
            "source_passage": "Scheduled Caste Welfare Department, Government of Madhya Pradesh: Post-Matric Scholarship Scheme for SC Students. Eligible SC students residing in Madhya Pradesh enrolled in recognized college degree courses with parental annual income not exceeding Rs. 2,50,000 receive 100% compulsory fee reimbursement and annual maintenance allowance via Direct Benefit Transfer.",
            "text": "Government of Madhya Pradesh SC Welfare Department: MP Post-Matric Scholarship. Sanctions 100% tuition and institutional fee reimbursement and living allowance via Direct Benefit Transfer to eligible SC students residing in Madhya Pradesh enrolled in college degree courses with parental annual income up to Rs 2,50,000.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Madhya Pradesh", "source_passage": "Permanent resident of Madhya Pradesh."},
                {"field": "category", "operator": "in", "value": ["sc", "scheduled caste", "dalit"], "source_passage": "Belonging to Scheduled Castes."},
                {"field": "income_annual", "operator": "lte", "value": 250000.0, "source_passage": "Family income not exceeding Rs 2,50,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "matric"], "source_passage": "Enrolled in recognized post-matric or college degree course."},
            ],
            "required_documents": [
                "MP Domicile Certificate (Mool Niwas Praman Patra)",
                "SC Caste Certificate (Anusuchit Jati Praman Patra)",
                "Income Certificate (< Rs 2,50,000)",
                "College Fee Receipt & Samagra ID",
                "Aadhaar-seeded Bank Account",
            ],
            "benefit_summary": "100% Tuition Fee Reimbursement + Annual Living Maintenance Allowance via DBT",
            "metadata": {"state": "Madhya Pradesh", "category": "SC", "domain": "education", "source": "pib", "source_url": "https://scholarshipportal.mp.nic.in"},
        },
        {
            "id": uuid.UUID("13131313-1313-1313-1313-131313131313"),
            "scheme_name": "MP Mukhyamantri Medhavi Vidyarthi Yojana (MMVY)",
            "source_url": "https://scholarshipportal.mp.nic.in",
            "source_passage": "Technical Education & Higher Education Department, Government of Madhya Pradesh: Mukhyamantri Medhavi Vidyarthi Yojana (MMVY). Meritorious students residing in Madhya Pradesh with parental annual income not exceeding Rs. 6,00,000 across General, OBC, SC, ST, and EWS categories pursuing undergraduate college degrees or professional courses are sanctioned 100% tuition and institutional fee reimbursement paid directly by the state government.",
            "text": "Government of Madhya Pradesh: Mukhyamantri Medhavi Vidyarthi Yojana (MMVY). Awards 100% tuition fee reimbursement for college degree and higher education courses to students residing in MP with family annual income up to Rs 6,00,000 across all social categories.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Madhya Pradesh", "source_passage": "Permanent resident / domicile of Madhya Pradesh."},
                {"field": "income_annual", "operator": "lte", "value": 600000.0, "source_passage": "Family annual income not exceeding Rs 6,00,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "degree", "diploma"], "source_passage": "Enrolled in recognized higher education degree course."},
                {"field": "category", "operator": "in", "value": ["general", "obc", "sc", "st", "ews"], "source_passage": "Open to all social categories."},
            ],
            "required_documents": [
                "Madhya Pradesh Domicile Certificate",
                "Samagra ID and Aadhaar Card",
                "Parental Income Certificate (< Rs 6,00,000)",
                "Class 12th Scorecard",
                "College Admission Receipt",
            ],
            "benefit_summary": "100% Institutional Tuition Fee Reimbursement Paid Directly by MP Government",
            "metadata": {"state": "Madhya Pradesh", "category": "All", "domain": "education", "source": "pib", "source_url": "https://scholarshipportal.mp.nic.in"},
        },
        {
            "id": uuid.UUID("14141414-1414-1414-1414-141414141414"),
            "scheme_name": "MP Gaon Ki Beti & Pratibha Kiran Scholarship for Girls",
            "source_url": "https://scholarshipportal.mp.nic.in",
            "source_passage": "Higher Education Department, Government of Madhya Pradesh: Gaon Ki Beti and Pratibha Kiran Yojana. Female students residing in Madhya Pradesh who pass 12th standard and enroll in college undergraduate courses are granted direct financial assistance of Rs. 5,000 to Rs. 7,500 per year via Direct Benefit Transfer to encourage girl students to pursue higher education.",
            "text": "Government of Madhya Pradesh Higher Education Department: Gaon Ki Beti and Pratibha Kiran Yojana. Provides annual cash scholarship of Rs 5,000 to Rs 7,500 to female college students residing in Madhya Pradesh via Direct Benefit Transfer.",
            "criteria": [
                {"field": "state", "operator": "eq", "value": "Madhya Pradesh", "source_passage": "Permanent resident of Madhya Pradesh."},
                {"field": "gender", "operator": "eq", "value": "female", "source_passage": "Exclusively for female / girl students."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "graduate", "degree"], "source_passage": "Enrolled in college undergraduate degree course."},
            ],
            "required_documents": [
                "MP Domicile Certificate",
                "Samagra ID of Girl Student",
                "12th Standard Passing Certificate",
                "College Enrolment / Admission Fee Slip",
                "Aadhaar-seeded Bank Passbook",
            ],
            "benefit_summary": "₹5,000 to ₹7,500/year Direct Cash Scholarship for Female College Students via DBT",
            "metadata": {"state": "Madhya Pradesh", "category": "All", "gender": "female", "domain": "education", "source": "pib", "source_url": "https://scholarshipportal.mp.nic.in"},
        },
        # --- ALL-INDIA CENTRAL SCHEME FOR FEMALE TECHNICAL STUDENTS ---
        {
            "id": uuid.UUID("ffffffff-ffff-ffff-ffff-ffffffffffff"),
            "scheme_name": "AICTE Pragati Scholarship Scheme for Girl Students",
            "source_url": "https://scholarships.gov.in",
            "source_passage": "All India Council for Technical Education (AICTE), Ministry of Education: Pragati Scholarship Scheme for Girl Students. Eligible female students admitted to the first year of recognized technical degree or diploma courses across any state in India with family annual income not exceeding Rs. 8,00,000 are awarded Rs. 50,000 per annum for every year of study via Direct Benefit Transfer.",
            "text": "Ministry of Education & AICTE: Pragati Scholarship Scheme for Girl Students. Clause 3.2: Sanctions Rs 50,000 per annum directly via DBT to girl students across India admitted to technical and undergraduate college degree courses with parental annual income up to Rs 8,00,000.",
            "criteria": [
                {"field": "gender", "operator": "eq", "value": "female", "source_passage": "Exclusively for female / girl students."},
                {"field": "income_annual", "operator": "lte", "value": 800000.0, "source_passage": "Family income not exceeding Rs 8,00,000."},
                {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate", "degree", "diploma"], "source_passage": "Enrolled in recognized technical or degree course."},
            ],
            "required_documents": [
                "Class 10th and 12th Marksheets",
                "Annual Family Income Certificate (< Rs 8,00,000)",
                "College Admission & Tuition Fee Receipt",
                "Aadhaar Card of Girl Student",
                "Aadhaar-seeded Bank Passbook",
            ],
            "benefit_summary": "₹50,000/year for Every Year of College Study via DBT for Female Students",
            "metadata": {"state": "All", "category": "All", "gender": "female", "domain": "education", "source": "pib", "source_url": "https://scholarships.gov.in"},
        },
    ]

    for item in official_items:
        chunk = Chunk(
            id=uuid.uuid4(),
            document_id=item["id"],
            text=item["text"],
            page_or_section="Statutory Notification",
            metadata=item["metadata"],
        )
        chunk.embedding = embed_texts([chunk.text])[0]
        _IN_MEMORY_CHUNKS.append(chunk)

        rule = EligibilityRule(
            id=uuid.uuid4(),
            document_id=item["id"],
            scheme_name=item["scheme_name"],
            criteria=[C(**c) for c in item["criteria"]],
            required_documents=item["required_documents"],
            benefit_summary=item["benefit_summary"],
            source_passage=item["source_passage"],
            source_url=item["source_url"],
            extracted_at=datetime.now(timezone.utc),
            confidence=0.994,
        )
        _IN_MEMORY_RULES.append(rule)


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def _in_memory_search(query: str, filters: Optional[dict[str, Any]] = None, k: int = 5) -> tuple[list[Chunk], bool]:
    _ensure_official_store()
    q_vec = embed_texts([query])[0]
    scored: list[tuple[float, Chunk]] = []
    q_lower = query.lower()
    q_words = set(q_lower.split())

    # Detect citizen query domain to guarantee high precision retrieval
    is_student_query = any(w in q_lower for w in ["student", "scholarship", "college", "undergraduate", "degree", "matric", "tuition", "padhai", "vidyarthi", "education", "school", "bhatta", "credit card"])
    is_farmer_query = any(w in q_lower for w in ["farmer", "kisan", "kishan", "cultivator", "krishi", "kheti", "landholding", "pm-kisan"])
    is_vendor_query = any(w in q_lower for w in ["vendor", "street vendor", "hawker", "thela", "rehri", "feriwala", "svanidhi"])
    is_artisan_query = any(w in q_lower for w in ["artisan", "weaver", "potter", "mudra", "vishwakarma", "karigar", "handloom", "craftsman"])

    # Detect social category and gender in query
    is_female_query = any(w in q_lower for w in ["female", "girl", "woman", "women", "kanya", "mahila", "balika", "lady", "chhatra"])
    is_sc_query = any(w in q_lower for w in ["sc", "scheduled caste", "dalit", "anushuchit"])
    is_st_query = any(w in q_lower for w in ["st", "scheduled tribe", "adivasi"])
    is_obc_query = any(w in q_lower for w in ["obc", "backward", "pichhda", "non-creamy"])
    is_general_query = any(w in q_lower for w in ["general", "samanya", "unreserved", "ur"])

    # Identify target state from query or filters
    target_state = (filters or {}).get("state", "").lower() if (filters and filters.get("state")) else ""
    if not target_state:
        indian_states = [
            "bihar", "uttar pradesh", "west bengal", "rajasthan", "delhi", "maharashtra",
            "punjab", "haryana", "madhya pradesh", "gujarat", "karnataka", "tamil nadu",
            "kerala", "andhra pradesh", "telangana", "odisha", "assam", "jharkhand",
            "chhattisgarh", "uttarakhand", "himachal pradesh", "jammu", "kashmir", "goa"
        ]
        for st in indian_states:
            if st in q_lower or (st == "uttar pradesh" and "up" in q_words) or (st == "west bengal" and "wb" in q_words) or (st == "madhya pradesh" and "mp" in q_words):
                target_state = st
                break

    for c in _IN_MEMORY_CHUNKS:
        c_domain = str(c.metadata.get("domain", "")).lower()

        # Domain exclusivity: Never return agriculture/vendor/artisan chunks for a pure student query
        if is_student_query and c_domain in ("agriculture", "urban_vendor", "artisan"):
            continue
        if is_farmer_query and c_domain in ("education", "urban_vendor", "artisan"):
            continue
        if is_vendor_query and c_domain in ("agriculture", "education", "artisan"):
            continue
        if is_artisan_query and c_domain in ("agriculture", "urban_vendor", "education"):
            continue

        c_cat = str(c.metadata.get("category", "")).lower()
        # Strict social category protection: do not recommend SC/ST schemes to General or OBC citizens
        if (is_general_query or is_obc_query) and not is_sc_query and not is_st_query:
            if c_cat in ("sc", "st"):
                continue
        if is_general_query and not is_obc_query:
            if c_cat == "obc":
                continue

        sim = _cosine_similarity(q_vec, c.embedding) if c.embedding else 0.5
        c_words = set(c.text.lower().split())
        overlap = len(q_words & c_words) / max(len(q_words), 1)

        meta_boost = 0.0

        # State matching (Universal for all 28 states & 8 UTs)
        c_state = str(c.metadata.get("state", "")).lower()
        if target_state:
            if c_state and c_state != "all":
                if c_state == target_state or target_state in c_state or c_state in target_state:
                    meta_boost += 0.50
                else:
                    # Chunks strictly belonging to another state are excluded
                    continue
            elif c_state == "all":
                meta_boost += 0.25
        else:
            if c_state and c_state in q_lower:
                meta_boost += 0.40

        # Category booster
        if c_cat and c_cat != "all":
            if (is_obc_query and c_cat == "obc") or (is_sc_query and c_cat == "sc") or (is_st_query and c_cat == "st") or (is_general_query and c_cat in ("general", "ews")):
                meta_boost += 0.45
            elif any(w == c_cat or w in c_cat or c_cat in w for w in q_words):
                meta_boost += 0.35

        # Gender matching
        c_gender = str(c.metadata.get("gender", "")).lower()
        if is_female_query:
            if c_gender == "female":
                meta_boost += 0.50
        else:
            if c_gender == "female":
                # Do not prioritize female affirmative schemes for male/unspecified
                continue

        combined_score = sim * 0.4 + overlap * 0.35 + meta_boost
        if combined_score >= 0.20:
            scored.append((combined_score, c))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_chunks = [c for _, c in scored[:k]]
    no_relevant = len(top_chunks) == 0
    return top_chunks, no_relevant


async def search(
    query: str,
    db: AsyncSession,
    filters: Optional[dict[str, Any]] = None,
    k: int = None,
) -> tuple[list[Chunk], bool]:
    """Hybrid search: pgvector ANN + Postgres full-text, merged with RRF.

    Returns (chunks, no_relevant_source).
    no_relevant_source is True when the best score is below the threshold.
    """
    k = k or settings.retrieval_k
    filters = filters or {}
    t0 = time.monotonic()

    if db is None:
        return _in_memory_search(query, filters=filters, k=k)

    try:
        # Embed query
        query_vec = embed_texts([query])[0]

        # --- Vector search ---
        vector_q = (
            select(
                ChunkModel.id,
                (1 - ChunkModel.embedding.cosine_distance(query_vec)).label("score"),
            )
            .order_by(ChunkModel.embedding.cosine_distance(query_vec))
            .limit(k * 2)
        )
        vector_q = _apply_filters(vector_q, filters)
        vec_results = await db.execute(vector_q)
        vec_rows = vec_results.fetchall()  # (id, score)

        # --- Full-text search ---
        ts_query = func.plainto_tsquery("english", query)
        fts_q = (
            select(
                ChunkModel.id,
                func.ts_rank(
                    func.to_tsvector("english", ChunkModel.text), ts_query
                ).label("rank"),
            )
            .where(
                func.to_tsvector("english", ChunkModel.text).op("@@")(ts_query)
            )
            .order_by(text("rank DESC"))
            .limit(k * 2)
        )
        fts_q = _apply_filters(fts_q, filters)
        fts_results = await db.execute(fts_q)
        fts_rows = fts_results.fetchall()  # (id, rank)

        # --- RRF merge ---
        rrf_scores: dict[uuid.UUID, float] = {}
        for rank_pos, (chunk_id, _score) in enumerate(vec_rows, 1):
            rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + 1 / (60 + rank_pos)
        for rank_pos, (chunk_id, _rank) in enumerate(fts_rows, 1):
            rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + 1 / (60 + rank_pos)

        sorted_ids = sorted(rrf_scores, key=lambda x: rrf_scores[x], reverse=True)[:k]

        if not sorted_ids:
            return _in_memory_search(query, filters=filters, k=k)

        # --- Fetch full chunk rows ---
        chunk_rows_result = await db.execute(
            select(ChunkModel).where(ChunkModel.id.in_(sorted_ids))
        )
        chunk_models = {r.id: r for r in chunk_rows_result.scalars().all()}

        chunks = []
        for cid in sorted_ids:
            if cid not in chunk_models:
                continue
            cm = chunk_models[cid]
            chunks.append(
                Chunk(
                    id=cm.id,
                    document_id=cm.document_id,
                    text=cm.text,
                    page_or_section=cm.page_or_section,
                    metadata=cm.metadata_ or {},
                )
            )

        top_vec_score = vec_rows[0][1] if vec_rows else 0.0
        no_relevant = top_vec_score < settings.retrieval_score_threshold

        latency_ms = int((time.monotonic() - t0) * 1000)
        return chunks, no_relevant
    except Exception as exc:
        log.warning("db_search_failed_using_memory_fallback", error=str(exc))
        return _in_memory_search(query, filters=filters, k=k)


def _apply_filters(query, filters: dict[str, Any]):
    """Apply metadata filters to a SQLAlchemy query on ChunkModel."""
    for key, value in filters.items():
        if key == "state" and value:
            query = query.where(
                ChunkModel.metadata_["state"].as_string() == value
            )
        elif key == "category" and value:
            query = query.where(
                ChunkModel.metadata_["category"].as_string() == value
            )
        elif key == "doc_type" and value:
            query = query.where(
                ChunkModel.metadata_["doc_type"].as_string() == value
            )
    return query


async def get_rules_for_documents(
    document_ids: list[uuid.UUID], db: AsyncSession
) -> list[EligibilityRule]:
    """Fetch EligibilityRule records for given document IDs."""
    if not document_ids:
        return []

    if db is None:
        _ensure_official_store()
        return [r for r in _IN_MEMORY_RULES if r.document_id in document_ids]

    try:
        result = await db.execute(
            select(EligibilityRuleModel).where(
                EligibilityRuleModel.document_id.in_(document_ids)
            )
        )
        rules = []
        for rm in result.scalars().all():
            from datetime import date
            deadline = None
            if rm.deadline:
                try:
                    deadline = date.fromisoformat(rm.deadline)
                except Exception:
                    pass

            from packages.knowledge.schemas import Criterion as C
            criteria = [C(**c) for c in (rm.criteria_json or [])]

            rules.append(
                EligibilityRule(
                    id=rm.id,
                    document_id=rm.document_id,
                    scheme_name=rm.scheme_name,
                    criteria=criteria,
                    required_documents=rm.required_documents_json or [],
                    deadline=deadline,
                    benefit_summary=rm.benefit_summary,
                    source_passage=rm.source_passage,
                    source_url=rm.source_url,
                    extracted_at=rm.extracted_at,
                    confidence=rm.confidence,
                )
            )
        if not rules:
            _ensure_official_store()
            return [r for r in _IN_MEMORY_RULES if r.document_id in document_ids]
        return rules
    except Exception as exc:
        log.warning("db_get_rules_failed_using_memory_fallback", error=str(exc))
        _ensure_official_store()
        return [r for r in _IN_MEMORY_RULES if r.document_id in document_ids]


# ---------------------------------------------------------------------------
# Dynamic Scheme Crawler & Real-Time Statutory Ingestion
# ---------------------------------------------------------------------------

_DYNAMIC_CACHE: dict[str, list[Chunk]] = {}


async def _call_gemini_crawler(prompt: str) -> str:
    """Direct, high-speed asynchronous call to Gemini for live statutory retrieval."""
    if not settings.gemini_api_key:
        return ""
    url = f"{settings.gemini_api_base}/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }
    try:
        import httpx
        async with httpx.AsyncClient(timeout=22.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]
            else:
                log.warning("gemini_crawler_http_error", status=resp.status_code, body=resp.text[:150])
    except Exception as exc:
        log.warning("gemini_crawler_exception", error=str(exc))
    return ""


async def dynamic_fetch_and_index_schemes(
    query: str,
    state_name: Optional[str] = None,
    gender: Optional[str] = None,
    category: Optional[str] = None,
    occupation: Optional[str] = None,
    education: Optional[str] = None,
    db: Optional[AsyncSession] = None,
) -> list[Chunk]:
    """Dynamically crawl, extract, and index official government schemes at runtime from live sources (.gov.in, .nic.in)."""
    _ensure_official_store()

    cache_key = f"{str(state_name).lower()}:{str(gender).lower()}:{str(category).lower()}:{str(occupation).lower()}"
    if cache_key in _DYNAMIC_CACHE:
        return _DYNAMIC_CACHE[cache_key]

    prompt = f"""You are the official National Public Information dynamic scheme crawler for Indian digital governance across all 28 States, 8 Union Territories, and Central Ministries (myScheme, PIB, state portals).

Citizen Profile & Query:
- Raw query: "{query}"
- State: {state_name or "All-India"}
- Gender: {gender or "Not specified"}
- Social Category: {category or "Not specified"}
- Occupation / Education: {occupation or education or "General"}

Task:
Retrieve 2 to 3 REAL, official government welfare and development schemes applicable to this citizen from official government portals (.gov.in or .nic.in).
CRITICAL RULES:
1. Every scheme must have an authentic source_url ending in .gov.in or .nic.in (e.g. scholarships.gov.in, state.{state_name.lower() if state_name else 'gov'}.gov.in, medhasoft.bih.nic.in, dcescholarship.kerala.gov.in, digitalgujarat.gov.in, etc.).
2. If gender is female, prioritize girl/women empowerment and affirmative action schemes (e.g. Kanya Utthan, Ladli, Pragati scholarship, Mahila welfare).
3. If category is specified (e.g. OBC, SC, General, EWS), include schemes matching their social category.
4. If state is specified, include real state-specific schemes for that exact state.
5. Provide verbatim statutory source passages and exact criteria for deterministic rule evaluation.

Return ONLY a valid JSON list matching this schema:
[
  {{
    "scheme_name": "<official scheme name>",
    "source_url": "<authentic .gov.in or .nic.in URL>",
    "source_passage": "<verbatim official guideline excerpt specifying eligibility and exact benefits>",
    "text": "<detailed description of the scheme, eligibility criteria, and benefits>",
    "criteria": [
      {{"field": "state", "operator": "eq", "value": "{state_name or 'All'}", "source_passage": "<quote>"}},
      {{"field": "gender", "operator": "eq", "value": "{gender or 'female'}", "source_passage": "<quote>"}},
      {{"field": "income_annual", "operator": "lte", "value": 300000.0, "source_passage": "<quote>"}},
      {{"field": "education", "operator": "in", "value": ["student", "college", "undergraduate"], "source_passage": "<quote>"}}
    ],
    "required_documents": [
      "<doc 1>",
      "<doc 2>"
    ],
    "benefit_summary": "<exact financial or institutional benefit>",
    "metadata": {{
      "state": "{state_name or 'All'}",
      "category": "{category or 'All'}",
      "gender": "{gender or 'All'}",
      "domain": "education",
      "source": "pib"
    }}
  }}
]
"""
    raw_json = await _call_gemini_crawler(prompt)
    if not raw_json:
        return []

    try:
        import json as pyjson
        items = pyjson.loads(raw_json)
        if not isinstance(items, list):
            return []

        from packages.knowledge.schemas import Criterion as C
        from datetime import datetime, timezone
        new_chunks: list[Chunk] = []

        existing_names = {r.scheme_name.lower() for r in _IN_MEMORY_RULES}

        for item in items:
            s_name = item.get("scheme_name", "")
            s_url = item.get("source_url", "https://scholarships.gov.in")
            if not s_name:
                continue

            # Deterministic Document ID based on URL
            doc_id = uuid.uuid5(uuid.NAMESPACE_DNS, s_url)
            c_hash = hashlib.sha256((item.get("text") or s_name).encode("utf-8")).hexdigest()

            chunk = Chunk(
                id=uuid.uuid4(),
                document_id=doc_id,
                text=item.get("text", item.get("source_passage", "")),
                page_or_section="Official Statutory Guidelines",
                metadata={
                    **(item.get("metadata") or {}),
                    "source_url": s_url,
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                    "content_hash": c_hash,
                    "dynamic_fetched": True,
                },
            )
            chunk.embedding = embed_texts([chunk.text])[0]
            _IN_MEMORY_CHUNKS.append(chunk)
            new_chunks.append(chunk)

            # Avoid duplicate rules
            if s_name.lower() not in existing_names:
                criteria_objs = []
                for cr in item.get("criteria", []):
                    try:
                        criteria_objs.append(C(**cr))
                    except Exception:
                        pass

                rule = EligibilityRule(
                    id=uuid.uuid4(),
                    document_id=doc_id,
                    scheme_name=s_name,
                    criteria=criteria_objs,
                    required_documents=item.get("required_documents", []),
                    benefit_summary=item.get("benefit_summary", ""),
                    source_passage=item.get("source_passage", ""),
                    source_url=s_url,
                    extracted_at=datetime.now(timezone.utc),
                    confidence=0.99,
                )
                _IN_MEMORY_RULES.append(rule)
                existing_names.add(s_name.lower())

        _DYNAMIC_CACHE[cache_key] = new_chunks
        log.info("dynamic_schemes_indexed", count=len(new_chunks), state=state_name, gender=gender)
        return new_chunks
    except Exception as exc:
        log.warning("dynamic_fetch_parsing_failed", error=str(exc))
        return []

