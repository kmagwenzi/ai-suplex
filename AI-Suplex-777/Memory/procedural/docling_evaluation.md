# AI-Suplex Procedural Memory — Docling Evaluation

## Purpose
Evaluate Docling (docling-project/docling, open-source Python library) as a document ingestion pipeline for AI-Suplex — converting PDFs, DOCX, PPTX, and other non-markdown documents into markdown artifacts that feed the 3-layer memory stack.

## What Docling Is

| Feature | Detail |
|---------|--------|
| **Type** | Python library + CLI tool |
| **License** | MIT — open source |
| **Input** | PDF, DOCX, PPTX, HTML, images (PNG, JPG, TIFF) |
| **Output** | Markdown, JSON, DocTags (structured) |
| **Key feature** | Layout-aware conversion — preserves tables, headings, lists, code blocks |
| **Use case** | Document understanding for RAG, LLM ingestion, knowledge extraction |

## How It Sits Alongside AI-Suplex

```
PDF / DOCX / PPTX (client docs, contracts, research papers, briefs)
    ↓
DOCLING — converts to structured markdown
    ↓
Markdown file lands in your vault (Artifacts/ or a docs/ folder)
    ↓
AI-Suplex session reads the markdown, extracts key information
    ↓
Insights captured → Lessons extracted → Memory promoted
    ↓
Client asks AnythingLLM: "What did the contract say?"
    → AnythingLLM reads the converted document from the vault
```

## Complementary Analysis

| Layer | Docling's Role |
|-------|---------------|
| **Episodic** | Document conversions are artifacts produced during a session |
| **Semantic** | Stable facts extracted from documents (e.g., client rules from contracts) |
| **Procedural** | A "document ingestion" workflow procedure |
| **Lessons** | Learnings from document analysis |

## Specific Use Cases

### 1. Client Contract Analysis
```
Client sends PDF contract → Docling converts → AI reads → extracts:
  • Payment terms: 30 days
  • Scope: website redesign
  • Timeline: 6 weeks
→ Stored as semantic memory for that client
→ Session reports reference the extracted terms
→ Client asks "What are the payment terms?" → answered from memory
```

### 2. Research Paper Ingestion
```
PDF research paper → Docling → structured markdown
→ AI reads → identifies key findings, methodologies, citations
→ Produces artifact: "Summary of [paper title]"
→ Extracts lessons → promotes to procedural memory
→ Next time same topic comes up, the knowledge is already there
```

### 3. Client Brief Processing
```
Client sends Word doc brief → Docling → clean markdown
→ Tasklist generated FROM the brief → session executes
→ Every requirement is traceable to the source document
→ Client asks "Is my requirement about X in scope?" → answered from episodic memory
```

## Verdict

| Question | Answer |
|----------|--------|
| **Is Docling valuable for AI-Suplex?** | Yes — it bridges the gap between client documents (PDF/DOCX) and the markdown-native vault |
| **Is it required?** | No — the vault works without it. Most content starts as markdown or text |
| **Priority** | Low for product launch. Medium for client service. High for research/document-heavy work |
| **Setup effort** | Install Python, `pip install docling`, run CLI command |

## Recommendation

Include Docling as a recommended tool in the "Knowledge Building" section of the guides. Not a core dependency — but for power users and client-facing work, it turns every document into an ingestible, learnable, queryable artifact.
