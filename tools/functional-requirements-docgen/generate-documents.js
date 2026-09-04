const fs = require('fs');
const path = require('path');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} = require('docx');

const WORKSPACE = path.resolve(__dirname, '..', '..');
const GENERATED_DATE = 'September 3, 2026';

const PRODUCTS = [
  {
    name: 'ANCRA',
    folder: 'ANCR-ANCRA1.1',
    descriptor: 'Learning, curriculum, and creator development',
    accent: 'C92F1D',
    accent2: '7C2D12',
    accentSoft: 'FDE8E4',
  },
  {
    name: 'ANCRID',
    folder: 'ANCR-ANCRID',
    descriptor: 'Identity, Creator Passport, and ecosystem SSO',
    accent: '007F91',
    accent2: '6D28D9',
    accentSoft: 'E1F8FB',
  },
  {
    name: 'COHEIR',
    folder: 'ANCR-COHEIR',
    descriptor: 'Mentorship, professional review, and career guidance',
    accent: '007C91',
    accent2: '7C3AED',
    accentSoft: 'E0F7FA',
  },
  {
    name: 'INHEIRA',
    folder: 'ANCR-INHEIRA',
    descriptor: 'Song creation evidence, splits, and rights',
    accent: 'B45309',
    accent2: '92400E',
    accentSoft: 'FEF3C7',
  },
  {
    name: 'ANCRSYNC',
    folder: 'ANCR-ANCRSYNC-',
    sourceFile: 'ANCRSYNC_FUNCTIONAL_REQUIREMENTS.md',
    descriptor: 'Real-time creative collaboration, shared workspaces, and ecosystem synchronization',
    accent: '7C3AED',
    accent2: 'DB2777',
    accentSoft: 'F3E8FF',
    specDerived: true,
    status: 'Living working draft · specification-derived',
    evidenceStatus: 'Specification-derived; not implementation-verified (the current folder contains ANCRLaunch code)',
    evidenceBasis: 'ANCRSync Product Specification v1.0, ANCRSYNC Workflow, and supporting technical specification',
    intent: 'This editable specification converts the approved ANCRSync source set into testable intended behavior. It does not claim that the requirements are implemented, tested, or production-ready; the actual ANCRSync codebase must be identified before implementation traceability can begin.',
  },
  {
    name: 'CYNAIAH',
    folder: 'ANCR-CYNAIAH',
    descriptor: 'AI-assisted creative intelligence and workflow',
    accent: '6D28D9',
    accent2: '0891B2',
    accentSoft: 'EDE9FE',
  },
];

const BODY_COLOR = '20242A';
const MUTED_COLOR = '606873';
const LINE_COLOR = 'D9DEE5';
const SURFACE_COLOR = 'F6F8FA';
const DARK_COLOR = '111318';
const WHITE = 'FFFFFF';

function borders(color = LINE_COLOR, size = 4) {
  const edge = { style: BorderStyle.SINGLE, size, color };
  return { top: edge, bottom: edge, left: edge, right: edge, insideHorizontal: edge, insideVertical: edge };
}

function noBorders() {
  const edge = { style: BorderStyle.NONE, size: 0, color: WHITE };
  return { top: edge, bottom: edge, left: edge, right: edge, insideHorizontal: edge, insideVertical: edge };
}

function cellMargins(top = 110, right = 130, bottom = 110, left = 130) {
  return { top, right, bottom, left };
}

function solidCell(text, fill, color = WHITE, options = {}) {
  return new TableCell({
    shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
    margins: cellMargins(options.top || 140, options.right || 120, options.bottom || 140, options.left || 120),
    verticalAlign: VerticalAlign.CENTER,
    width: options.width,
    children: [
      new Paragraph({
        alignment: options.alignment || AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text,
            color,
            bold: options.bold !== false,
            size: options.size || 18,
            font: options.font || 'Lexend',
            allCaps: options.allCaps === true,
          }),
        ],
      }),
    ],
  });
}

function labelValueTable(rows, theme) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borders(LINE_COLOR, 3),
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 29, type: WidthType.PERCENTAGE },
            shading: { fill: theme.accentSoft, type: ShadingType.CLEAR, color: 'auto' },
            margins: cellMargins(),
            children: [new Paragraph({ children: [new TextRun({ text: label.toUpperCase(), bold: true, color: theme.accent2, size: 17, font: 'Lexend' })] })],
          }),
          new TableCell({
            width: { size: 71, type: WidthType.PERCENTAGE },
            margins: cellMargins(),
            children: [new Paragraph({ children: inlineRuns(value, { size: 19 }) })],
          }),
        ],
      }),
    ),
  });
}

