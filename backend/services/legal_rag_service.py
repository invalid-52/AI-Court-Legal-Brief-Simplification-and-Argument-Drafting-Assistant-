"""Dependency-free, source-aware retrieval for educational legal learning.

The retriever deliberately ranks local, curated educational notes instead of
pretending that generated text is authoritative legal research. Each returned
chunk carries provenance and a verification notice.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "legal_knowledge.json"
_TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9-]{2,}")


def _tokens(text: str) -> List[str]:
    return _TOKEN_RE.findall((text or "").lower())


def _load_documents() -> List[Dict[str, Any]]:
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _score(query_tokens: List[str], doc: Dict[str, Any]) -> float:
    haystack = " ".join(str(doc.get(k, "")) for k in ("title", "subject", "jurisdiction", "text")).lower()
    doc_tokens = _tokens(haystack)
    if not query_tokens or not doc_tokens:
        return 0.0
    counts = {token: doc_tokens.count(token) for token in set(query_tokens)}
    matched = sum(1 for token in query_tokens if counts.get(token, 0) > 0)
    weighted = sum(min(counts.get(token, 0), 3) for token in set(query_tokens))
    return (matched / len(set(query_tokens))) * 0.7 + (weighted / max(1, len(set(query_tokens)) * 3)) * 0.3


def retrieve_legal_context(
    query: str,
    *,
    jurisdiction: Optional[str] = None,
    subject: Optional[str] = None,
    top_k: int = 4,
) -> List[Dict[str, Any]]:
    """Return ranked source-aware learning chunks with explicit provenance."""
    query = (query or "").strip()
    if len(query) < 3:
        return []
    top_k = max(1, min(int(top_k), 8))
    q_tokens = _tokens(query)
    docs = _load_documents()

    ranked = []
    for doc in docs:
        score = _score(q_tokens, doc)
        if jurisdiction and jurisdiction.lower() in str(doc.get("jurisdiction", "")).lower():
            score += 0.2
        if subject and subject.lower() in str(doc.get("subject", "")).lower():
            score += 0.2
        if score > 0:
            ranked.append((score, doc))

    ranked.sort(key=lambda item: item[0], reverse=True)
    results = []
    for score, doc in ranked[:top_k]:
        results.append({
            "id": doc["id"],
            "title": doc["title"],
            "text": doc["text"],
            "jurisdiction": doc["jurisdiction"],
            "subject": doc["subject"],
            "source": doc["source"],
            "sourceType": doc["source_type"],
            "verification": doc["verification"],
            "relevanceScore": round(min(score, 1.0), 3),
        })
    return results


def build_source_aware_context(query: str, *, jurisdiction: str = "", subject: str = "") -> Dict[str, Any]:
    chunks = retrieve_legal_context(query, jurisdiction=jurisdiction, subject=subject, top_k=4)
    context = "\n\n".join(
        f"SOURCE {idx}: {item['title']} | {item['source']} | {item['jurisdiction']}\n{item['text']}\nVERIFICATION: {item['verification']}"
        for idx, item in enumerate(chunks, 1)
    )
    return {
        "query": query,
        "matches": chunks,
        "context": context,
        "groundingPolicy": "Use retrieved notes as educational context only; do not turn them into fabricated case citations or claim they are authoritative.",
    }
