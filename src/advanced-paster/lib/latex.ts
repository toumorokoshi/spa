import temml from 'temml';

export const normalizeInput = (text: string): string =>
  text
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b-\u200f\ufeff\u2060\u00ad\u202a-\u202e]/g, '');

const findMatchingBrace = (
  text: string,
  index: number,
  braceCount: number
): number => {
  if (index >= text.length || braceCount === 0) {
    return index;
  }
  const nextChar = text[index];
  const nextCount =
    nextChar === '{'
      ? braceCount + 1
      : nextChar === '}'
        ? braceCount - 1
        : braceCount;
  return findMatchingBrace(text, index + 1, nextCount);
};

/**
 * Unwraps `\mathbf{...}` / `\mathbf {...}` wrappers (brace-aware, recursive).
 * Bold math styling from sources like Wikipedia is not useful in outputs.
 */
export const stripMathbfWrappers = (text: string): string => {
  const pattern = /\\mathbf\s*\{/;
  const match = pattern.exec(text);
  if (!match) {
    return text;
  }
  const startIdx = match.index;
  const openBraceIdx = startIdx + match[0].length - 1;
  const closeIdx = findMatchingBrace(text, openBraceIdx + 1, 1);
  if (closeIdx <= text.length && text[closeIdx - 1] === '}') {
    const before = text.slice(0, startIdx);
    const inner = text.slice(openBraceIdx + 1, closeIdx - 1);
    const after = text.slice(closeIdx);
    return stripMathbfWrappers(before + inner + after);
  }
  const before = text.slice(0, openBraceIdx + 1);
  const after = text.slice(openBraceIdx + 1);
  return before + stripMathbfWrappers(after);
};

// A best-effort mapping of LaTeX symbols to their closest Unicode equivalent.
export const LATEX_TO_UNICODE: Record<string, string> = {
  '\\aleph': 'ℵ',
  '\\alpha': 'α',
  '\\amalg': '⨿',
  '\\angle': '∠',
  '\\approx': '≈',
  '\\arccos': 'arccos',
  '\\arccot': 'arccot',
  '\\arccsc': 'arccsc',
  '\\arcsec': 'arcsec',
  '\\arcsin': 'arcsin',
  '\\arctan': 'arctan',
  '\\arg': 'arg',
  '\\ast': '∗',
  '\\asymp': '≍',
  '\\backsim': '∽',
  '\\backsimeq': '⋍',
  '\\beta': 'β',
  '\\Beta': 'Β',
  '\\beth': 'ℶ',
  '\\bot': '⊥',
  '\\Box': '□',
  '\\bowtie': '⋈',
  '\\bullet': '•',
  '\\cap': '∩',
  '\\cdot': '⋅',
  '\\cdots': '⋯',
  '\\chi': 'χ',
  '\\circ': '∘',
  '\\colon': ':',
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
  '\\ddots': '⋱',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\det': 'det',
  '\\diamond': '⋄',
  '\\div': '÷',
  '\\dim': 'dim',
  '\\dots': '…',
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
  '\\langle': '⟨',
  '\\lceil': '⌈',
  '\\ldots': '…',
  '\\le': '≤',
  '\\leftarrow': '←',
  '\\Leftarrow': '⇐',
  '\\leftharpoondown': '↽',
  '\\leftharpoonup': '↼',
  '\\leftrightarrow': '↔',
  '\\Leftrightarrow': '⇔',
  '\\leq': '≤',
  '\\lfloor': '⌊',
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
  '\\not': '¬',
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
  '\\over': '÷',
  '\\owns': '∋',
  '\\parallel': '∥',
  '\\partial': '∂',
  '\\perp': '⊥',
  '\\phi': 'φ',
  '\\Phi': 'Φ',
  '\\pi': 'π',
  '\\Pi': 'Π',
  '\\pm': '±',
  '\\Pr': 'Pr',
  '\\prec': '≺',
  '\\preceq': '⪯',
  '\\prime': '′',
  '\\prod': '∏',
  '\\propto': '∝',
  '\\psi': 'ψ',
  '\\Psi': 'Ψ',
  '\\rangle': '⟩',
  '\\rceil': '⌉',
  '\\rfloor': '⌋',
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
  '\\sgn': 'sgn',
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\sim': '∼',
  '\\simeq': '≃',
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
  '\\to': '→',
  '\\top': '⊤',
  '\\triangleq': '≜',
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
  '\\vdots': '⋮',
  '\\vee': '∨',
  '\\Vert': '‖',
  '\\vert': '|',
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

export const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  a: 'ᵃ',
  e: 'ᵉ',
  h: 'ʰ',
  i: 'ⁱ',
  j: 'ʲ',
  k: 'ᵏ',
  l: 'ˡ',
  m: 'ᵐ',
  n: 'ⁿ',
  o: 'ᵒ',
  p: 'ᵖ',
  r: 'ʳ',
  s: 'ˢ',
  t: 'ᵗ',
  u: 'ᵘ',
  v: 'ᵛ',
  x: 'ˣ'
};

export const SUBSCRIPTS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ'
};

