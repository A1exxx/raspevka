// pdf.mjs — экспорт инвест-питча в PDF (одна высокая страница, тёмный премиум-вид).
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const HTML = 'D:/vocal-trainer/docs/pitch-investor.html';
const OUT = 'D:/vocal-trainer/docs/pitch-investor.pdf';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1040, height: 1400 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto(pathToFileURL(HTML).href, { waitUntil: 'networkidle' });
await p.emulateMedia({ media: 'screen' });  // сохранить тёмную тему (не печатную светлую)
await sleep(900);
const h = await p.evaluate(() => document.body.scrollHeight);
const imgs = await p.evaluate(() => [...document.images].map((i) => ({ src: i.currentSrc.split('/').pop(), ok: i.complete && i.naturalWidth > 0 })));
console.log('scrollHeight', h, 'images', JSON.stringify(imgs));
await p.pdf({ path: OUT, width: '1040px', height: `${h + 20}px`, printBackground: true, pageRanges: '1' });
await b.close();
console.log('PDF ->', OUT);
