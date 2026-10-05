import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs';
import { extname, resolve } from 'node:path';
import { distDir } from '@toumorokoshi/agent-host-protocol-ui';

export const SPA_ROUTE = '/spa/src/agent-host-protocol-ui';
export const ALT_SPA_ROUTE = '/src/agent-host-protocol-ui';

export const MIME_TYPES: Readonly<Record<string, string>> = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
});

const HTTP_OK = 200;
const HTTP_FOUND = 302;
const HTTP_NOT_FOUND = 404;

export const getMimeType = (filePath: string): string => {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? 'application/octet-stream';
};

export const transformHtml = (html: string): string => {
  return html
    .replace(/(src|href)=["']\/assets\//g, '$1="./assets/')
    .replace(/(src|href)=["']assets\//g, '$1="./assets/');
};

export const copyStaticDist = (
  outDir: string,
  sourceDistDir: string = distDir
): void => {
  const targetDir = resolve(outDir, 'src/agent-host-protocol-ui');
  const targetAssetsDir = resolve(targetDir, 'assets');

  mkdirSync(targetAssetsDir, { recursive: true });

  const sourceAssetsDir = resolve(sourceDistDir, 'assets');
  if (existsSync(sourceAssetsDir)) {
    readdirSync(sourceAssetsDir).forEach((file) => {
      const srcFile = resolve(sourceAssetsDir, file);
      const destFile = resolve(targetAssetsDir, file);
      cpSync(srcFile, destFile);
    });
  }

  const sourceIndexPath = resolve(sourceDistDir, 'index.html');
  if (existsSync(sourceIndexPath)) {
    const rawHtml = readFileSync(sourceIndexPath, 'utf-8');
    const transformed = transformHtml(rawHtml);
    writeFileSync(resolve(targetDir, 'index.html'), transformed, 'utf-8');
  }
};

const serveIndexHtml = (res: ServerResponse, sourceDistDir: string): void => {
  const indexPath = resolve(sourceDistDir, 'index.html');
  if (!existsSync(indexPath)) {
    res.writeHead(HTTP_NOT_FOUND, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  const html = readFileSync(indexPath, 'utf-8');
  res.writeHead(HTTP_OK, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(transformHtml(html));
};

const serveAsset = (
  res: ServerResponse,
  sourceDistDir: string,
  assetName: string,
  next: () => void
): void => {
  const assetPath = resolve(sourceDistDir, 'assets', assetName);
  if (!existsSync(assetPath)) {
    next();
    return;
  }
  const content = readFileSync(assetPath);
  res.writeHead(HTTP_OK, {
    'Content-Type': getMimeType(assetPath),
    'Cache-Control': 'no-cache'
  });
  res.end(content);
};

const handleSubPath = (
  subPath: string,
  res: ServerResponse,
  next: () => void,
  sourceDistDir: string
): void => {
  if (subPath === '/' || subPath === '/index.html') {
    serveIndexHtml(res, sourceDistDir);
    return;
  }

  if (subPath.startsWith('/assets/')) {
    const assetName = subPath.slice('/assets/'.length);
    serveAsset(res, sourceDistDir, assetName, next);
    return;
  }

  next();
};

export const handleDevServerRequest = (
  url: string,
  res: ServerResponse,
  next: () => void,
  sourceDistDir: string = distDir
): void => {
  const cleanUrl = url.split('?')[0];

  const matchedRoute = [SPA_ROUTE, ALT_SPA_ROUTE].find(
    (route) => cleanUrl === route || cleanUrl.startsWith(`${route}/`)
  );

  if (!matchedRoute) {
    next();
    return;
  }

  if (cleanUrl === matchedRoute) {
    res.writeHead(HTTP_FOUND, { Location: `${matchedRoute}/` });
    res.end();
    return;
  }

  handleSubPath(cleanUrl.slice(matchedRoute.length), res, next, sourceDistDir);
};

export const agentHostProtocolUiPlugin = (
  sourceDistDir: string = distDir
): Plugin => {
  const state: { outDir: string } = { outDir: 'dist' };

  return {
    name: 'agent-host-protocol-ui',
    configResolved(config) {
      state.outDir = config.build.outDir;
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (!req.url) {
            next();
            return;
          }
          handleDevServerRequest(req.url, res, next, sourceDistDir);
        }
      );
    },
    closeBundle() {
      copyStaticDist(state.outDir, sourceDistDir);
    }
  };
};

export default agentHostProtocolUiPlugin;
