// mic.js — захват микрофона + AudioContext (iOS-safe).
//
// iOS Safari: AudioContext стартует в состоянии 'suspended' и оживает ТОЛЬКО
// внутри пользовательского жеста (tap/click). Поэтому start() обязан вызываться
// из обработчика клика. Используем AnalyserNode (read-only) + getFloatTimeDomainData,
// а не ScriptProcessor/Worklet — это исключает iOS-crackle и проще для MVP.

export class MicEngine {
  constructor({ fftSize = 2048 } = {}) {
    this.fftSize = fftSize;
    this.ctx = null;
    this.stream = null;
    this.analyser = null;
    this.gainNode = null;
    this.buf = null;
    this.ready = false;
    this._sensitivity = 3; // усиление входа (чувствительность микрофона)
    this._agc = false;     // авто-усиление: дефолт OFF (стабильнее детекция); ON — для очень тихих микрофонов
  }

  /** Чувствительность микрофона — множитель усиления входного сигнала. */
  setSensitivity(mult) {
    this._sensitivity = mult;
    if (this.gainNode) this.gainNode.gain.value = mult;
  }

  /** Авто-усиление (AGC). ON — громче на телефоне; OFF — ровнее долгие ноты/удержание.
   *  Применяется к живому треку без переподключения. */
  setAGC(on) {
    this._agc = !!on;
    const tr = this.stream && this.stream.getAudioTracks && this.stream.getAudioTracks()[0];
    if (tr && tr.applyConstraints) {
      tr.applyConstraints({ echoCancellation: false, noiseSuppression: false, autoGainControl: this._agc }).catch(() => {});
    }
  }

  /** Должен вызываться из пользовательского жеста (клик по кнопке). */
  async start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    // Критично для iOS: резюмим контекст внутри жеста.
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.stream) {
      // Для точной детекции тона глушим обработку — она искажает гармоники.
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          // Авто-усиление: дефолт ON (тихий телефон), но переключаемо в настройках —
          // OFF даёт более ровный сигнал для упражнения «Удержание» и долгих нот.
          autoGainControl: this._agc,
        },
        video: false,
      });
      const source = this.ctx.createMediaStreamSource(this.stream);
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this._sensitivity; // усиление входа (чувствительность)
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0; // во временной области не нужно
      // source → gain → analyser (анализатор не выводит звук → без обратной связи)
      source.connect(this.gainNode).connect(this.analyser);
      this.buf = new Float32Array(this.analyser.fftSize);
    }

    this.ready = true;
    return { sampleRate: this.ctx.sampleRate };
  }

  /** Возвращает текущий буфер временной области (Float32Array) или null. */
  read() {
    if (!this.ready || !this.analyser) return null;
    // Само-восстановление: на iOS контекст может «засыпать» после прерывания/блокировки
    // экрана/звонка. Тогда и детекция, и подсказка-тон молча умирают. Резюмим на лету.
    if (this.ctx && this.ctx.state === 'suspended') { this.ctx.resume().catch(() => {}); }
    this.analyser.getFloatTimeDomainData(this.buf);
    return this.buf;
  }

  /** Громкость текущего кадра (RMS) — для индикатора "поёт / молчит". */
  rms() {
    if (!this.buf) return 0;
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
    return Math.sqrt(sum / this.buf.length);
  }

  get sampleRate() {
    return this.ctx ? this.ctx.sampleRate : 44100;
  }

  async suspend() {
    if (this.ctx && this.ctx.state === 'running') await this.ctx.suspend();
    this.ready = false;
  }
}