export const unicodeToLetterMap: Record<string, string> = Object.entries(
  LATEX_TO_UNICODE
).reduce(
  (acc, [key, val]) => {
    const match = /\\math(?:bb|cal){([A-Z])}/.exec(key);
    if (match) {
      return { ...acc, [val]: match[1].toLowerCase() };
    }
    return acc;
  },
  {} as Record<string, string>
);

const convertSuperscriptsAndSubscripts = (text: string): string => {
  return text
    .replace(/\^{([^}]+)}/g, (_, content) =>
      content
        .split('')
        .map((char) => SUPERSCRIPTS[char] || char)
        .join('')
    )
    .replace(
      /\^([a-zA-Z0-9+-=()])/g,
      (_, char) => SUPERSCRIPTS[char] || `^${char}`
    )
    .replace(/_{([^}]+)}/g, (_, content) =>
      content
        .split('')
        .map((char) => SUBSCRIPTS[char] || char)
        .join('')
    )
    .replace(
      /_([a-zA-Z0-9+-=()])/g,
      (_, char) => SUBSCRIPTS[char] || `_${char}`
    );
};

/**
 * Pure function that performs a best-effort conversion of LaTeX strings
 * to plain text with unicode symbols.
 * Strips out structural macros but preserves their content where possible.
 */
export const latexToText = (latex: string): string => {
  const normalized = stripMathbfWrappers(normalizeInput(latex))
    .replace(
      /\\(mathbb|mathcal|mathbf|mathrm|mathit|text|textbf|textit|frac|tfrac|dfrac|cfrac|boldsymbol|bold|mathsf|operatorname|widehat|vec|underbrace)\s+({)/g,
      '\\$1$2'
    )
    .replace(/\s*\^\s*/g, '^')
    .replace(/\s*_\s*/g, '_')
    .replace(
      /\\xrightarrow\s*(?:\[([^\]]*)\])?\s*{([^}]+)}/g,
      (_, below, above) => {
        return below ? `──(${above})──→[${below}]` : `──(${above})──→`;
      }
    );

  const converted = Object.entries(LATEX_TO_UNICODE)
    .reduce((text, [symbol, unicode]) => {
      const escaped = escapeRegExp(symbol.replace('\\', ''));
      const regex = new RegExp(`\\\\${escaped}(?![a-zA-Z])`, 'g');
      return text.replace(regex, unicode);
    }, normalized)
    .replace(
      /\\(textbf|textit|text|mathrm|mathbf|mathit|boldsymbol|bold|mathsf|operatorname|widehat|underbrace|vec){([^}]+)}/g,
      '$2'
    )
    .replace(/\\vec\s*([a-zA-Z0-9])/g, '$1')
    .replace(/\\stackrel{([^}]+)}{([^}]+)}/g, '$2')
    .replace(/\\binom{([^}]+)}{([^}]+)}/g, '($1 choose $2)')
    .replace(/\\pmod\s*{([^}]+)}/g, '(mod $1)')
    .replace(/\\pmod\s+([a-zA-Z0-9]+)/g, '(mod $1)')
    .replace(
      /\\(?:biggr|biggl|Biggl|Biggr|bigl|bigr|Bigl|Bigr|big|Big)\s*/g,
      ''
    )
    .replace(/\$\$?/g, '')
    .replace(/\\\[|\\\]|\\\(|\\\)/g, '')
    .replace(/\\(?:frac|tfrac|dfrac|cfrac){([^}]+)}{([^}]+)}/g, '($1)/($2)')
    .replace(/\\{/g, '{')
    .replace(/\\}/g, '}')
    .replace(/\\begin{([^}]+)}/g, '')
    .replace(/\\end{([^}]+)}/g, '')
    .trim();

  return convertSuperscriptsAndSubscripts(converted)
    .replace(/\^′/g, '′')
    .replace(/\^{′}/g, '′');
};

