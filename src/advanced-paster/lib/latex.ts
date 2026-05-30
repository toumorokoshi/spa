// A best-effort mapping of LaTeX symbols to their closest Unicode equivalent.
export const LATEX_TO_UNICODE: Record<string, string> = {
  '\\aleph': 'ℵ',
  '\\alpha': 'α',
  '\\amalg': '⨿',
  '\\angle': '∠',
  '\\approx': '≈',
  '\\arccos': 'arccos',
  '\\arcsin': 'arcsin',
  '\\arctan': 'arctan',
  '\\arg': 'arg',
  '\\ast': '∗',
  '\\asymp': '≍',
  '\\backsim': '∽',
  '\\backsimeq': '⋍',
  '\\beta': 'β',
  '\\beth': 'ℶ',
  '\\bot': '⊥',
  '\\bowtie': '⋈',
  '\\bullet': '•',
  '\\cap': '∩',
  '\\cdot': '⋅',
  '\\chi': 'χ',
  '\\circ': '∘',
  '\\complement': '∁',
  '\\cong': '≅',
  '\\coprod': '∐',
  '\\cos': 'cos',
  '\\cosh': 'cosh',
  '\\cot': 'cot',
  '\\coth': 'coth',
  '\\csc': 'csc',
  '\\cup': '∪',
  '\\dagger': '†',
  '\\daleth': 'ℸ',
  '\\dashv': '⊣',
  '\\ddagger': '‡',
  '\\deg': 'deg',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\det': 'det',
  '\\diamond': '⋄',
  '\\dim': 'dim',
  '\\div': '÷',
  '\\doteq': '≐',
  '\\downarrow': '↓',
  '\\Downarrow': '⇓',
  '\\ell': 'ℓ',
  '\\emptyset': '∅',
  '\\epsilon': 'ε',
  '\\equiv': '≡',
  '\\eta': 'η',
  '\\exists': '∃',
  '\\exp': 'exp',
  '\\forall': '∀',
  '\\frown': '⌢',
  '\\gamma': 'γ',
  '\\Gamma': 'Γ',
  '\\gcd': 'gcd',
  '\\ge': '≥',
  '\\geq': '≥',
  '\\gg': '≫',
  '\\gimel': 'ℷ',
  '\\hbar': 'ħ',
  '\\hom': 'hom',
  '\\hookleftarrow': '↩',
  '\\hookrightarrow': '↪',
  '\\iff': '⟺',
  '\\iiint': '∭',
  '\\iint': '∬',
  '\\Im': 'ℑ',
  '\\image': 'ℑ',
  '\\impliedby': '⟸',
  '\\implies': '⟹',
  '\\in': '∈',
  '\\inf': 'inf',
  '\\infty': '∞',
  '\\int': '∫',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\ker': 'ker',
  '\\lambda': 'λ',
  '\\Lambda': 'Λ',
  '\\land': '∧',
  '\\le': '≤',
  '\\leftarrow': '←',
  '\\Leftarrow': '⇐',
  '\\leftharpoondown': '↽',
  '\\leftharpoonup': '↼',
  '\\leftrightarrow': '↔',
  '\\Leftrightarrow': '⇔',
  '\\leq': '≤',
  '\\lg': 'lg',
  '\\lim': 'lim',
  '\\liminf': 'liminf',
  '\\limsup': 'limsup',
  '\\ll': '≪',
  '\\ln': 'ln',
  '\\lnot': '¬',
  '\\log': 'log',
  '\\longleftarrow': '⟵',
  '\\Longleftarrow': '⟸',
  '\\longleftrightarrow': '⟷',
  '\\Longleftrightarrow': '⟺',
  '\\longmapsto': '⟼',
  '\\longrightarrow': '⟶',
  '\\Longrightarrow': '⟹',
  '\\lor': '∨',
  '\\mapsto': '↦',
  '\\mathbb{A}': '𝔸',
  '\\mathbb{B}': '𝔹',
  '\\mathbb{C}': 'ℂ',
  '\\mathbb{D}': '𝔻',
  '\\mathbb{E}': '𝔼',
  '\\mathbb{F}': '𝔽',
  '\\mathbb{G}': '𝔾',
  '\\mathbb{H}': 'ℍ',
  '\\mathbb{I}': '𝕀',
  '\\mathbb{J}': '𝕁',
  '\\mathbb{K}': '𝕂',
  '\\mathbb{L}': '𝕃',
  '\\mathbb{M}': '𝕄',
  '\\mathbb{N}': 'ℕ',
  '\\mathbb{O}': '𝕆',
  '\\mathbb{P}': 'ℙ',
  '\\mathbb{Q}': 'ℚ',
  '\\mathbb{R}': 'ℝ',
  '\\mathbb{S}': '𝕊',
  '\\mathbb{T}': '𝕋',
  '\\mathbb{U}': '𝕌',
  '\\mathbb{V}': '𝕍',
  '\\mathbb{W}': '𝕎',
  '\\mathbb{X}': '𝕏',
  '\\mathbb{Y}': '𝕐',
  '\\mathbb{Z}': 'ℤ',
  '\\mathcal{A}': '𝒜',
  '\\mathcal{B}': 'ℬ',
  '\\mathcal{C}': '𝒞',
  '\\mathcal{D}': '𝒟',
  '\\mathcal{E}': 'ℰ',
  '\\mathcal{F}': 'ℱ',
  '\\mathcal{G}': '𝒢',
  '\\mathcal{H}': 'ℋ',
  '\\mathcal{I}': 'ℐ',
  '\\mathcal{J}': '𝒥',
  '\\mathcal{K}': '𝒦',
  '\\mathcal{L}': 'ℒ',
  '\\mathcal{M}': 'ℳ',
  '\\mathcal{N}': '𝒩',
  '\\mathcal{O}': '𝒪',
  '\\mathcal{P}': '𝒫',
  '\\mathcal{Q}': '𝒬',
  '\\mathcal{R}': 'ℛ',
  '\\mathcal{S}': '𝒮',
  '\\mathcal{T}': '𝒯',
  '\\mathcal{U}': '𝒰',
  '\\mathcal{V}': '𝒱',
  '\\mathcal{W}': '𝒲',
  '\\mathcal{X}': '𝒳',
  '\\mathcal{Y}': '𝒴',
  '\\mathcal{Z}': '𝒵',
  '\\max': 'max',
  '\\measuredangle': '∡',
  '\\mid': '∣',
  '\\min': 'min',
  '\\models': '⊨',
  '\\mp': '∓',
  '\\mu': 'μ',
  '\\nabla': '∇',
  '\\ne': '≠',
  '\\nearrow': '↗',
  '\\neg': '¬',
  '\\neq': '≠',
  '\\nexists': '∄',
  '\\ni': '∋',
  '\\notin': '∉',
  '\\notsubset': '⊄',
  '\\notsubseteq': '⊈',
  '\\notsupset': '⊅',
  '\\notsupseteq': '⊉',
  '\\nu': 'ν',
  '\\nwarrow': '↖',
  '\\odot': '⊙',
  '\\oint': '∮',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
  '\\ominus': '⊖',
  '\\oplus': '⊕',
  '\\oslash': '⊘',
  '\\otimes': '⊗',
  '\\owns': '∋',
  '\\parallel': '∥',
  '\\partial': '∂',
  '\\perp': '⊥',
  '\\phi': 'φ',
  '\\Phi': 'Φ',
  '\\pi': 'π',
  '\\Pi': 'Π',
  '\\pm': '±',
  '\\prec': '≺',
  '\\preceq': '⪯',
  '\\prod': '∏',
  '\\propto': '∝',
  '\\psi': 'ψ',
  '\\Psi': 'Ψ',
  '\\Re': 'ℜ',
  '\\real': 'ℜ',
  '\\rho': 'ρ',
  '\\rightarrow': '→',
  '\\Rightarrow': '⇒',
  '\\rightharpoondown': '⇁',
  '\\rightharpoonup': '⇀',
  '\\rightleftharpoons': '⇌',
  '\\searrow': '↘',
  '\\sec': 'sec',
  '\\setminus': '∖',
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\sim': '∼',
  '\\sin': 'sin',
  '\\sinh': 'sinh',
  '\\smile': '⌣',
  '\\sphericalangle': '∢',
  '\\sqcap': '⊓',
  '\\sqcup': '⊔',
  '\\sqrt': '√',
  '\\star': '★',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\subsetne': '⊊',
  '\\subsetneq': '⊊',
  '\\succ': '≻',
  '\\succeq': '⪰',
  '\\sum': '∑',
  '\\sup': 'sup',
  '\\supset': '⊃',
  '\\supseteq': '⊇',
  '\\supsetne': '⊋',
  '\\supsetneq': '⊋',
  '\\swarrow': '↙',
  '\\tan': 'tan',
  '\\tanh': 'tanh',
  '\\tau': 'τ',
  '\\theta': 'θ',
  '\\Theta': 'Θ',
  '\\times': '×',
  '\\top': '⊤',
  '\\uparrow': '↑',
  '\\Uparrow': '⇑',
  '\\updownarrow': '↕',
  '\\Updownarrow': '⇕',
  '\\uplus': '⊎',
  '\\upsilon': 'υ',
  '\\Upsilon': 'Υ',
  '\\varepsilon': 'ε',
  '\\varnothing': '∅',
  '\\varphi': 'ϕ',
  '\\varpi': 'ϖ',
  '\\varrho': 'ϱ',
  '\\varsigma': 'ς',
  '\\vartheta': 'ϑ',
  '\\vdash': '⊢',
  '\\vee': '∨',
  '\\wedge': '∧',
  '\\wp': '℘',
  '\\wr': '≀',
  '\\xi': 'ξ',
  '\\Xi': 'Ξ',
  '\\zeta': 'ζ'
};

