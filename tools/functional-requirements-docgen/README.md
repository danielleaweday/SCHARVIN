# ANCR functional-requirements document generator

Generates the six editable Word specifications requested for ANCRA, ANCRID,
COHEIR, INHEIRA, ANCRSYNC, and CYNAIAH.

```text
npm install
npm run generate
npm run validate
```

The generator preserves the reviewed Markdown requirements as the content
source, adds per-product color, document-control material, editable table-based
diagrams, requirement cards, headers/footers, a living-requirements template,
and a revision register.

ANCRSYNC is intentionally sourced from
`ANCR-ANCRSYNC-/ANCRSYNC_FUNCTIONAL_REQUIREMENTS.md`. The older
`ANCR-ANCRSYNC-/FUNCTIONAL_REQUIREMENTS.md` audits ANCRLaunch code that is in the
wrongly named folder and must not be used as the canonical ANCRSYNC baseline.

The DOCX styles specify Lexend and JetBrains Mono to match the editable Google
Docs visual system. Google Docs supports Lexend directly. A local Word install
without those fonts may display a fallback font until the fonts are installed.

`render-with-word.vbs` and `render-pdf-preview.py` are optional visual-QA helpers;
they do not form part of the generated documents.