const MAX_SHORT_LATEX_LENGTH = 4;

const SCRIPT_TAGS = new Set([
  'msub',
  'msup',
  'msubsup',
  'mfrac',
  'mmultiscripts'
]);

const isSingleLetterMi = (el: Element | null): boolean => {
  if (!el || el.tagName.toLowerCase() !== 'mi') {
    return false;
  }
  return /^[a-zA-Z]$/.test(el.textContent?.trim() || '');
};

const getMergedWord = (miList: Element[], extraText = ''): string =>
  miList.map((el) => el.textContent?.trim() || '').join('') + extraText;

const mergeScriptBase = (miList: Element[], nextEl: Element): boolean => {
  const baseEl = nextEl.firstElementChild;
  if (!isSingleLetterMi(baseEl) || !baseEl) {
    return false;
  }
  baseEl.textContent = getMergedWord(miList, baseEl.textContent?.trim() || '');
  miList.forEach((el) => el.remove());
  return true;
};

const mergeConsecutiveMi = (miList: Element[]): boolean => {
  if (miList.length < 2) {
    return false;
  }
  const word = getMergedWord(miList);
  miList[0].textContent = word;
  miList.slice(1).forEach((el) => el.remove());
  return true;
};

const mergeMiNodes = (miList: Element[], nextEl?: Element): boolean => {
  const isScript = Boolean(
    nextEl && SCRIPT_TAGS.has(nextEl.tagName.toLowerCase())
  );

  if (isScript && nextEl && mergeScriptBase(miList, nextEl)) {
    return true;
  }

  return mergeConsecutiveMi(miList);
};

const groupMiChildren = (children: Element[]): Element[][] => {
  return children.reduce<Element[][]>((groups, child) => {
    const isMi = isSingleLetterMi(child);
    const lastGroup = groups[groups.length - 1];
    if (isMi && lastGroup && isSingleLetterMi(lastGroup[0])) {
      lastGroup.push(child);
      return groups;
    }
    return [...groups, [child]];
  }, []);
};

const processGroup = (
  group: Element[],
  index: number,
  allGroups: Element[][]
): void => {
  if (!isSingleLetterMi(group[0])) {
    return;
  }
  const nextGroup = allGroups[index + 1];
  const nextEl = nextGroup ? nextGroup[0] : undefined;
  mergeMiNodes(group, nextEl);
};

const processRowContainer = (parent: Element): void => {
  const children = Array.from(parent.children);
  const groups = groupMiChildren(children);
  groups.forEach((group, index) => processGroup(group, index, groups));
};

const processContainer = (parent: Element): void => {
  const parentTag = parent.tagName.toLowerCase();
  if (!SCRIPT_TAGS.has(parentTag)) {
    processRowContainer(parent);
  }
  Array.from(parent.children).forEach(processContainer);
};

const extractLettersFromMatch = (match: string): string[] => {
  const miRegex = /<mi\b[^>]*>\s*([a-zA-Z])\s*<\/mi>/g;
  return Array.from(match.matchAll(miRegex), (m) => m[1]);
};

