// A best-effort mapping of LaTeX symbols to their closest Unicode equivalent.
export const LATEX_TO_UNICODE: Record<string, string> = {
  '\\alpha': 'α',
  '\\angle': '∠',
  '\\approx': '≈',
  '\\beta': 'β',
  '\\cap': '∩',
  '\\cdot': '⋅',
  '\\chi': 'χ',
  '\\circ': '∘',
  '\\cup': '∪',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\div': '÷',
  '\\downarrow': '↓',
  '\\epsilon': 'ε',
  '\\equiv': '≡',
  '\\eta': 'η',
  '\\exists': '∃',
  '\\forall': '∀',
  '\\gamma': 'γ',
  '\\Gamma': 'Γ',
  '\\geq': '≥',
  '\\in': '∈',
  '\\infty': '∞',
  '\\int': '∫',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\Lambda': 'Λ',
  '\\leftarrow': '←',
  '\\Leftarrow': '⇐',
  '\\leftrightarrow': '↔',
  '\\Leftrightarrow': '⇔',
  '\\leq': '≤',
  '\\mathbb{C}': 'ℂ',
  '\\mathbb{N}': 'ℕ',
  '\\mathbb{Q}': 'ℚ',
  '\\mathbb{R}': 'ℝ',
  '\\mathbb{Z}': 'ℤ',
  '\\mp': '∓',
  '\\mu': 'μ',
  '\\nabla': '∇',
  '\\neq': '≠',
  '\\notin': '∉',
  '\\nu': 'ν',
  '\\odot': '⊙',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
  '\\partial': '∂',
  '\\phi': 'φ',
  '\\Phi': 'Φ',
  '\\pi': 'π',
  '\\Pi': 'Π',
  '\\pm': '±',
  '\\prod': '∏',
  '\\propto': '∝',
  '\\psi': 'ψ',
  '\\Psi': 'Ψ',
  '\\rho': 'ρ',
  '\\rightarrow': '→',
  '\\Rightarrow': '⇒',
  '\\setminus': '∖',
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\sim': '∼',
  '\\sqrt': '√',
  '\\subset': '⊂',
  '\\sum': '∑',
  '\\supset': '⊃',
  '\\tau': 'τ',
  '\\theta': 'θ',
  '\\Theta': 'Θ',
  '\\times': '×',
  '\\uparrow': '↑',
  '\\upsilon': 'υ',
  '\\Upsilon': 'Υ',
  '\\xi': 'ξ',
  '\\Xi': 'Ξ',
  '\\zeta': 'ζ'
};

/**
 * Pure function that performs a best-effort conversion of LaTeX strings
 * to plain text with unicode symbols.
 * Strips out structural macros but preserves their content where possible.
 */
export const latexToText = (latex: string): string =>
  Object.entries(LATEX_TO_UNICODE)
    .reduce((text, [symbol, unicode]) => {
      const regex = new RegExp(
        `\\\\${symbol.replace('\\', '')}(?![a-zA-Z])`,
        'g'
      );
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
