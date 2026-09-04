const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const workspace = path.resolve(__dirname, '..', '..');
const products = [
  ['ANCRA', 'ANCR-ANCRA1.1'],
  ['ANCRID', 'ANCR-ANCRID'],
  ['COHEIR', 'ANCR-COHEIR'],
  ['INHEIRA', 'ANCR-INHEIRA'],
  ['ANCRSYNC', 'ANCR-ANCRSYNC-'],
  ['CYNAIAH', 'ANCR-CYNAIAH'],
];

async function validate(name, folder) {
  const file = path.join(workspace, folder, 'FUNCTIONAL_REQUIREMENTS_SPECIFICATION.docx');
  if (!fs.existsSync(file)) throw new Error(`${name}: output is missing`);
  const bytes = fs.readFileSync(file);
  if (bytes.length < 30000) throw new Error(`${name}: suspiciously small DOCX (${bytes.length} bytes)`);
  const zip = await JSZip.loadAsync(bytes);
  for (const required of ['[Content_Types].xml', 'word/document.xml', 'word/styles.xml', 'word/_rels/document.xml.rels']) {
    if (!zip.file(required)) throw new Error(`${name}: missing ${required}`);
  }
  const xml = await zip.file('word/document.xml').async('string');
  for (const marker of ['FUNCTIONAL REQUIREMENTS', 'DOCUMENT OVERVIEW', 'LIVING DOCUMENT EXTENSION', 'Requirements evidence flow', 'System context']) {
    if (!xml.includes(marker)) throw new Error(`${name}: missing marker "${marker}"`);
  }
  const ids = new Set(xml.match(new RegExp(`REQ-${name}-\\d{3}`, 'g')) || []);
  const tables = (xml.match(/<w:tbl>/g) || []).length;
  if (!ids.size) throw new Error(`${name}: no requirement IDs found`);
  if (tables < 10) throw new Error(`${name}: expected designed tables/diagrams, found ${tables}`);
  console.log(`${name}: valid ZIP/OpenXML; ${bytes.length} bytes; ${ids.size} requirement IDs; ${tables} editable tables`);
}

async function main() {
  const selected = process.argv.slice(2).map((value) => value.toUpperCase());
  for (const [name, folder] of products) {
    if (!selected.length || selected.includes(name)) await validate(name, folder);
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
