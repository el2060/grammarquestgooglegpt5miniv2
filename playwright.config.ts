import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3000', channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:3000', reuseExistingServer: true },
});
