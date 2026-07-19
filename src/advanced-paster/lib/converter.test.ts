/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest';
import { convert } from './converter';
import { latexToText, latexToMathML } from './latex';

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

describe('latexToMathML', () => {
  it('converts latex math expressions to MathML using Temml', () => {
    expect(latexToMathML('\\alpha')).toContain('<math>');
    expect(latexToMathML('\\alpha')).toContain('<mi>α</mi>');
    expect(latexToMathML('\\alpha')).toContain(
      'annotation encoding="application/x-tex">\\alpha</annotation>'
    );
  });

  it('supports displayMode option', () => {
    expect(latexToMathML('\\beta', true)).toContain('display="block"');
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
    expect(result.html).toBe(
      '<p><math display="block" class="tml-display" style="display:block math;"><semantics><mrow><mi>α</mi><mo>×</mo><mi>β</mi></mrow><annotation encoding="application/x-tex"> \\alpha \\times \\beta </annotation></semantics></math></p>'
    );
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
    expect(result.html).toBe(
      '<p><math><semantics><mrow><mi>a</mi><mo separator="true">,</mo><mi>b</mi><mo>∈</mo><mi>G</mi></mrow><annotation encoding="application/x-tex">a, b \\in G</annotation></semantics></math>, <math><semantics><mrow><mi>a</mi><mo>∘</mo><mi>b</mi><mo>∈</mo><mi>G</mi></mrow><annotation encoding="application/x-tex">a \\circ b \\in G</annotation></semantics></math>.</p>'
    );
  });

  it('converts embedded LaTeX inside Markdown', () => {
    const payload = {
      plainText: 'Let $a, b \\in G$ be elements, then $a \\circ b \\in G$.'
    };

    const result = convert(payload, 'markdown');
    expect(result.plaintext).toBe('Let a, b ∈ G be elements, then a ∘ b ∈ G.');
    expect(result.markdown).toBe('Let a, b ∈ G be elements, then a ∘ b ∈ G.');
    expect(result.html).toBe(
      '<p>Let <math><semantics><mrow><mi>a</mi><mo separator="true">,</mo><mi>b</mi><mo>∈</mo><mi>G</mi></mrow><annotation encoding="application/x-tex">a, b \\in G</annotation></semantics></math> be elements, then <math><semantics><mrow><mi>a</mi><mo>∘</mo><mi>b</mi><mo>∈</mo><mi>G</mi></mrow><annotation encoding="application/x-tex">a \\circ b \\in G</annotation></semantics></math>.</p>'
    );
  });

  it('strips zero-width spaces during normalization to ensure correct LaTeX conversion', () => {
    const payload = {
      plainText:
        '$\\m\u200bathbf{\\S\u200bigma} = \\s\u200bigma^2 \\m\u200bathbf{I}$'
    };
    const result = convert(payload, 'auto');
    expect(result.plaintext).toBe('Σ = σ² I');
    expect(result.markdown).toBe('Σ = σ² I');
    expect(result.html).toContain('𝚺');
    expect(result.html).toContain('𝐈');
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
    expect(result.html).toBe(
      '<p><math><semantics><mrow><mi>ℝ</mi><mo>∖</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\mathbb{R} \\setminus {0}</annotation></semantics></math></p>'
    );
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

  it('handles the user paste that breaks advanced-paster', () => {
    const payload = {
      plainText:
        'Let \nf\n:\nR\nn\n→\nR\nm\n :\\mathbb {R} ^{n}\\to \\mathbb {R} ^{m}}{\\textstyle \\mathbf {f} :\\mathbb {R} ^{n}\\to \\mathbb {R} ^{m}} be a function such that each of its first-order partial derivatives exists on \nR\nn\n{\\textstyle \\mathbb {R} ^{n}}.'
    };
    const result = convert(payload, 'auto');
    expect(result.plaintext).toContain(
      'Let f :\u211d\u207f\u2192 \u211d\u1d50'
    );
  });

  it('handles Wikipedia vector space copy-paste math and does not leave hanging brackets', () => {
    const userText = `A vector space over a field F is a non-empty set V together with a binary operation and a binary function that satisfy the eight axioms listed below. In this context, the elements of V are commonly called vectors, and the elements of F are called scalars.[2]

The binary operation, called vector addition or simply addition assigns to any two vectors v and w in V a third vector in V which is commonly written as v + w, and called the sum of these two vectors.
The binary function, called scalar multiplication, assigns to any scalar a in F and any vector v in V another vector in V, which is denoted av.[nb 2]
To have a vector space, the eight following axioms must be satisfied for every u, v and w in V, and a and b in F.[3]

Vector axioms
Axiom	Statement
Associativity of vector addition	u + (v + w) = (u + v) + w
Commutativity of vector addition	u + v = v + u
Identity element of vector addition	There exists an element 0 ∈ V, called the zero vector, such that v + 0 = v for all v ∈ V.
Inverse elements of vector addition	For every v ∈ V, there exists an element −v ∈ V, called the additive inverse of v, such that v + (−v) = 0.
Compatibility of scalar multiplication with field multiplication	a(bv) = (ab)v [nb 3]
Identity element of scalar multiplication	1v = v, where 1 denotes the multiplicative identity in F.
Distributivity of scalar multiplication with respect to vector addition    	a(u + v) = au + av
Distributivity of scalar multiplication with respect to field addition	(a + b)v = av + bv
When the scalar field is the real numbers, the vector space is called a real vector space, and when the scalar field is the complex numbers, the vector space is called a complex vector space.[4] These two cases are the most common ones, but vector spaces with scalars in an arbitrary field F are also commonly considered. Such a vector space is called an F-vector space or a vector space over F.[5]

An equivalent definition of a vector space can be given, which is much more concise but less elementary: the first four axioms (related to vector addition) say that a vector space is an abelian group under addition, and the four remaining axioms (related to the scalar multiplication) say that this operation defines a ring homomorphism from the field F into the endomorphism ring of this group.[6] Specifically, the distributivity of scalar multiplication with respect to vector addition means that multiplication by a scalar a is an endomorphism of the group. The remaining three axioms establish that the function that maps a scalar a to the multiplication by a is a ring homomorphism from the field to the endomorphism ring of the group.

Subtraction of two vectors can be defined as
v
−
w
=
v
+
(
−
w
)
.
{\\displaystyle \\mathbf {v} -\\mathbf {w} =\\mathbf {v} +(-\\mathbf {w} ).}

Direct consequences of the axioms include that, for every 
s
∈
F
{\\displaystyle s\\in F} and 
v
∈
V
,
{\\displaystyle \\mathbf {v} \\in V,} one has

0
v
=
0
,
{\\displaystyle 0\\mathbf {v} =\\mathbf {0} ,}
s
0
=
0
,
{\\displaystyle s\\mathbf {0} =\\mathbf {0} ,}
(
−
1
)
v
=
−
v
,
{\\displaystyle (-1)\\mathbf {v} =-\\mathbf {v} ,}
s
v
=
0
{\\displaystyle s\\mathbf {v} =\\mathbf {0} } implies 
s
=
0
{\\displaystyle s=0} or 
v
=
0
.
{\\displaystyle \\mathbf {v} =\\mathbf {0} .}
Even more concisely, a vector space is a module over a field.[7]`;
    const payload = { plainText: userText };
    const result = convert(payload, 'auto');
    expect(result.plaintext).not.toContain('(\n−');
    expect(result.plaintext).toContain('(-1)v =-v');
  });

  it('handles Wikipedia style math paste preserving matrix columns, HTML entities, and block display mode', () => {
    const payload = {
      plainText: 'latex test',
      htmlText:
        '<p>Formula: <span class="mwe-math-element mwe-math-element-block"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="{\\displaystyle \\begin{matrix} 1 &amp; 2 \\\\ 3 &amp; 4 \\end{matrix}}"><semantics><mrow>...</mrow><annotation encoding="application/x-tex">{\\displaystyle \\begin{matrix} 1 &amp; 2 \\\\ 3 &amp; 4 \\end{matrix}}</annotation></semantics></math></span></p>'
    };
    const result = convert(payload, 'html');
    // Ensure display="block" is preserved / detected
    expect(result.html).toContain('display="block"');
    expect(result.html).toContain('class="tml-display"');
    // Ensure HTML entities are decoded in MathML body cells (cell values 2 and 4 are rendered properly)
    expect(result.html).toContain('<mn>2</mn></mtd>');
    expect(result.html).toContain('<mn>4</mn></mtd>');
    // Ensure styles inside mtd elements are preserved (e.g. padding)
    expect(result.html).toContain(
      'style="padding-left:0em;padding-right:5.9776pt;"'
    );
  });
});