const fallbackPostProcess = (mathml: string): string => {
  return mathml.replace(
    /(?:<mi\b[^>]*>\s*([a-zA-Z])\s*<\/mi>\s*){2,}/g,
    (match) => `<mi>${extractLettersFromMatch(match).join('')}</mi>`
  );
};

/**
 * Post-processes a MathML string to combine consecutive single-character <mi> elements
 * (e.g. <mi>L</mi><mi>o</mi><mi>s</mi><mi>s</mi>) into a single <mi> element (<mi>Loss</mi>).
 * Also merges preceding single-letter <mi> elements with single-letter base elements of scripts
 * (e.g. <mi>L</mi><mi>o</mi><mi>s</mi><msub><mi>s</mi>... -> <msub><mi>Loss</mi>...).
 */
export const postProcessMathML = (mathml: string): string => {
  if (!mathml) {
    return mathml;
  }

  if (typeof DOMParser === 'undefined') {
    return fallbackPostProcess(mathml);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mathml, 'text/html');
    processContainer(doc.body);
    return doc.body.innerHTML;
  } catch (e) {
    console.error('MathML post-processing error:', e);
    return mathml;
  }
};

/**
 * Converts a single LaTeX math expression into a MathML block using Temml.
 */
export const latexToMathML = (latex: string, displayMode = false): string => {
  try {
    const cleanLatex = stripMathbfWrappers(normalizeInput(latex));
    const raw = temml.renderToString(cleanLatex, {
      displayMode,
      annotate: true,
      throwOnError: false
    });
    return postProcessMathML(raw);
  } catch (e) {
    console.error('Temml error:', e);
    const cleanLatex = stripMathbfWrappers(normalizeInput(latex));
    const escaped = cleanLatex
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<math><mtext>${escaped}</mtext></math>`;
  }
};

/**
 * Parses a string containing embedded LaTeX math expressions (inside $...$, $$...$$,
 * \(...\), and \[...\]) and converts those segments to their Unicode equivalents.
 * Employs strict heuristics on inline dollar signs to avoid matching currency strings (e.g., $10).
 */
export const convertEmbeddedLatexToUnicode = (text: string): string => {
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

/**
 * Parses a string containing embedded LaTeX math expressions and converts those
 * segments to MathML strings using Temml.
 */
export const convertEmbeddedLatexToMathML = (text: string): string => {
  // 1. Process display math blocks: $$ ... $$
  const step1 = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, content) => {
    return latexToMathML(content, true);
  });

  // 2. Process display math blocks: \[ ... \]
  const step2 = step1.replace(/\\\[([\s\S]*?)\\\]/g, (_, content) => {
    return latexToMathML(content, true);
  });

  // 3. Process inline math blocks: \( ... \)
  const step3 = step2.replace(/\\\(([\s\S]*?)\\\)/g, (_, content) => {
    return latexToMathML(content, false);
  });

  // 4. Process inline math blocks: $ ... $
  const inlineMathRegex = /\$([^$\n]+?)\$/g;
  return step3.replace(inlineMathRegex, (match, content) => {
    const trimmed = content.trim();

    // If it contains a backslash, it's definitely LaTeX
    if (trimmed.includes('\\')) {
      return latexToMathML(content, false);
    }

    // Check for single variable or short expression (e.g., $x$, $a$, $G$, $x_1$)
    if (trimmed.length <= MAX_SHORT_LATEX_LENGTH) {
      return latexToMathML(content, false);
    }

    // Check for common English words that indicate regular text
    const commonWords =
      /\b(and|or|the|costs|price|sale|for|from|with|has|are|was|were|buy|pay|item|total|is|of|in|to|that|this|at|on|by|an)\b/i;
    if (commonWords.test(trimmed)) {
      return match;
    }

    // Check for mathematical operators or symbols
    const MATH_OPERATORS = ['=', '<', '>', '+', '-', '*', '/', '^', '_'];
    const hasMathOperators = MATH_OPERATORS.some((op) => trimmed.includes(op));
    if (hasMathOperators) {
      return latexToMathML(content, false);
    }

    return match;
  });
};