function inlineRuns(markdown, base = {}) {
  const text = String(markdown || '')
    .replace(/\\([*_`])/g, '$1')
    .replace(/<br\s*\/?\s*>/gi, ' · ');
  const runs = [];
  const token = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let cursor = 0;
  let match;
  while ((match = token.exec(text)) !== null) {
    if (match.index > cursor) {
      runs.push(new TextRun({ text: text.slice(cursor, match.index), color: base.color || BODY_COLOR, size: base.size || 22, font: base.font || 'Lexend' }));
    }
    const value = match[0];
    if (value.startsWith('**')) {
      runs.push(new TextRun({ text: value.slice(2, -2), bold: true, color: base.color || BODY_COLOR, size: base.size || 22, font: base.font || 'Lexend' }));
    } else if (value.startsWith('`')) {
      runs.push(new TextRun({ text: value.slice(1, -1), color: base.codeColor || '7A3E00', size: (base.size || 22) - 1, font: 'JetBrains Mono', shading: { fill: 'F1F3F5', type: ShadingType.CLEAR, color: 'auto' } }));
    } else if (value.startsWith('[')) {
      const linkMatch = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      runs.push(new TextRun({ text: linkMatch ? `${linkMatch[1]} (${linkMatch[2]})` : value, color: '0563C1', underline: {}, size: base.size || 22, font: base.font || 'Lexend' }));
    } else {
      runs.push(new TextRun({ text: value.slice(1, -1), italics: true, color: base.color || BODY_COLOR, size: base.size || 22, font: base.font || 'Lexend' }));
    }
    cursor = match.index + value.length;
  }
  if (cursor < text.length) {
    runs.push(new TextRun({ text: text.slice(cursor), color: base.color || BODY_COLOR, size: base.size || 22, font: base.font || 'Lexend' }));
  }
  return runs.length ? runs : [new TextRun({ text: '', size: base.size || 22, font: base.font || 'Lexend' })];
}

function cleanMarkdownCell(value) {
  return value.trim().replace(/^\s*\|/, '').replace(/\|\s*$/, '').trim();
}

function splitTableRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map(cleanMarkdownCell);
}

function isSeparatorRow(line) {
  return /^\s*\|?\s*:?-{3,}/.test(line) && line.includes('|');
}

function markdownTable(lines, start, theme) {
  const parsedRows = [];
  let index = start;
  while (index < lines.length && lines[index].trim().startsWith('|')) {
    if (!isSeparatorRow(lines[index])) parsedRows.push(splitTableRow(lines[index]));
    index += 1;
  }
  const columnCount = Math.max(...parsedRows.map((row) => row.length));
  const rows = parsedRows.map((row, rowIndex) =>
    new TableRow({
      tableHeader: rowIndex === 0,
      cantSplit: true,
      children: Array.from({ length: columnCount }, (_, columnIndex) => {
        const fill = rowIndex === 0 ? theme.accent2 : rowIndex % 2 ? WHITE : SURFACE_COLOR;
        const color = rowIndex === 0 ? WHITE : BODY_COLOR;
        return new TableCell({
          shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins(85, 95, 85, 95),
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 245 },
              children: inlineRuns(row[columnIndex] || '', { size: rowIndex === 0 ? 16 : 15, color }),
            }),
          ],
        });
      }),
    }),
  );
  return {
    index,
    element: new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: borders(LINE_COLOR, 2), rows }),
  };
}

function requirementBanner(id, theme, title = '') {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            shading: { fill: theme.accentSoft, type: ShadingType.CLEAR, color: 'auto' },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: WHITE },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: theme.accent },
              left: { style: BorderStyle.SINGLE, size: 18, color: theme.accent },
              right: { style: BorderStyle.NONE, size: 0, color: WHITE },
            },
            margins: cellMargins(100, 130, 100, 150),
            children: [new Paragraph({ keepNext: true, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: title ? `${id} — ${title}` : id, bold: true, color: theme.accent2, font: 'JetBrains Mono', size: 19 })] })],
          }),
        ],
      }),
    ],
  });
}

