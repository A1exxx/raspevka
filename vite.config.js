import { defineConfig } from 'vite';

// MVP-конфиг. `npm run dev` поднимает сервер с --host, чтобы открыть с телефона
// по локальному IP. ВАЖНО: микрофон (getUserMedia) на удалённом адресе требует
// HTTPS — для теста с телефона используй mkcert или ngrok (см. docs/DEV.md).
export default defineConfig({
  root: '.',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
