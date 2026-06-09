// recorder.js — запись голоса и прослушивание со стороны. Фундамент под «послушай себя»
// и будущие экзамены ансамбля (блоки 22-25). Использует общий микрофонный поток (mic.stream).
// Запись живёт только в текущей сессии (в памяти), никуда не отправляется.

function pickMime() {
  const cands = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const m of cands) { try { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; } catch (e) { /* ok */ } }
  return '';
}

export function renderRecorder(app, mic, { onExit }) {
  let rec = null, chunks = [], url = null, timer = null, t0 = 0, recording = false;

  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function render() {
    app.innerHTML = `
      <div class="screen recorder">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Запись голоса</h1><p>Запиши себя и послушай со стороны — так слышно прогресс и ошибки, которые в моменте не замечаешь.</p></div>
        <div class="rec-timer ${recording ? 'live' : ''}" id="timer">${fmt(0)}</div>
        <button class="btn ${recording ? 'btn-danger' : 'btn-primary'} rec-btn" id="rec">${recording ? '■ Остановить' : '● Записать'}</button>
        <audio id="player" controls ${url ? '' : 'hidden'} style="width:100%;margin-top:16px"></audio>
        <p class="hint" style="margin-top:14px">Запись хранится только в этой сессии и никуда не отправляется. ${window.MediaRecorder ? '' : '<br>⚠️ Браузер не поддерживает запись.'}</p>
      </div>
    `;
    document.getElementById('back').addEventListener('click', () => { cleanup(); onExit(); });
    const recBtn = document.getElementById('rec');
    if (!window.MediaRecorder) { recBtn.disabled = true; return; }
    recBtn.addEventListener('click', recording ? stop : start);
    const player = document.getElementById('player');
    if (url && player) player.src = url;
  }

  function start() {
    if (!mic.stream) return;
    chunks = [];
    if (url) { try { URL.revokeObjectURL(url); } catch (e) { /* ok */ } url = null; }
    try {
      const mime = pickMime();
      rec = mime ? new MediaRecorder(mic.stream, { mimeType: mime }) : new MediaRecorder(mic.stream);
    } catch (e) { return; }
    rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      url = URL.createObjectURL(blob);
      recording = false;
      render();
    };
    rec.start();
    recording = true;
    t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    render();
    const tEl = () => document.getElementById('timer');
    timer = setInterval(() => {
      const el = tEl();
      if (el) el.textContent = fmt((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
    }, 250);
  }

  function stop() {
    clearInterval(timer); timer = null;
    try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) { recording = false; render(); }
  }

  function cleanup() {
    clearInterval(timer); timer = null;
    try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) { /* ok */ }
    if (url) { try { URL.revokeObjectURL(url); } catch (e) { /* ok */ } }
  }

  render();
}