function accentRule(theme) {
  return new Paragraph({
    spacing: { before: 100, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: theme.accent, space: 1 } },
    children: [new TextRun({ text: '' })],
  });
}

function addPageBreak(children) {
  if (children.length) children.push(new Paragraph({ children: [new PageBreak()] }));
}

function markdownToDocx(lines, theme) {
  const children = [];
  let codeBlock = false;
  let index = 0;
  while (index < lines.length) {
    let line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      codeBlock = !codeBlock;
      index += 1;
      continue;
    }
    if (codeBlock) {
      children.push(new Paragraph({ shading: { fill: 'F1F3F5', type: ShadingType.CLEAR, color: 'auto' }, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: line, font: 'JetBrains Mono', size: 16, color: '30343B' })] }));
      index += 1;
      continue;
    }
    if (!trimmed) {
      index += 1;
      continue;
    }
    if (trimmed.startsWith('|') && index + 1 < lines.length && isSeparatorRow(lines[index + 1])) {
      const table = markdownTable(lines, index, theme);
      children.push(table.element, new Paragraph({ spacing: { after: 90 }, children: [] }));
      index = table.index;
      continue;
    }
    if (/^---+$/.test(trimmed)) {
      children.push(accentRule(theme));
      index += 1;
      continue;
    }

    const quote = trimmed.startsWith('>');
    if (quote) line = trimmed.replace(/^>\s?/, '');

    const requirementHeading = line.match(/^###\s+(REQ-[A-Z0-9-]+)(?:\s+[—-]\s+(.+))?$/);
    const requirementStandalone = trimmed.match(/^\*\*(REQ-[A-Z0-9-]+)\*\*$/);
    if (requirementHeading || requirementStandalone) {
      const match = requirementHeading || requirementStandalone;
      children.push(requirementBanner(match[1], theme, requirementHeading ? match[2] || '' : ''));
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      if (level === 2 && children.length) addPageBreak(children);
      children.push(
        new Paragraph({
          heading: level <= 2 ? HeadingLevel.HEADING_1 : level === 3 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          keepNext: true,
          children: inlineRuns(heading[2], { color: level <= 2 ? theme.accent2 : BODY_COLOR, size: level <= 2 ? 40 : level === 3 ? 30 : 24 }),
        }),
      );
      index += 1;
      continue;
    }

    const inlineBehavior = trimmed.match(/^\*\*Given\*\*\s*(.*?),\s*\*\*when\*\*\s*(.*?),\s*\*\*then\*\*\s*(.*)$/i);
    if (inlineBehavior) {
      [['Given', inlineBehavior[1]], ['When', inlineBehavior[2]], ['Then', inlineBehavior[3]]].forEach(([label, value]) => {
        children.push(new Paragraph({ keepNext: label !== 'Then', spacing: { before: 35, after: 55, line: 280 }, indent: { left: 180 }, children: [new TextRun({ text: `${label}  `, bold: true, color: theme.accent, font: 'Lexend', size: 21 }), ...inlineRuns(value, { size: 21 })] }));
      });
      index += 1;
      continue;
    }

    const behavior = trimmed.match(/^\*\*(Given|When|Then)\*\*\s*(.*)$/);
    if (behavior) {
      children.push(
        new Paragraph({
          keepNext: behavior[1] !== 'Then',
          spacing: { before: 35, after: 55, line: 280 },
          indent: { left: 180 },
          children: [
            new TextRun({ text: `${behavior[1]}  `, bold: true, color: theme.accent, font: 'Lexend', size: 21 }),
            ...inlineRuns(behavior[2], { size: 21 }),
          ],
        }),
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      children.push(new Paragraph({ numbering: { reference: 'ancr-bullets', level: 0 }, spacing: { after: 70, line: 280 }, children: inlineRuns(trimmed.replace(/^[-*]\s+/, ''), { size: 21 }) }));
      index += 1;
      continue;
    }

    const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numbered) {
      children.push(new Paragraph({ indent: { left: 240, hanging: 200 }, spacing: { after: 70, line: 280 }, children: [new TextRun({ text: `${numbered[1]}. `, bold: true, color: theme.accent, size: 21, font: 'Lexend' }), ...inlineRuns(numbered[2], { size: 21 })] }));
      index += 1;
      continue;
    }

    const isSummary = /^\*\*Summary:/.test(trimmed);
    children.push(
      new Paragraph({
        shading: isSummary || quote ? { fill: quote ? theme.accentSoft : 'EEF2F6', type: ShadingType.CLEAR, color: 'auto' } : undefined,
        border: quote ? { left: { style: BorderStyle.SINGLE, size: 14, color: theme.accent, space: 8 } } : undefined,
        indent: quote ? { left: 220 } : undefined,
        spacing: { before: 0, after: 110, line: 285 },
        children: inlineRuns(line, { size: 21 }),
      }),
    );
    index += 1;
  }
  return children;
}

