# ⚖️ Lexora — AI Moot Court & Legal Reasoning Assistant

> **Practice. Challenge. Defend. Improve.**

Lexora is an **AI-powered educational legal reasoning and moot-court practice platform** designed for law students. It turns hypothetical case facts into structured practice arguments, helps students anticipate opposing arguments, explains legal reasoning in plain language, evaluates argument quality, and provides a multi-round virtual moot-court experience with voice interaction.

The platform is deliberately designed as an **educational sandbox**: it supports learning, reasoning practice, rebuttal preparation, and oral advocacy—not professional legal advice or authoritative legal research.

---

## 🎯 Project Vision

Legal education requires students to do more than memorize legal concepts. They must learn how to:

- identify the real legal issue,
- select and state the relevant legal principle,
- connect facts to legal elements,
- construct a defensible conclusion,
- anticipate the strongest opposing argument,
- explain complex reasoning clearly, and
- defend a position under pressure.

Lexora brings these activities together in one guided practice environment.

### Core learning loop

```text
                  ┌─────────────────────────┐
                  │  Hypothetical Case      │
                  │  Facts + Issue + Context │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │ Source-Aware Learning   │
                  │ + Legal Context (RAG)   │
                  └────────────┬────────────┘
                               │
                               ▼
              ┌──────────────────────────────────┐
              │       Lexora AI Workspace        │
              │                                  │
              │  IRAC       Counter-Argument     │
              │  Explainer  Strength Diagnostic  │
              │  Moot Court + Voice              │
              └────────────────┬─────────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │ Educational Feedback    │
                  │ + Verification Notes    │
                  └─────────────────────────┘
```

---

# ✨ What the Platform Provides

## 1. 🧠 IRAC Practice Brief Generation

Students provide a hypothetical case and receive a structured practice argument following:

**Issue → Rule → Application → Conclusion**

The system is designed to:

- identify the central legal issue,
- present general legal principles,
- apply supplied facts to those principles,
- reach a reasoned practice conclusion,
- distinguish facts from assumptions,
- highlight uncertainty where facts are insufficient, and
- avoid fabricated authorities.

This keeps the AI focused on **legal reasoning practice rather than invented legal research**.

---

## 2. ⚔️ Counter-Argument Mode

Lexora can switch perspectives and act as opposing counsel.

The counter-argument workflow helps students identify:

- the strongest argument against their position,
- weaknesses in their reasoning,
- unsupported assumptions,
- alternative interpretations of the facts,
- missing legal elements,
- likely rebuttals, and
- questions an opposing advocate may raise.

This turns one-way AI generation into a **two-sided advocacy exercise**.

---

## 3. 📖 Plain-Language Legal Explainer

Dense legal reasoning can be difficult for junior students.

The explainer mode converts generated or supplied reasoning into clearer language while preserving the underlying legal logic.

It focuses on:

- plain-English explanations,
- important terminology,
- step-by-step reasoning,
- preservation of legal nuance, and
- accessibility for students learning legal analysis.

The objective is **simplification without destroying the reasoning**.

---

## 4. 🎙️ Virtual Moot Court

The Virtual Moot Court provides a multi-round advocacy environment.

A student can:

1. state an argument,
2. receive an AI challenge,
3. respond to the challenge,
4. continue through multiple rounds,
5. practice rebuttal,
6. use browser speech-to-text where supported, and
7. receive a final educational debrief.

The browser **Web Speech API** enables oral advocacy practice without requiring a separate speech-recognition service for the core interaction.

---

## 5. 📊 Argument Strength Diagnostic

The platform provides educational feedback around areas such as:

- structure,
- reasoning,
- factual application,
- persuasiveness,
- rebuttal readiness,
- weaknesses, and
- opportunities for improvement.

The score is an **informal learning diagnostic**, not a professional legal assessment.

---

## 6. 📄 Export and Session History

Students can work with generated practice material through:

- copy workflows,
- text output,
- PDF export,
- browser-based session history, and
- comparison/review of previous practice work.

