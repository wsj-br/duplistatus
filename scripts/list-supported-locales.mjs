import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesPath = resolve(__dirname, '../src/locales/ui-languages-complete.json');

const locales = JSON.parse(readFileSync(localesPath, 'utf-8'));
const sampleDate = new Date(2024, 11, 31, 14, 30, 45);
const sampleNum = 1234.56;

console.log(`ICU version: ${process.versions.icu}`);
console.log(`Total entries: ${locales.length}`);
console.log();

let supported = 0;
let unsupported = 0;

for (const loc of locales) {
  let ok = false;
  let dateFmt = '', timeFmt = '', numFmt = '';
  try {
    Intl.getCanonicalLocales(loc.code);
    const match = Intl.NumberFormat.supportedLocalesOf([loc.code]);
    ok = match.length > 0;
    if (ok) {
      dateFmt = new Intl.DateTimeFormat(loc.code, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(sampleDate);
      timeFmt = new Intl.DateTimeFormat(loc.code, { hour: '2-digit', minute: '2-digit' }).format(sampleDate);
      numFmt = new Intl.NumberFormat(loc.code).format(sampleNum);
    }
  } catch {}
  if (ok) supported++; else unsupported++;
  const icon = ok ? '✓' : '✗';
  console.log(`${icon} ${loc.code.padEnd(16)} ${(dateFmt + ' ' + timeFmt).padEnd(28)} ${numFmt.padEnd(16)} ${loc.label}`);
}

console.log();
console.log(`Supported: ${supported}, Unsupported: ${unsupported}`);