function parseSource(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const title = (lines.find((line) => line.startsWith('# ')) || '# Functional Requirements').slice(2).trim();
  const firstRule = lines.findIndex((line) => /^---+$/.test(line.trim()));
  const metadata = {};
  for (const line of lines.slice(1, firstRule > 0 ? firstRule : 10)) {
    const match = line.match(/^\*\*([^:]+):\*\*\s*(.*)$/);
    if (match) metadata[match[1].trim()] = match[2].trim();
  }
  const contentLines = lines.slice(firstRule >= 0 ? firstRule + 1 : 1);
  const domains = [];
  let inRequirements = false;
  for (const line of contentLines) {
    if (/^##\s+1\./.test(line)) inRequirements = true;
    if (/^##\s+2\./.test(line)) inRequirements = false;
    const match = inRequirements && line.match(/^###\s+1\.\d+\s+(.+)$/);
    if (match) domains.push(match[1].trim());
  }
  const requirementIds = new Set(
    contentLines
      .map((line) => {
        const match = line.match(/^\*\*(REQ-[A-Z0-9-]+)\*\*$/) || line.match(/^###\s+(REQ-[A-Z0-9-]+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean),
  );
  const specGaps = contentLines.filter((line) => /^\|\s*G\d+\s*\|/.test(line)).length;
  let openQuestions = contentLines.filter((line) => /^\*\*Q\d+\b/.test(line)).length;
  if (!openQuestions) {
    let inOpenQuestions = false;
    for (const line of contentLines) {
      if (/^##\s+\d+\.\s+.*(?:OPEN QUESTIONS|DECISIONS REQUIRED)/i.test(line)) {
        inOpenQuestions = true;
        continue;
      }
      if (inOpenQuestions && /^##\s+/.test(line)) break;
      if (inOpenQuestions && /^\d+\.\s+/.test(line)) openQuestions += 1;
    }
  }
  if (!domains.length) {
    for (const line of contentLines) {
      const match = line.match(/^##\s+(\d+)\.\s+(.+)$/);
      if (match && Number(match[1]) >= 1 && Number(match[1]) <= 13) domains.push(match[2].trim());
    }
  }
  const sectionNumbers = contentLines.map((line) => (line.match(/^##\s+(\d+)\./) || [])[1]).filter(Boolean).map(Number);
  const livingSectionNumber = sectionNumbers.length ? Math.max(...sectionNumbers) + 1 : 5;
  return { title, metadata, contentLines, domains, requirementCount: requirementIds.size, specGaps, openQuestions, livingSectionNumber };
}

function metricsTable(source, theme) {
  const metrics = [
    [String(source.requirementCount), 'FUNCTIONAL REQUIREMENTS'],
    [String(source.domains.length), 'FEATURE DOMAINS'],
    [String(source.specGaps), 'SPEC GAPS'],
    [String(source.openQuestions), 'OPEN DECISIONS'],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: metrics.map(([value, label], index) =>
          new TableCell({
            shading: { fill: index % 2 ? theme.accent2 : theme.accent, type: ShadingType.CLEAR, color: 'auto' },
            margins: cellMargins(160, 80, 160, 80),
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 35 }, children: [new TextRun({ text: value, bold: true, size: 34, color: WHITE, font: 'Lexend' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: label, bold: true, size: 13, color: WHITE, font: 'JetBrains Mono' })] }),
            ],
          }),
        ),
      }),
    ],
  });
}

function flowTable(theme, product) {
  const steps = product.specDerived
    ? ['SOURCE SPECS', 'TESTABLE REQS', 'TEST DESIGN', 'IMPLEMENTATION', 'VERIFICATION']
    : ['SOURCE CODE', 'FUNCTIONS', 'TEST EVIDENCE', 'GAP REVIEW', 'DECISIONS'];
  const cells = [];
  steps.forEach((step, index) => {
    cells.push(solidCell(step, index % 2 ? theme.accent2 : theme.accent, WHITE, { size: 13 }));
    if (index < steps.length - 1) cells.push(solidCell('→', WHITE, theme.accent, { size: 20, width: { size: 4, type: WidthType.PERCENTAGE } }));
  });
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Requirements evidence flow', color: theme.accent2, size: 30, font: 'Lexend' })] }),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: product.specDerived ? `${product.name} requirements remain traceable from authoritative specifications through implementation and verification.` : `${product.name} requirements remain traceable from observed implementation through verification and product decisions.`, color: MUTED_COLOR, size: 18, font: 'Lexend' })] }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders(), rows: [new TableRow({ children: cells })] }),
  ];
}

function domainGrid(domains, theme) {
  const items = domains.length ? domains : ['Functional behavior', 'Test coverage', 'Specification gaps'];
  const rows = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(
      new TableRow({
        children: Array.from({ length: 3 }, (_, offset) => {
          const value = items[i + offset] || '';
          return new TableCell({
            shading: { fill: value ? (i / 3) % 2 ? SURFACE_COLOR : theme.accentSoft : WHITE, type: ShadingType.CLEAR, color: 'auto' },
            borders: borders(value ? theme.accent : WHITE, value ? 3 : 0),
            margins: cellMargins(130, 120, 130, 120),
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: value, bold: Boolean(value), color: value ? theme.accent2 : WHITE, size: 16, font: 'Lexend' })] })],
          });
        }),
      }),
    );
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders(), rows });
}

