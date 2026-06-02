import { defineConfig } from 'vite';

// MVP-конфиг. `npm run dev` поднимает сервер с --host, чтобы открыть с телефона
// по локальному IP. ВАЖНО: микрофон (getUserMedia) на удалённом адресе требует
// HTTPS — для теста с телефона используй mkcert или ngrok (см. docs/DEV.md).
export default defineConfig(({ command }) => ({
  // Относительный base для прод-сборки → работает на GitHub Pages из подпапки
  // (https://a1exxx.github.io/raspevka/). В dev — обычный '/'.
  base: command === 'build' ? './' : '/',
  root: '.',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
}));
