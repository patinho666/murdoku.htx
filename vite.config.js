import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Vite's default target assumes Safari 14+. Older iPhones then hit a
    // SYNTAX error while parsing the bundle, which fails before any of our
    // code runs — the page just stays blank with no visible error. Lowering
    // the target makes the bundle parseable much further back.
    target: ['es2017', 'safari12'],
  },
});
