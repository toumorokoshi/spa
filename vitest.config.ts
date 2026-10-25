import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    // Node >= 25 defines a native `localStorage` global that is undefined
    // without --localstorage-file and shadows jsdom's implementation.
    execArgv: process.allowedNodeEnvironmentFlags.has(
      '--experimental-webstorage'
    )
      ? ['--no-experimental-webstorage']
      : [],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'vite-plugins/**/*.test.{ts,tsx}']
  }
});
