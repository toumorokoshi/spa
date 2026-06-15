/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest';
import { convert } from './converter';
import { latexToText } from './latex';

describe('latexToText', () => {
  it('converts common symbols', () => {
    expect(latexToText('\\alpha')).toBe('α');
    expect(latexToText('\\beta \\times \\gamma')).toBe('β × γ');
  });

  it('strips formatting macros', () => {
    expect(latexToText('\\textbf{hello}')).toBe('hello');
    expect(latexToText('\\textit{world}')).toBe('world');
  });

  it('converts fractions', () => {
    expect(latexToText('\\frac{1}{2}')).toBe('(1)/(2)');
  });

  it('removes math boundaries', () => {
    expect(latexToText('$$ \\alpha $$')).toBe('α');
  });

  it('formats the user specific string', () => {
    expect(latexToText('$a, b \\in G$, $a \\circ b \\in G$.')).toBe(
      'a, b ∈ G, a ∘ b ∈ G.'
    );
  });

  it('converts blackboard bold and setminus', () => {
    expect(latexToText('\\mathbb{R} \\setminus {0}')).toBe('ℝ ∖ {0}');
  });

  it('converts newly added blackboard bold, calligraphic, and logic symbols', () => {
    expect(latexToText('\\mathbb{A} \\cup \\mathcal{B}')).toBe('𝔸 ∪ ℬ');
    expect(latexToText('\\aleph \\approx \\hbar')).toBe('ℵ ≈ ħ');
    expect(latexToText('\\sin(\\theta) \\implies \\cos(\\theta)')).toBe(
      'sin(θ) ⟹ cos(θ)'
    );
  });

  it('converts simeq and colon symbols', () => {
    expect(latexToText('M \\simeq N')).toBe('M ≃ N');
    expect(latexToText('f \\colon M')).toBe('f : M');
  });

  it('converts over and div symbols', () => {
    expect(latexToText('a \\over b')).toBe('a ÷ b');
    expect(latexToText('\\div')).toBe('÷');
  });
});

