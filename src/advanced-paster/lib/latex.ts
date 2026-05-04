// A best-effort mapping of LaTeX symbols to their closest Unicode equivalent.
export const LATEX_TO_UNICODE: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Gamma': 'Γ',
  '\\Delta': 'Δ',
  '\\Theta': 'Θ',
  '\\Lambda': 'Λ',
  '\\Xi': 'Ξ',
  '\\Pi': 'Π',
  '\\Sigma': 'Σ',
  '\\Upsilon': 'Υ',
  '\\Phi': 'Φ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',
  '\\times': '×',
  '\\div': '÷',
  '\\pm': '±',
  '\\mp': '∓',
  '\\cdot': '⋅',
  '\\infty': '∞',
  '\\approx': '≈',
  '\\neq': '≠',
  '\\leq': '≤',
  '\\geq': '≥',
  '\\equiv': '≡',
  '\\sim': '∼',
  '\\propto': '∝',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\supset': '⊃',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\Leftrightarrow': '⇔',
  '\\rightarrow': '→',
  '\\leftarrow': '←',
  '\\leftrightarrow': '↔',
  '\\uparrow': '↑',
  '\\downarrow': '↓',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\int': '∫',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\sqrt': '√',
  '\\angle': '∠',
  '\\circ': '∘'
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
