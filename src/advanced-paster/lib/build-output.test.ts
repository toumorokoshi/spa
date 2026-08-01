import { describe, it, expect, beforeAll } from 'vitest';
import { build } from 'vite';
import { repairLoneSurrogateEscapes } from '../../../vite-plugins/repair-lone-surrogate-escapes';

/**
 * Regression tests for a rolldown codegen bug that only manifests in
 * `vite build` output, never in the dev server or in these tests' own module
 * graph -- so it has to be caught by inspecting and executing a real bundle.
 *
 * See vite-plugins/repair-lone-surrogate-escapes.ts for the full description.
 * Symptom without the repair plugin: temml's lexer token regex ships as
 * `[<U+FFFD>d800-<U+FFFD>dbff]`, a class that matches a backslash, so `\text`
 * lexes as a bare `\` and every LaTeX command renders as a temml parse error.
 */

const BUILD_TIMEOUT_MS = 120_000;
const GLOBAL_NAME = '__latexBundle';
const TEMML_ERROR_COLOR = '#b22222';

interface LatexBundle {
  latexToMathML: (latex: string, displayMode?: boolean) => string;
}

interface BuildOutput {
  output: Array<{ type: string; code?: string }>;
}

const bundleLatexModule = async (): Promise<string> => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [repairLoneSurrogateEscapes()],
    build: {
      write: false,
      lib: {
        // Relative to `root`, which defaults to the cwd vitest runs from.
        entry: 'src/advanced-paster/lib/latex.ts',
        formats: ['iife'],
        name: GLOBAL_NAME
      }
    }
  });

  // Vite 8 returns one output set per build environment.
  const outputs = (Array.isArray(result) ? result : [result]) as BuildOutput[];
  const chunk = outputs
    .flatMap((o) => o.output)
    .find((o) => o.type === 'chunk');
  if (!chunk?.code) {
    throw new Error('production build produced no JS chunk');
  }
  return chunk.code;
};

// Built once and shared: the bundle is identical for every assertion below.
const bundled = bundleLatexModule().then((code) => ({
  code,
  module: new Function(`${code}\nreturn ${GLOBAL_NAME};`)() as LatexBundle
}));

describe('production bundle', () => {
  beforeAll(async () => {
    await bundled;
  }, BUILD_TIMEOUT_MS);

  it('emits lone surrogate escapes intact', async () => {
    const { code } = await bundled;

    expect(code).not.toContain('�');
    expect(code).toContain('[\\ud800-\\udbff][\\udc00-\\udfff]');
  });

  it('renders latex commands rather than temml parse errors', async () => {
    const { module } = await bundled;

    const mathml = module.latexToMathML('\\text{Attention}', true);

    expect(mathml).toContain('<mtext>Attention</mtext>');
    expect(mathml).not.toContain(TEMML_ERROR_COLOR);
  });

  it('renders the pasted attention formula', async () => {
    const { module } = await bundled;

    const mathml = module.latexToMathML(
      '\\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
      true
    );

    expect(mathml).toContain('<mtext>softmax</mtext>');
    expect(mathml).toContain('<mfrac>');
    expect(mathml).toContain('<msqrt>');
    expect(mathml).not.toContain(TEMML_ERROR_COLOR);
  });
});
