import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { repairLoneSurrogateEscapes } from './vite-plugins/repair-lone-surrogate-escapes';
import { agentHostProtocolUiPlugin } from './vite-plugins/agent-host-protocol-ui';

const discoverEntryPoints = (): Record<string, string> => {
  const srcDir = resolve(__dirname, 'src');
  const entries: Record<string, string> = {
    main: resolve(__dirname, 'index.html')
  };

  if (!existsSync(srcDir)) return entries;

  readdirSync(srcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .forEach((d) => {
      const indexPath = resolve(srcDir, d.name, 'index.html');
      if (existsSync(indexPath)) {
        entries[d.name] = indexPath;
      }
    });

  return entries;
};

export default defineConfig({
  plugins: [
    preact(),
    repairLoneSurrogateEscapes(),
    agentHostProtocolUiPlugin()
  ],
  base: '/spa/',
  optimizeDeps: {
    exclude: ['temml']
  },
  build: {
    rollupOptions: {
      input: discoverEntryPoints()
    }
  }
});