For the MVP, browser storage keeps the experience lightweight and avoids unnecessary database infrastructure.

---

# 🆕 Source-Aware Legal Learning / RAG

One of the major submission improvements is the **source-aware legal learning layer**.

## Why RAG?

A normal generative AI system can produce fluent legal-sounding text without reliable grounding.

For an educational legal tool, that is a major risk.

Lexora therefore introduces a Retrieval-Augmented Generation style workflow:

```text
Student Query
     │
     ▼
Normalize + Validate
     │
     ▼
Retrieve relevant educational material
     │
     ├── Subject match
     ├── Jurisdiction match
     └── Concept/text relevance
     │
     ▼
Rank retrieved context
     │
     ▼
Attach provenance + verification metadata
     │
     ▼
Use context for educational generation
     │
     ▼
Return practice reasoning
     │
     ▼
Remind student to verify authoritative law
```

## RAG implementation

The current additive implementation uses:

```text
backend/data/legal_knowledge.json
backend/services/legal_rag_service.py
backend/routes/learning_routes.py
public/legal-learning.html
```

The retrieval engine is intentionally **dependency-light and transparent**.

It:

1. tokenizes the query,
2. compares concepts against the local educational corpus,
3. considers title, subject, jurisdiction, and explanatory text,
4. boosts jurisdiction/subject matches,
5. ranks matching educational notes,
6. returns source metadata, and
7. includes an explicit verification requirement.

### Every retrieved source carries provenance

```text
id
title
text
jurisdiction
subject
source
sourceType
verification
relevanceScore
```

This makes the retrieval process inspectable rather than presenting a black-box "trust me" answer.

---

# ⚖️ RAG Safety and Verification Policy

The RAG layer is intentionally described as **educational grounding**, not as a substitute for authoritative legal research.

The system follows:

```text
Retrieved educational context
            ↓
       Source metadata
            ↓
     Practice generation
            ↓
   Verification reminder
            ↓
Student checks authoritative law
```

### Important distinction

**RAG grounding does not automatically make generated legal content legally authoritative.**

Current statutes, regulations, procedural rules, and controlling decisions can change. Students should independently verify any legal proposition before using it outside this educational environment.

---

# 🔌 Source-Aware Learning API

### Retrieve educational context

```http
POST /api/learning/retrieve
```

Example:

```json
{
  "query": "offer acceptance breach contract",
  "jurisdiction": "India (Common Law)",
  "subject": "Contract Law",
  "top_k": 4
}
```

### List source information

```http
GET /api/learning/sources
```

### Generate source-grounded practice IRAC

```http
POST /api/learning/grounded-irac
```

Example request:

```json
{
  "facts": "A student agreed to purchase a textbook for a stated price and later disputed whether a binding agreement existed.",
  "issue": "Whether the parties formed an enforceable agreement.",
  "jurisdiction": "India (Common Law)",
  "subject": "Contract Law",
  "student_position": "FOR"
}
```

The grounded workflow retrieves relevant educational context first and then passes that context into the configured AI provider.

---

# 🛡️ Validation and Robustness

The submission adds a dedicated hardening layer without rewriting the original application logic.

```text
backend/security_hardening.py
```

## Input validation

The hardened path checks:

- minimum material case-fact length,
- maximum fact length,
- maximum field lengths,
- malformed JSON,
- control characters,
- oversized request bodies, and
- invalid request shapes.

Very short or clearly insufficient case inputs are rejected before unnecessary AI processing.

This improves both reliability and cost control.

---

# 🔐 Security Hardening

The hardened entry point adds multiple defensive controls.

## Request protection

Default maximum request body:

```text
1 MiB
```

## API rate limiting

Default:

```text
60 API requests / client / minute
```

The values are configurable through environment variables.

## Browser security headers

