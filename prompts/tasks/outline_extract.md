# Outline Extract (Draft)

Goal: Build a clean outline from extracted chunks without adding new facts.

Inputs:
- detail_level: brief|medium|detailed
- language: zh-tw|en
- chunks: [{kind, text, page, bbox?, url?}]

Constraints:
- Only reorganize/clean text from chunks; do not invent new content.
- Preserve original order of headings (#/##/###) as much as possible.
- Normalize spacing, headings, lists, and tables.

Output:
- Markdown outline suitable for study notes and mindmap conversion.


