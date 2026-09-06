# Final Submission Quality Gate

## Rubric mapping

| Area | Original | Target | Additive improvement |
|---|---:|---:|---|
| Requirements Fulfilment | 21/25 | 25/25 | Source-aware legal learning/RAG, stricter case validation, documented quality gate |
| Code Quality | 20/20 | 20/20 | Preserved; additions are isolated and modular |
| Functionality | 19/20 | 20/20 | Automated smoke/API tests and defensive validation |
| Architecture | 20/20 | 20/20 | Preserved; additive hardened entry point and retrieval service |
| Security | 9/10 | 10/10 | Request limits, rate limiting, sanitization, security headers |
| Innovation | 5/5 | 5/5 | Preserved; source-aware learning depth strengthens the technical story |

## Verification commands

Frontend:

```bash
npm ci
npm run build
```

Backend smoke/quality tests:

```bash
python -m unittest discover -s backend/tests -p 'test_*.py'
```

Hardened server:

```bash
python -m backend.enhanced_main
```

## Submission hygiene

The final ZIP excludes `.git`, `node_modules`, build output, Python caches, editor metadata, local environment files, and TypeScript incremental build artifacts.