The hardened application adds:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
```

API responses also receive appropriate cache-control behavior.

## Secrets

AI provider credentials remain server-side and are loaded from environment variables.

**Never place API keys in React source code or commit real `.env` files.**

---

# 🤖 AI Provider Resilience

The original implementation supports multiple AI providers:

```text
             ┌───────────────┐
             │ AI Generation │
             └───────┬───────┘
                     │
             ┌───────┴───────┐
             ▼               ▼
          Gemini            Groq
         Primary          Fallback
```

This improves resilience when one provider is unavailable or fails.

The frontend communicates with the backend rather than exposing provider credentials directly to the browser.

---

# 🧠 Responsible Legal-AI Design

Legal hallucination is treated as a first-class design risk.

The system's educational generation strategy is designed to avoid inventing:

- court cases,
- case names,
- case citations,
- statutes,
- statutory sections,
- judgments,
- precedents,
- quotations, or
- facts not supplied by the student.

When information is insufficient, the correct behavior is to **acknowledge the limitation rather than fabricate an answer**.

---

# ⚠️ Educational Disclaimer

Lexora is **not legal advice**.

It:

- does not create an attorney-client relationship,
- should not be used as a substitute for a lawyer,
- should not be treated as authoritative legal research,
- should not be relied upon for real litigation decisions, and
- should not be used to process confidential client information.

All generated content is intended for **education, study, reasoning practice, and moot-court preparation**.

Students should verify legal authorities independently.

---

# 🏗️ System Architecture

## High-level architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    React + TypeScript                    │
│                         Vite UI                          │
├─────────────────────────────────────────────────────────┤
│ Case Input │ IRAC │ Counter │ Explainer │ Moot Court   │
│ History    │ Export │ Voice  │ Diagnostics             │
└───────────────────────────┬─────────────────────────────┘
                            │
                         REST API
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     FastAPI Backend                      │
├─────────────────────────────────────────────────────────┤
│ Existing APIs                                            │
│ ├── Debate / IRAC                                        │
│ ├── Counter-argument                                     │
│ ├── Health                                                │
│ └── Voice                                                 │
│                                                         │
│ Additive quality layer                                   │
│ ├── Validation                                            │
│ ├── Security middleware                                   │
│ ├── Rate limiting                                         │
│ └── Source-aware learning / RAG                           │
└───────────────┬──────────────────────┬───────────────────┘
                │                      │
                ▼                      ▼
        Gemini / Groq             Local Educational
        AI Providers               Knowledge Corpus
                │                      │
                └──────────┬───────────┘
                           ▼
                  Educational Output
```

---

# 🧩 Architectural Principles

The project follows several important engineering principles:

### Separation of concerns

Frontend presentation, API routing, AI provider integration, legal reasoning services, retrieval, and security controls are separated.

### Additive enhancement

The hardening layer is introduced through additional modules rather than unnecessarily rewriting the original application.

### Provider abstraction

AI calls are kept behind backend services, making provider fallback possible.

### Responsible generation

Prompt rules and retrieval policy work together to reduce unsupported legal claims.

### Lightweight MVP design

Browser storage and a local educational corpus avoid unnecessary infrastructure for a student-focused MVP.

### Extensibility

The RAG service can later be expanded to support:

- uploaded course materials,
- verified statutory documents,
- institution-specific resources,
- richer embeddings,
- vector databases,
- PostgreSQL-backed persistence,
- multi-device synchronization, and
- more advanced source ranking.

---

# 📁 Project Structure

```text
repo123-main/
│
├── backend/
│   ├── data/
│   │   └── legal_knowledge.json
│   │
│   ├── routes/
│   │   ├── debate_routes.py
│   │   ├── health_routes.py
│   │   ├── voice_routes.py
│   │   └── learning_routes.py
│   │
│   ├── services/
│   │   ├── debate_service.py
│   │   ├── gemini_service.py
│   │   ├── groq_service.py
│   │   ├── voice_service.py
│   │   └── legal_rag_service.py
│   │
│   ├── tests/
│   │   ├── test_quality_gate.py
│   │   └── test_api_quality_gate.py
│   │
│   ├── main.py
│   ├── enhanced_main.py
│   ├── security_hardening.py
│   ├── config.py
│   └── requirements.txt
│
├── docs/
│   ├── RAG.md
│   └── SECURITY.md
│
├── public/
│   └── legal-learning.html
│
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── types/
│
├── .env.example
├── package.json
├── package-lock.json
├── README.md
└── SUBMISSION_CHECKLIST.md
```

