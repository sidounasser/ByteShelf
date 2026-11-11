import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-well-known',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/.well-known/discord') {
            const filePath = path.resolve(__dirname, '.well-known/discord');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/plain');
              return res.end(fs.readFileSync(filePath, 'utf-8'));
            }
          }
          next();
        });
      },
      closeBundle() {
        const src = path.resolve(__dirname, '.well-known');
        const dest = path.resolve(__dirname, 'dist/.well-known');
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true });
        }
      }
    }
  ],
  server: {
    port: 5500,
    open: true
  }
});