export const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getLatexCommands = (): string[] =>
  Object.keys(LATEX_TO_UNICODE).map((key) => {
    const withoutSlash = key.replace(/^\\+/, '');
    const commandOnly = withoutSlash.split('{')[0].split('_')[0].split('^')[0];
    return commandOnly.trim();
  });

/**
 * Pure function that performs a best-effort conversion of LaTeX strings
 * to plain text with unicode symbols.
 * Strips out structural macros but preserves their content where possible.
 */
export const latexToText = (latex: string): string =>
  Object.entries(LATEX_TO_UNICODE)
    .reduce((text, [symbol, unicode]) => {
      const escaped = escapeRegExp(symbol.replace('\\', ''));
      const regex = new RegExp(`\\\\${escaped}(?![a-zA-Z])`, 'g');
      return text.replace(regex, unicode);
    }, latex)
    .replace(/\\(textbf|textit|text|mathrm|mathbf|mathit){([^}]+)}/g, '$2')
    .replace(/\$\$?/g, '')
    .replace(/\\\[|\\\]|\\\(|\\\)/g, '')
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
    .replace(/\\{/g, '{')
    .replace(/\\}/g, '}')
    .replace(/\\begin{([^}]+)}/g, '')
    .replace(/\\end{([^}]+)}/g, '')
    .trim();

