import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1040, height: 1200 }, deviceScaleFactor: 1.4 });
const p = await ctx.newPage();
await p.goto(pathToFileURL('D:/vocal-trainer/docs/pitch-investor.html').href, { waitUntil: 'networkidle' });
await sleep(800);
for (const id of ['marketing', 'ask', 'risks']) {
  const el = await p.$('#' + id);
  await el.scrollIntoViewIfNeeded();
  await sleep(300);
  await el.screenshot({ path: `D:/vocal-trainer/docs/pitch-assets/_verify-${id}.jpg`, quality: 80, type: 'jpeg' });
  console.log('shot', id);
}
await b.close();