function contextDiagram(theme, product) {
  const labels = ['CREATOR / OPERATOR', '→', product.name, '→', 'API + DATA SERVICES', '→', 'ANCR ECOSYSTEM'];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders(),
    rows: [
      new TableRow({
        children: labels.map((label, index) => {
          if (label === '→') return solidCell(label, WHITE, theme.accent, { size: 20 });
          const fill = label === product.name ? theme.accent : label === 'ANCR ECOSYSTEM' ? theme.accent2 : DARK_COLOR;
          return solidCell(label, fill, WHITE, { size: 13 });
        }),
      }),
    ],
  });
}

function livingDocumentSection(theme, product, nextRequirementNumber, sectionNumber) {
  const padded = String(nextRequirementNumber).padStart(3, '0');
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: `${sectionNumber}. LIVING DOCUMENT EXTENSION`, color: theme.accent2, size: 40, font: 'Lexend' })] }),
    new Paragraph({ spacing: { after: 140, line: 285 }, children: inlineRuns('Use this section to add approved functionality without disturbing the implementation-derived baseline above. Assign the next sequential ID, name the evidence or decision source, and add acceptance behavior before development begins.', { size: 21 }) }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'New requirement template', color: theme.accent2, size: 30, font: 'Lexend' })] }),
    requirementBanner(`REQ-${product.name}-${padded}`, theme),
    labelValueTable([
      ['Requirement name', '[Add a concise capability name]'],
      ['Status', 'Proposed'],
      ['Owner', '[Product owner]'],
      ['Source', '[Decision, user research, regulation, defect, or roadmap item]'],
      ['Priority / release', '[P0–P3] / [Target release]'],
    ], theme),
    new Paragraph({ spacing: { before: 130, after: 55 }, children: [new TextRun({ text: 'Given  ', bold: true, color: theme.accent, size: 21, font: 'Lexend' }), new TextRun({ text: '[precondition or actor context]', size: 21, font: 'Lexend' })] }),
    new Paragraph({ spacing: { after: 55 }, children: [new TextRun({ text: 'When  ', bold: true, color: theme.accent, size: 21, font: 'Lexend' }), new TextRun({ text: '[user or system action]', size: 21, font: 'Lexend' })] }),
    new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: 'Then  ', bold: true, color: theme.accent, size: 21, font: 'Lexend' }), new TextRun({ text: '[observable result, validation, and error behavior]', size: 21, font: 'Lexend' })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Revision register', color: theme.accent2, size: 30, font: 'Lexend' })] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: borders(LINE_COLOR, 3),
      rows: [
        new TableRow({ tableHeader: true, children: ['VERSION', 'DATE', 'AUTHOR / OWNER', 'CHANGE SUMMARY', 'APPROVAL'].map((text) => solidCell(text, theme.accent2, WHITE, { size: 14 })) }),
        new TableRow({ children: ['0.1', GENERATED_DATE, 'Implementation review', 'Initial functional-requirements baseline', 'Working draft'].map((text) => solidCell(text, WHITE, BODY_COLOR, { size: 14, bold: false })) }),
        new TableRow({ children: ['', '', '', '', ''].map((text) => solidCell(text, theme.accentSoft, BODY_COLOR, { size: 14, bold: false, top: 200, bottom: 200 })) }),
        new TableRow({ children: ['', '', '', '', ''].map((text) => solidCell(text, WHITE, BODY_COLOR, { size: 14, bold: false, top: 200, bottom: 200 })) }),
      ],
    }),
  ];
}