describe('converter', () => {
  it('auto-detects LaTeX format using new math indicators', () => {
    const payload = {
      plainText: 'Let x \\in \\mathbb{A}'
    };
    const result = convert(payload, 'auto');
    expect(result.plaintext).toBe('Let x ∈ 𝔸');
  });
  it('handles HTML input automatically', () => {
    const payload = {
      plainText: 'Hello World',
      htmlText: '<h1>Hello</h1><p>World</p>'
    };

    const result = convert(payload, 'auto');
    expect(result.html).toBe('<h1>Hello</h1><p>World</p>');
    expect(result.markdown).toContain('# Hello');
    expect(result.markdown).toContain('World');
    // HTML tags stripped:
    expect(result.plaintext).toBe('HelloWorld');
  });

  it('handles Markdown input automatically', () => {
    const payload = {
      plainText: '# Hello\n\nWorld'
    };

    const result = convert(payload, 'auto');
    expect(result.markdown).toBe('# Hello\n\nWorld');
    expect(result.html).toBe('<h1>Hello</h1>\n<p>World</p>');
    expect(result.plaintext).toBe('Hello\nWorld');
  });

  it('handles LaTeX input automatically', () => {
    const payload = {
      plainText: '$$ \\alpha \\times \\beta $$'
    };

    const result = convert(payload, 'auto');
    expect(result.plaintext).toBe('α × β');
    expect(result.html).toBe('<p>α × β</p>');
    expect(result.markdown).toBe('α × β');
  });

  it('respects manual format override', () => {
    // Looks like LaTeX but forced to markdown
    const payload = {
      plainText: '\\alpha'
    };

    const result = convert(payload, 'markdown');
    expect(result.html).toBe('<p>\\alpha</p>');
  });

  it('handles the user specific string automatically', () => {
    const payload = {
      plainText: '$a, b \\in G$, $a \\circ b \\in G$.'
    };

    const result = convert(payload, 'auto');
    expect(result.plaintext).toBe('a, b ∈ G, a ∘ b ∈ G.');
    expect(result.markdown).toBe('a, b ∈ G, a ∘ b ∈ G.');
    expect(result.html).toBe('<p>a, b ∈ G, a ∘ b ∈ G.</p>');
  });

  it('converts embedded LaTeX inside Markdown', () => {
    const payload = {
      plainText: 'Let $a, b \\in G$ be elements, then $a \\circ b \\in G$.'
    };

    const result = convert(payload, 'markdown');
    expect(result.plaintext).toBe('Let a, b ∈ G be elements, then a ∘ b ∈ G.');
    expect(result.markdown).toBe('Let a, b ∈ G be elements, then a ∘ b ∈ G.');
    expect(result.html).toBe(
      '<p>Let a, b ∈ G be elements, then a ∘ b ∈ G.</p>'
    );
  });

  it('protects currency from incorrect LaTeX conversion in Markdown', () => {
    const payload = {
      plainText: 'This item costs $10 and that costs $20.'
    };

    const result = convert(payload, 'markdown');
    expect(result.plaintext).toBe('This item costs $10 and that costs $20.');
    expect(result.markdown).toBe('This item costs $10 and that costs $20.');
    expect(result.html).toBe('<p>This item costs $10 and that costs $20.</p>');
  });

  it('handles math set operations automatically', () => {
    const payload = {
      plainText: '\\mathbb{R} \\setminus {0}'
    };

    const result = convert(payload, 'auto');
    expect(result.plaintext).toBe('ℝ ∖ {0}');
    expect(result.markdown).toBe('ℝ ∖ {0}');
    expect(result.html).toBe('<p>ℝ ∖ {0}</p>');
  });

  it('does not strip HTML tables', () => {
    const payload = {
      plainText: 'cell1 cell2',
      htmlText:
        '<table style="width: 100%;"><tbody><tr><td style="color: red;">cell1</td><td>cell2</td></tr></tbody></table>'
    };

    const result = convert(payload, 'auto');
    expect(result.html).toContain('<table');
    expect(result.html).toContain('<tbody>');
    expect(result.html).toContain('<tr');
    expect(result.html).toContain('<td');
    expect(result.html).toContain('cell1');
    expect(result.html).toContain('cell2');

    // Markdown may retain the table as raw HTML if there are no headers
    expect(result.markdown).toContain('<table');
  });

  it('handles Wikipedia copy-paste math', () => {
    const payload = {
      plainText:
        'U\n{\\displaystyle U}\nz\n0\n{\\displaystyle z_{0}}\nf(z) = |z|^2\n{\\displaystyle \\textstyle f(z)=\\vert z\\vert {\\vphantom {l}}^{2}=z{\\bar {z}}}',
      htmlText:
        '<span class="mwe-math-element"><span class="mwe-math-mathml-inline" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\\displaystyle U}"><semantics><mrow class="MJX-TeXAtom-ORD"><mstyle displaystyle="true" scriptlevel="0"><mi>U</mi></mstyle></mrow><annotation encoding="application/x-tex">{\\displaystyle U}</annotation></semantics></math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/e1c45ec5976b97669d03831bfa2b325c38ee7a1d" class="mwe-math-fallback-image-inline" aria-hidden="true" style="vertical-align: -0.338ex; width:2.054ex; height:2.176ex;" alt="U" /></span>'
    };

    const resultAuto = convert(payload, 'auto');
    expect(resultAuto.plaintext).toBe('U');
    expect(resultAuto.markdown).toBe('U');

    const resultMarkdown = convert(payload, 'markdown');
    expect(resultMarkdown.plaintext).toBe(
      'U z₀ f(z)=| z| {\\vphantom {l}}²=z{\\bar {z}}'
    );
  });

  it('handles Wikipedia style inline math copy-paste without newlines', () => {
    const payload = {
      plainText:
        'In mathematics, a manifold is a topological space that locally resembles Euclidean space near each point. More precisely, an \n n\n{\\displaystyle n}-dimensional manifold, or \n n\n{\\displaystyle n}-manifold for short, is a topological space with the property that each point has a neighborhood that is homeomorphic to an open subset of \n n\n{\\displaystyle n}-dimensional Euclidean space.'
    };

    const result = convert(payload, 'markdown');
    expect(result.plaintext).toBe(
      'In mathematics, a manifold is a topological space that locally resembles Euclidean space near each point. More precisely, an n-dimensional manifold, or n-manifold for short, is a topological space with the property that each point has a neighborhood that is homeomorphic to an open subset of n-dimensional Euclidean space.'
    );
  });

  it('converts standalone displaystyle LaTeX without deleting it', () => {
    const payload = {
      plainText: 'Let {\\displaystyle \\alpha + \\beta} be a sum.'
    };
    const result = convert(payload, 'markdown');
    expect(result.plaintext).toBe('Let α + β be a sum.');
  });

  it('converts superscripts and subscripts including R^3', () => {
    const payload1 = {
      plainText:
        'A surface S in the Euclidean space \\mathbb {R} ^{3} is orientable...'
    };
    const result1 = convert(payload1, 'auto');
    expect(result1.plaintext).toBe(
      'A surface S in the Euclidean space ℝ³ is orientable...'
    );

    const payload2 = {
      plainText: 'Let x_{i} \\in \\mathbb{R}^{n}'
    };
    const result2 = convert(payload2, 'auto');
    expect(result2.plaintext).toBe('Let xᵢ ∈ ℝⁿ');
  });

  it('handles user exact orientability paste with R^3', () => {
    const payload = {
      plainText:
        'A surface S in the Euclidean space \\mathbb {R} ^{3} is orientable if a chiral two-dimensional figure (for example, ) cannot be moved around the surface and back to where it started so that it looks like its own mirror image (). Otherwise the surface is non-orientable.'
    };
    const result = convert(payload, 'auto');
    expect(result.plaintext).toContain('Euclidean space ℝ³ is orientable');
  });

  it('handles user exact paste with simeq and colon', () => {
    const payload = {
      plainText:
        'Given two differentiable manifolds M and N, a continuously differentiable map f\\colon M→ N is a diffeomorphism if it is a bijection and its inverse f⁻¹\\colon N→ M is differentiable as well. If these functions are r times continuously differentiable, f is called a Cr-diffeomorphism.\n\nTwo manifolds M and N are diffeomorphic (usually denoted M\\simeq N) if there is a diffeomorphism f from M to N. Two Cr-differentiable manifolds are Cr-diffeomorphic if there is an r times continuously differentiable bijective map between them whose inverse is also r times continuously differentiable. A C¹-diffeomorphism is simply a diffeomorphism, and a C⁰-diffeomorphism is a homeomorphism.'
    };
    const result = convert(payload, 'auto');
    expect(result.plaintext).toContain('map f: M→ N is a diffeomorphism');
    expect(result.plaintext).toContain(
      'its inverse f⁻¹: N→ M is differentiable'
    );
    expect(result.plaintext).toContain('denoted M≃ N');
  });

  it('converts newly added mathematical symbols and ellipsis', () => {
    expect(latexToText('x_1 \\cdots x_n')).toBe('x₁ ⋯ xₙ');
    expect(latexToText('y_1 \\dots y_m')).toBe('y₁ … yₘ');
    expect(latexToText('z_1 \\ldots z_k')).toBe('z₁ … zₖ');
    expect(latexToText('\\langle x, y \\rangle')).toBe('⟨ x, y ⟩');
    expect(latexToText('\\lfloor x \\rfloor')).toBe('⌊ x ⌋');
    expect(latexToText('\\lceil y \\rceil')).toBe('⌈ y ⌉');
    expect(latexToText('\\vert x \\vert')).toBe('| x |');
    expect(latexToText('\\Vert y \\Vert')).toBe('‖ y ‖');
    expect(latexToText('A \\triangleq B')).toBe('A ≜ B');
    expect(latexToText('\\Box')).toBe('□');
    expect(latexToText('f^\\prime')).toBe('f′');
    expect(latexToText('\\Beta')).toBe('Β');
  });

  it('converts fractions, operatornames, and other structural/font macros', () => {
    expect(latexToText('\\tfrac{1}{2} + \\dfrac{3}{4}')).toBe(
      '(1)/(2) + (3)/(4)'
    );
    expect(latexToText('\\operatorname{sgn}(x)')).toBe('sgn(x)');
    expect(latexToText('\\boldsymbol{v}')).toBe('v');
    expect(latexToText('\\widehat{\\alpha}')).toBe('α');
    expect(latexToText('\\vec{u} + \\vec v')).toBe('u + v');
    expect(latexToText('\\underbrace{x+y}_{=z}')).toBe('x+y₌z');
    expect(latexToText('\\stackrel{a}{b}')).toBe('b');
    expect(latexToText('\\binom{n}{k}')).toBe('(n choose k)');
    expect(latexToText('x \\pmod{p}')).toBe('x (mod p)');
    expect(latexToText('y \\pmod p')).toBe('y (mod p)');
    expect(latexToText('\\bigl( x \\bigr)')).toBe('( x )');
    expect(latexToText('\\xrightarrow{d^0}')).toBe('──(d⁰)──→');
    expect(latexToText('\\xrightarrow[g]{f}')).toBe('──(f)──→[g]');
  });

  it('handles user exact paste with xrightarrow in cochain complex', () => {
    const payload = {
      plainText:
        'The cochain complex (A• ,d• ) is the dual notion to a chain complex. It consists of a sequence of abelian groups or modules ⋯ ,A⁰,A¹,A²,… connected by homomorphisms dⁿ:Aⁿ→ Aⁿ⁺¹ satisfying dⁿ⁺¹∘ dⁿ=0. The cochain complex may be written out in a similar fashion to the chain complex:\n⋯ \\xrightarrow {d⁻¹} A⁰\\xrightarrow {d⁰} A¹\\xrightarrow {d¹} A²\\xrightarrow {d²} A³\\xrightarrow {d³} A⁴\\xrightarrow {d⁴} ⋯'
    };
    const result = convert(payload, 'auto');
    expect(result.plaintext).toContain(
      '⋯ ──(d⁻¹)──→ A⁰──(d⁰)──→ A¹──(d¹)──→ A²──(d²)──→ A³──(d³)──→ A⁴──(d⁴)──→ ⋯'
    );
  });
});
