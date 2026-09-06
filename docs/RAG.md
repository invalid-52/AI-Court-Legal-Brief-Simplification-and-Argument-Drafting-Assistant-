# Source-Aware Legal Learning / RAG

The submission adds a small, dependency-free retrieval layer at `backend/services/legal_rag_service.py`.

## Design

1. Local curated educational notes are stored in `backend/data/legal_knowledge.json`.
2. Queries are tokenized and ranked against title, subject, jurisdiction, and note text.
3. Jurisdiction and subject matches receive a relevance boost.
4. Every result includes `source`, `sourceType`, `jurisdiction`, `verification`, and `relevanceScore`.
5. Retrieved material is explicitly framed as educational context and never converted into invented case citations.

## API

`POST /api/learning/retrieve`

Example body:

```json
{
  "query": "offer acceptance breach contract",
  "jurisdiction": "India (Common Law)",
  "subject": "Contract Law",
  "top_k": 4
}
```

The existing IRAC/counter/explainer APIs remain compatible. The RAG endpoint is additive and can be used by a future UI integration without changing the existing frontend contract.
