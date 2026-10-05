import { describe, it, expect, vi } from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ServerResponse } from 'node:http';
import {
  getMimeType,
  transformHtml,
  copyStaticDist,
  handleDevServerRequest,
  agentHostProtocolUiPlugin,
  SPA_ROUTE,
  ALT_SPA_ROUTE
} from './agent-host-protocol-ui';

describe('agentHostProtocolUiPlugin: getMimeType', () => {
  it('returns text/html for .html files', () => {
    expect(getMimeType('index.html')).toBe('text/html; charset=utf-8');
  });

  it('returns application/javascript for .js files', () => {
    expect(getMimeType('bundle.js')).toBe(
      'application/javascript; charset=utf-8'
    );
  });

  it('returns text/css for .css files', () => {
    expect(getMimeType('style.css')).toBe('text/css; charset=utf-8');
  });

  it('returns image/svg+xml for .svg files', () => {
    expect(getMimeType('icon.svg')).toBe('image/svg+xml');
  });

  it('returns fallback octet-stream for unknown extensions', () => {
    expect(getMimeType('file.xyz')).toBe('application/octet-stream');
  });
});

describe('agentHostProtocolUiPlugin: transformHtml', () => {
  it('rewrites absolute /assets/ links to relative ./assets/ links', () => {
    const input =
      '<script src="/assets/index.js"></script><link href="/assets/style.css">';
    const output = transformHtml(input);
    expect(output).toBe(
      '<script src="./assets/index.js"></script><link href="./assets/style.css">'
    );
  });

  it('rewrites naked assets/ links to ./assets/ links', () => {
    const input = '<script src="assets/index.js"></script>';
    const output = transformHtml(input);
    expect(output).toBe('<script src="./assets/index.js"></script>');
  });

  it('leaves unrelated content untouched', () => {
    const input = '<div>Hello World</div>';
    expect(transformHtml(input)).toBe('<div>Hello World</div>');
  });
});

describe('agentHostProtocolUiPlugin: copyStaticDist', () => {
  it('copies dist files and transforms index.html into target outDir', () => {
    const tempSource = mkdtempSync(join(tmpdir(), 'ahp-src-'));
    const tempOut = mkdtempSync(join(tmpdir(), 'ahp-out-'));

    try {
      mkdirSync(join(tempSource, 'assets'), { recursive: true });
      writeFileSync(
        join(tempSource, 'assets', 'app.js'),
        'console.log("hello");'
      );
      writeFileSync(
        join(tempSource, 'index.html'),
        '<html><script src="/assets/app.js"></script></html>'
      );

      copyStaticDist(tempOut, tempSource);

      const copiedHtml = readFileSync(
        join(tempOut, 'src/agent-host-protocol-ui/index.html'),
        'utf-8'
      );
      expect(copiedHtml).toContain('src="./assets/app.js"');

      const copiedJs = readFileSync(
        join(tempOut, 'src/agent-host-protocol-ui/assets/app.js'),
        'utf-8'
      );
      expect(copiedJs).toBe('console.log("hello");');
    } finally {
      rmSync(tempSource, { recursive: true, force: true });
      rmSync(tempOut, { recursive: true, force: true });
    }
  });
});

const createMockResponse = () => {
  const state = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: ''
  };

  const res = {
    writeHead: vi.fn((code: number, headers?: Record<string, string>) => {
      state.statusCode = code;
      if (headers) Object.assign(state.headers, headers);
      return res;
    }),
    end: vi.fn((data?: string | Buffer) => {
      if (data) state.body = data.toString();
      return res;
    })
  } as unknown as ServerResponse;

  return { res, state };
};

describe('agentHostProtocolUiPlugin: handleDevServerRequest routing', () => {
  it('calls next for unrelated routes', () => {
    const { res } = createMockResponse();
    const next = vi.fn();

    handleDevServerRequest('/other-app', res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('redirects to trailing slash when requested without one', () => {
    const { res, state } = createMockResponse();
    const next = vi.fn();

    handleDevServerRequest(SPA_ROUTE, res, next);
    expect(state.statusCode).toBe(302);
    expect(state.headers.Location).toBe(`${SPA_ROUTE}/`);
    expect(next).not.toHaveBeenCalled();
  });

  it('supports ALT_SPA_ROUTE (/src/agent-host-protocol-ui)', () => {
    const { res, state } = createMockResponse();
    const next = vi.fn();

    handleDevServerRequest(ALT_SPA_ROUTE, res, next);
    expect(state.statusCode).toBe(302);
    expect(state.headers.Location).toBe(`${ALT_SPA_ROUTE}/`);
  });
});

describe('agentHostProtocolUiPlugin: handleDevServerRequest serving', () => {
  it('serves transformed index.html on root route', () => {
    const tempSource = mkdtempSync(join(tmpdir(), 'ahp-dev-'));
    try {
      writeFileSync(
        join(tempSource, 'index.html'),
        '<script src="/assets/main.js"></script>'
      );
      const { res, state } = createMockResponse();
      const next = vi.fn();

      handleDevServerRequest(`${SPA_ROUTE}/`, res, next, tempSource);
      expect(state.statusCode).toBe(200);
      expect(state.headers['Content-Type']).toBe('text/html; charset=utf-8');
      expect(state.body).toContain('src="./assets/main.js"');
      expect(next).not.toHaveBeenCalled();
    } finally {
      rmSync(tempSource, { recursive: true, force: true });
    }
  });

  it('serves assets when asset exists', () => {
    const tempSource = mkdtempSync(join(tmpdir(), 'ahp-dev-'));
    try {
      mkdirSync(join(tempSource, 'assets'), { recursive: true });
      writeFileSync(
        join(tempSource, 'assets', 'test.css'),
        'body { color: red; }'
      );

      const { res, state } = createMockResponse();
      const next = vi.fn();

      handleDevServerRequest(
        `${SPA_ROUTE}/assets/test.css`,
        res,
        next,
        tempSource
      );
      expect(state.statusCode).toBe(200);
      expect(state.headers['Content-Type']).toBe('text/css; charset=utf-8');
      expect(state.body).toBe('body { color: red; }');
      expect(next).not.toHaveBeenCalled();
    } finally {
      rmSync(tempSource, { recursive: true, force: true });
    }
  });

  it('calls next if requested asset does not exist', () => {
    const tempSource = mkdtempSync(join(tmpdir(), 'ahp-dev-'));
    try {
      const { res } = createMockResponse();
      const next = vi.fn();

      handleDevServerRequest(
        `${SPA_ROUTE}/assets/missing.js`,
        res,
        next,
        tempSource
      );
      expect(next).toHaveBeenCalledOnce();
    } finally {
      rmSync(tempSource, { recursive: true, force: true });
    }
  });
});

describe('agentHostProtocolUiPlugin: lifecycle', () => {
  it('defines plugin hooks properly', () => {
    const plugin = agentHostProtocolUiPlugin();
    expect(plugin.name).toBe('agent-host-protocol-ui');
    expect(typeof plugin.configResolved).toBe('function');
    expect(typeof plugin.configureServer).toBe('function');
    expect(typeof plugin.closeBundle).toBe('function');
  });
});
