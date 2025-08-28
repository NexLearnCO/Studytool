# Section Writer (Draft)

Goal: Write structured sections based on blueprint headings + matched chunks.

Params:
- exam_system, subject, language, detail_level, expansion(0..3)

Rules:
- expansion=0: reorganize only; no new facts.
- expansion=1: fill gaps using matched chunks; must include citations.
- expansion=2: allow brief background, prefix with "補充：".
- expansion=3: allow limited elaboration within syllabus; still accurate.

Formatting:
- Markdown with headings, lists, tables where appropriate.
- Include source marks (doc/page) where possible for Hybrid.