---

# 🧰 Technology Stack

## Frontend

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Motion**
- **Lucide React**
- **jsPDF**
- **Web Speech API**
- **Browser localStorage**

## Backend

- **Python**
- **FastAPI**
- **Uvicorn**
- **Pydantic**
- **Google Gemini**
- **Groq**
- **python-dotenv**
- **SpeechRecognition**
- **pyttsx3**

## Quality / enhancement layer

- Dependency-light source-aware retrieval
- Local educational knowledge corpus
- FastAPI hardening middleware
- Input validation
- Request-size controls
- Rate limiting
- Security headers
- Automated unit/API tests
- Source provenance metadata

---

# ⚙️ Installation

## Prerequisites

Recommended environment:

```text
Node.js 18+
Python 3.10+
pip
```

An API key for at least one configured AI provider is required for AI generation.

---

## 1. Install frontend dependencies

```bash
npm ci
```

---

## 2. Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

For development/testing:

```bash
pip install -r backend/requirements-dev.txt
```

---

## 3. Configure environment variables

Copy:

```text
backend/.env.example
```

to the appropriate local environment configuration.

Configure the provider credentials used by the backend, for example:

```env
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### Security rule

Never commit:

```text
.env
```

and never expose provider credentials in frontend code.

---

# ▶️ Running the Application

## Standard backend

```bash
python -m backend.main
```

## Hardened submission backend

For the enhanced submission/demo path:

```bash
python -m backend.enhanced_main
```

The enhanced entry point imports the existing FastAPI application and adds:

- validation,
- request-size protection,
- rate limiting,
- security headers, and
- source-aware learning routes.

The existing application remains available for compatibility.

---

## Start frontend

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

---

# 🧪 Testing

The submission contains automated quality tests covering both core behavior and the enhancement layer.

Run:

```bash
python -m unittest discover -s backend/tests -p 'test_*.py'
```

The quality suite covers:

- legal position logic,
- input validation,
- short-input rejection,
- maximum input lengths,
- control-character normalization,
- RAG retrieval,
- source provenance,
- API compatibility,
- security headers,
- validation before AI generation.

### Frontend production verification

```bash
npm ci
npm run build
```

---

# 🔍 Recommended Manual Test Matrix

Before demonstration, test the application with several different hypothetical scenarios.

| Scenario | Subject | Expected learning path |
|---|---|---|
| Contract dispute | Contract Law | IRAC → Counter → Explainer |
| Negligence scenario | Tort Law | IRAC → Counter → Explainer |
| Constitutional rights hypothetical | Constitutional Law | IRAC → Counter → Explainer |
| Criminal liability hypothetical | Criminal Law | IRAC → Counter → Explainer |
| Source-aware contract query | Contract Law | RAG → Grounded IRAC |
| Very short input | Any | Validation error |
| Excessively large input | Any | Validation/rejection |
| AI provider unavailable | Any | Provider fallback/error handling |

Use **generic law-school hypotheticals**, not real pending matters or confidential client information.

---

# 🎓 Recommended Demonstration Flow

A strong project demonstration can be completed in one coherent story.

## Step 1 — Introduce the problem

Explain that law students need to practice not only writing an argument but also **challenging and defending it**.

## Step 2 — Enter a hypothetical case

Provide:

- case facts,
- legal issue,
- jurisdiction,
- subject,
- student position.

## Step 3 — Generate IRAC

Demonstrate:

```text
Issue
  ↓
Rule
  ↓
Application
  ↓