function makeHeader(theme, product) {
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { ...noBorders(), bottom: { style: BorderStyle.SINGLE, size: 8, color: theme.accent } },
        rows: [new TableRow({ children: [solidCell(product.name, WHITE, theme.accent2, { alignment: AlignmentType.LEFT, size: 16 }), solidCell('FUNCTIONAL REQUIREMENTS SPECIFICATION', WHITE, MUTED_COLOR, { alignment: AlignmentType.RIGHT, size: 12 })] })],
      }),
    ],
  });
}

function makeFooter(theme) {
  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE_COLOR, space: 4 } },
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: 'ANCR · Living working draft   |   ', color: MUTED_COLOR, size: 14, font: 'Lexend' }), new TextRun({ children: ['Page ', PageNumber.CURRENT], color: theme.accent2, size: 14, font: 'JetBrains Mono' })],
      }),
    ],
  });
}

function documentStyles(theme) {
  return {
    default: {
      document: {
        run: { font: 'Lexend', size: 22, color: BODY_COLOR },
        paragraph: { spacing: { after: 110, line: 285 } },
      },
    },
    paragraphStyles: [
      {
        id: 'Title',
        name: 'Title',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: 'Lexend', size: 52, color: DARK_COLOR, bold: false },
        paragraph: { spacing: { before: 0, after: 160 }, outlineLevel: 0 },
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: 'Lexend', size: 40, color: theme.accent2, bold: false },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: 'Lexend', size: 30, color: DARK_COLOR, bold: true },
        paragraph: { spacing: { before: 210, after: 100 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: 'Lexend', size: 24, color: theme.accent2, bold: true },
        paragraph: { spacing: { before: 160, after: 90 }, outlineLevel: 2 },
      },
    ],
  };
}

function buildDocument(product, source) {
  const theme = product;
  const metaRows = [
    ['Product', product.name],
    ['Document class', 'Industry Functional Requirements Specification'],
    ['Status', product.status || 'Living working draft · implementation-derived'],
    ['Scope', product.descriptor],
    ['Evidence basis', product.evidenceBasis || source.metadata['Derived from'] || 'Application source, tests, and product specifications'],
    ['Evidence status', product.evidenceStatus || source.metadata['Evidence status'] || 'Implementation-derived; reconcile against approved product decisions'],
    ['Prepared', GENERATED_DATE],
  ];

  const children = [
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders(), rows: [new TableRow({ children: [solidCell('ANCR PRODUCT SYSTEM', theme.accent, WHITE, { alignment: AlignmentType.LEFT, size: 14, top: 90, bottom: 90 })] })] }),
    new Paragraph({ spacing: { before: 500, after: 70 }, children: [new TextRun({ text: product.name, bold: true, color: theme.accent, size: 22, font: 'JetBrains Mono', allCaps: true })] }),
    new Paragraph({ style: 'Title', children: [new TextRun({ text: 'FUNCTIONAL REQUIREMENTS', color: DARK_COLOR, size: 52, font: 'Lexend' })] }),
    new Paragraph({ spacing: { after: 280 }, children: [new TextRun({ text: product.descriptor, color: MUTED_COLOR, size: 24, font: 'Lexend' })] }),
    accentRule(theme),
    labelValueTable(metaRows, theme),
    new Paragraph({ spacing: { before: 240, after: 100 }, children: [new TextRun({ text: 'DOCUMENT INTENT', bold: true, color: theme.accent2, font: 'JetBrains Mono', size: 15 })] }),
    new Paragraph({ spacing: { after: 120, line: 290 }, children: inlineRuns(product.intent || 'This editable specification records observed system behavior, validation and error states, test evidence, divergence from product specifications, and unresolved product decisions. It is a controlled baseline—not a claim that every described capability is production-ready.', { size: 21 }) }),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'DOCUMENT OVERVIEW', color: theme.accent2, size: 40, font: 'Lexend' })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Contents', color: theme.accent2, size: 30, font: 'Lexend' })] }),
    labelValueTable([
      ['01', 'Functional behavior baseline'],
      ['02', 'Validation and test readiness'],
      ['03', 'Implementation / specification reconciliation'],
      ['04', 'Open decisions'],
      ['05', 'Living document extension'],
    ], theme),
    new Paragraph({ spacing: { after: 180 }, children: [] }),
    metricsTable(source, theme),
    new Paragraph({ spacing: { after: 180 }, children: [] }),
    ...flowTable(theme, product),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Functional domains', color: theme.accent2, size: 30, font: 'Lexend' })] }),
    domainGrid(source.domains, theme),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'System context', color: theme.accent2, size: 30, font: 'Lexend' })] }),
    contextDiagram(theme, product),
    new Paragraph({ spacing: { before: 140, after: 0 }, children: [new TextRun({ text: 'Diagram note: these are editable Word tables. Replace labels, add columns, or extend flows as the architecture matures.', italics: true, color: MUTED_COLOR, size: 16, font: 'Lexend' })] }),
    new Paragraph({ children: [new PageBreak()] }),
    ...markdownToDocx(source.contentLines, theme),
    ...livingDocumentSection(theme, product, source.requirementCount + 1, source.livingSectionNumber),
  ];

  return new Document({
    creator: 'ANCR Product & Engineering',
    title: `${product.name} Functional Requirements Specification`,
    subject: product.descriptor,
    description: 'Editable implementation-derived functional requirements with test coverage, specification gaps, diagrams, and a living extension register.',
    styles: documentStyles(theme),
    numbering: {
      config: [
        {
          reference: 'ancr-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 420, hanging: 220 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 920, right: 850, bottom: 850, left: 850, header: 350, footer: 350 },
          },
        },
        headers: { default: makeHeader(theme, product) },
        footers: { default: makeFooter(theme) },
        children,
      },
    ],
  });
}

