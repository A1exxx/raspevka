// make-og.mjs — генерит public/og-cover.png (1200×630) — карточка для репоста ссылки.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og-cover.png');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; box-sizing:border-box; }
  body { width:1200px; height:630px; overflow:hidden;
    font-family:'Segoe UI',system-ui,sans-serif;
    background:radial-gradient(120% 120% at 20% 0%, #114b44 0%, #0c2e2b 55%, #081f1d 100%);
    color:#fff; display:flex; flex-direction:column; justify-content:center; padding:84px; position:relative; }
  .eq { position:absolute; right:90px; top:50%; transform:translateY(-50%); display:flex; gap:14px; align-items:flex-end; height:230px; }
  .eq i { width:26px; border-radius:13px; background:linear-gradient(180deg,#3de5c9,#0e8d7f); }
  .badge { font-size:24px; letter-spacing:.22em; text-transform:uppercase; color:#3de5c9; font-weight:700; margin-bottom:26px; }
  h1 { font-size:96px; line-height:1.02; font-weight:800; letter-spacing:-.02em; max-width:760px; }
  h1 .accent { color:#3de5c9; }
  p { font-size:34px; color:rgba(255,255,255,.82); margin-top:30px; max-width:680px; line-height:1.3; }
  .url { position:absolute; left:84px; bottom:64px; font-size:26px; color:rgba(255,255,255,.6); font-weight:600; }
</style></head><body>
  <div class="badge">● Распевка</div>
  <h1>Пой — и попадай <span class="accent">в ноты</span></h1>
  <p>Тренажёр голоса: живая детекция тона, 26 распевок, программа из 10 блоков.</p>
  <div class="url">a1exxx.github.io/raspevka</div>
  <div class="eq">
    <i style="height:90px"></i><i style="height:170px"></i><i style="height:120px"></i>
    <i style="height:220px"></i><i style="height:140px"></i><i style="height:80px"></i>
  </div>
</body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.screenshot({ path: OUT, type: 'png' });
await b.close();
console.log('og-cover.png ->', OUT);