Conclusion
```

## Step 4 — Challenge the argument

Activate counter-argument mode.

Show how Lexora identifies the opposition's strongest position.

## Step 5 — Simplify

Use the plain-language explainer to demonstrate accessibility.

## Step 6 — Practice orally

Open Virtual Moot Court and demonstrate a multi-round exchange using voice input where supported.

## Step 7 — Demonstrate RAG

Use:

```text
/legal-learning.html
```

or:

```http
POST /api/learning/retrieve
```

Search:

```text
offer acceptance breach contract
```

Then show:

- retrieved context,
- jurisdiction,
- subject,
- source,
- relevance score,
- verification notice.

## Step 8 — Show robustness

Demonstrate that invalid or excessively short input is rejected before AI processing.

## Step 9 — Show tests

Run:

```bash
python -m unittest discover -s backend/tests -p 'test_*.py'
```

This makes the quality improvements visible rather than merely describing them.

---

# 🔮 Future Enhancements

The current implementation intentionally remains lightweight enough for an academic MVP.

A production-scale version could add:

### Verified document ingestion

Allow students or institutions to upload:

- statutes,
- regulations,
- course notes,
- judgments,
- official legal documents.

Documents could be parsed, chunked, indexed, and retrieved with provenance.

### Vector retrieval

Replace the lightweight lexical retriever with:

```text
Embeddings
   ↓
Vector Database
   ↓
Semantic Retrieval
   ↓
Reranking
```

Potential infrastructure could include PostgreSQL/pgvector or another managed vector store.

### Citation verification

A future version could distinguish:

```text
AI-generated proposition
        ↓
Retrieved authority
        ↓
Verified source
        ↓
Citation shown to student
```

### Persistent accounts

A production deployment could migrate browser-only history to PostgreSQL/Supabase/Firebase for multi-device synchronization.

### Higher-quality TTS

The current browser speech experience can later be complemented by a dedicated cloud TTS provider.

### Institutional knowledge bases

Law schools could maintain jurisdiction/course-specific collections with controlled administrator uploads.

---


# ⭐ Final Project Summary

Lexora is more than a generic AI text generator.

It combines:

```text
                LEGAL EDUCATION
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       IRAC         COUNTER      EXPLAIN
          │            │            │
          └────────────┼────────────┘
                       ▼
                  MOOT COURT
                       │
                 Voice Practice
                       │
                       ▼
             Argument Diagnostics
                       │
                       ▼
              Source-Aware RAG
                       │
                       ▼
             Responsible Verification
```

The result is a **practice-oriented legal reasoning environment** that helps students move from:

> **“I have case facts.”**

to:

> **“I understand the issue.”**

to:

> **“I can structure the argument.”**

to:

> **“I can challenge the opposing side.”**

to:

> **“I can defend my position orally.”**

to:

> **“I know which parts still require independent verification.”**

---

# 📌 Quick Start

```bash
# Frontend
npm ci
npm run dev

# Backend
pip install -r backend/requirements.txt
python -m backend.enhanced_main

# Tests
python -m unittest discover -s backend/tests -p 'test_*.py'

# Production frontend verification
npm run build
```

Configure your AI provider credentials before using AI-generation features.

---

## ⚖️ Final Disclaimer

**Lexora is an educational legal reasoning and moot-court practice assistant. It is not a lawyer, does not provide legal advice, does not create an attorney-client relationship, and does not replace authoritative legal research or professional legal counsel. AI-generated material may be incomplete or incorrect. Always verify legal rules, statutes, regulations, and authorities independently before relying on them outside an educational setting.**

# AI-Court-Legal-Brief-Simplification-and-Argument-Drafting-Assistant-

## Contributors
- Rohit Hanuman Sai Puttagunta (rohithanumansai@gmail.com)
- Lokesh sreeniwas Boddu (lokesh.boddu006@gmail.com)
- Kousik Uppalapati (kousikuppalapati@gmail.com)
- Vivek sai Katuri (katuriviveksai@gmail.com)