const MAX_SHORT_LATEX_LENGTH = 4;

/**
 * Parses a string containing embedded LaTeX math expressions (inside $...$, $$...$$,
 * \(...\), and \[...\]) and converts those segments to their Unicode equivalents.
 * Employs strict heuristics on inline dollar signs to avoid matching currency strings (e.g., $10).
 */
export const convertEmbeddedLatex = (text: string): string => {
  // 1. Process display math blocks: $$ ... $$
  const step1 = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, content) => {
    return latexToText(content);
  });

  // 2. Process display math blocks: \[ ... \]
  const step2 = step1.replace(/\\\[([\s\S]*?)\\\]/g, (_, content) => {
    return latexToText(content);
  });

  // 3. Process inline math blocks: \( ... \)
  const step3 = step2.replace(/\\\(([\s\S]*?)\\\)/g, (_, content) => {
    return latexToText(content);
  });

  // 4. Process inline math blocks: $ ... $
  const inlineMathRegex = /\$([^$\n]+?)\$/g;
  return step3.replace(inlineMathRegex, (match, content) => {
    const trimmed = content.trim();

    // If it contains a backslash, it's definitely LaTeX
    if (trimmed.includes('\\')) {
      return latexToText(content);
    }

    // Check for single variable or short expression (e.g., $x$, $a$, $G$, $x_1$)
    if (trimmed.length <= MAX_SHORT_LATEX_LENGTH) {
      return latexToText(content);
    }

    // Check for common English words that indicate regular text
    const commonWords =
      /\b(and|or|the|costs|price|sale|for|from|with|has|are|was|were|buy|pay|item|total|is|of|in|to|that|this|at|on|by|an)\b/i;
    if (commonWords.test(trimmed)) {
      return match; // Keep original (skip conversion)
    }

    // Check for mathematical operators or symbols
    const MATH_OPERATORS = ['=', '<', '>', '+', '-', '*', '/', '^', '_'];
    const hasMathOperators = MATH_OPERATORS.some((op) => trimmed.includes(op));
    if (hasMathOperators) {
      return latexToText(content);
    }

    // Default to keeping the original if it doesn't meet the math criteria
    return match;
  });
};