async function generateProduct(product) {
  const sourcePath = path.join(WORKSPACE, product.folder, product.sourceFile || 'FUNCTIONAL_REQUIREMENTS.md');
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing source: ${sourcePath}`);
  const markdown = fs.readFileSync(sourcePath, 'utf8');
  const source = parseSource(markdown);
  const document = buildDocument(product, source);
  const outputPath = path.join(WORKSPACE, product.folder, 'FUNCTIONAL_REQUIREMENTS_SPECIFICATION.docx');
  fs.writeFileSync(outputPath, await Packer.toBuffer(document));
  return { product: product.name, outputPath, ...source };
}

async function main() {
  const filter = process.argv.slice(2).map((name) => name.toUpperCase());
  const selected = filter.length ? PRODUCTS.filter((product) => filter.includes(product.name)) : PRODUCTS;
  if (!selected.length) throw new Error(`No matching product. Choose from: ${PRODUCTS.map((product) => product.name).join(', ')}`);
  const results = [];
  for (const product of selected) results.push(await generateProduct(product));
  const indexLines = [
    '# Functional Requirements Package',
    '',
    `Generated ${GENERATED_DATE}. Scope is limited to ${PRODUCTS.map((product) => product.name).join(', ')}.`,
    '',
    '| Product | Requirements | Domains | Spec gaps | Open decisions | Editable document |',
    '|---|---:|---:|---:|---:|---|',
    ...results.map((result) => `| ${result.product} | ${result.requirementCount} | ${result.domains.length} | ${result.specGaps} | ${result.openQuestions} | [FUNCTIONAL_REQUIREMENTS_SPECIFICATION.docx](../${path.basename(path.dirname(result.outputPath))}/FUNCTIONAL_REQUIREMENTS_SPECIFICATION.docx) |`),
    '',
    'The Markdown files remain the evidence-rich source drafts. The DOCX files are the designed, editable working specifications and include native-table diagrams plus a living-requirements extension section.',
    '',
  ];
  const indexPath = path.join(WORKSPACE, 'docs', 'FUNCTIONAL_REQUIREMENTS_PACKAGE.md');
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf8');
  for (const result of results) {
    console.log(`${result.product}: ${result.requirementCount} requirements, ${result.domains.length} domains, ${result.specGaps} gaps, ${result.openQuestions} questions -> ${result.outputPath}`);
  }
  console.log(`Index -> ${indexPath}`);
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
