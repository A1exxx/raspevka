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
    this.buf = null;
    this.ready = false;
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
          autoGainControl: false,
        },
        video: false,
      });
      const source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0; // во временной области не нужно
      source.connect(this.analyser);
      this.buf = new Float32Array(this.analyser.fftSize);
    }

    this.ready = true;
    return { sampleRate: this.ctx.sampleRate };
  }

  /** Возвращает текущий буфер временной области (Float32Array) или null. */
  read() {
    if (!this.ready || !this.analyser) return null;
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
