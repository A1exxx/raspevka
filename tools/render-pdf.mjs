// render-pdf.mjs — снимок HTML-документа в PDF (Playwright headless Chromium).
// Использует @media print из документа; печатает фоны. Интерактив застывает на дефолтах.
// Запуск: node tools/render-pdf.mjs <input.html> <output.pdf>
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [, , inArg, outArg] = process.argv;
if (!inArg || !outArg) { console.error('usage: render-pdf.mjs <input.html> <output.pdf>'); process.exit(1); }

const inUrl = pathToFileURL(resolve(inArg)).href;
const outPath = resolve(outArg);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(inUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(600); // дать JS дорисовать таблицы/график
await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
});
await browser.close();
console.log('PDF →', outPath);
