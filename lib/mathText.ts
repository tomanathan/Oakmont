// Converts the plain-text math notation already used throughout the
// curriculum (unicode √, ∛, ±, ², ³, and "a/b" style fractions) into LaTeX,
// so it can be rendered with real math typesetting (KaTeX) — vertical
// fraction bars, proper radicals, real superscripts — without having to
// rewrite the underlying content. Deliberately conservative: only converts
// spans that are unambiguously math (contain a digit, a math symbol, or are
// a parenthesized group, and single-letter variables must be their own
// whole word), so ordinary prose with a slash in it (like "pass/fail" or
// "and/or") is left completely alone.

const PAREN = "\\((?:[^()]|\\([^()]*\\))*\\)"; // balanced parens, 1 level of nesting
// A token on either side of a fraction bar: a parenthesized group, digits
// with an optional single trailing variable letter ("42a", "3.5"), or a
// single standalone variable letter with an optional trailing digit ("x",
// "2a" is covered above, "a2" here) — \b on the letter form specifically so
// it can never match a letter embedded inside an ordinary word.
const TOKEN = `(?:${PAREN}|\\b[0-9]+(?:\\.[0-9]+)?[a-zA-Zπ]?|\\b[a-zA-Zπ][0-9]?\\b)`;
const FRACTION = `${TOKEN}\\s*/\\s*${TOKEN}`;
const SQRT = `[√∛](?:${PAREN}|[0-9]+(?:\\.[0-9]+)?)`;
const PAREN_EXPONENT = `${PAREN}[²³]`;
const BARE_EXPONENT = "[0-9a-zA-Z][²³]";

const MASTER = new RegExp(
  `(${FRACTION})|(${SQRT})|(${PAREN_EXPONENT})|(${BARE_EXPONENT})|(±)`,
  "g"
);

function convertAtoms(s: string): string {
  s = s.replace(/([0-9a-zA-Z)\]])²/g, "$1^{2}");
  s = s.replace(/([0-9a-zA-Z)\]])³/g, "$1^{3}");
  s = s.replace(/±/g, "\\pm ");
  s = s.replace(/π/g, "\\pi ");
  return s;
}

function convertRoots(s: string): string {
  const balancedSqrt = /√\(((?:[^()]|\([^()]*\))*)\)/;
  const balancedCbrt = /∛\(((?:[^()]|\([^()]*\))*)\)/;
  let prev: string;
  do {
    prev = s;
    s = s.replace(balancedSqrt, (_m, inner: string) => `\\sqrt{${inner}}`);
    s = s.replace(balancedCbrt, (_m, inner: string) => `\\sqrt[3]{${inner}}`);
  } while (s !== prev);
  s = s.replace(/√([0-9]+(?:\.[0-9]+)?)/g, "\\sqrt{$1}");
  s = s.replace(/∛([0-9]+(?:\.[0-9]+)?)/g, "\\sqrt[3]{$1}");
  // Fallback: √ directly against a single variable letter with no parens
  // or digits, e.g. "a√b" — only reached inside an already-detected math
  // zone (a bare "√word" in prose never matches the top-level SQRT pattern).
  s = s.replace(/√([a-zA-Zπ])/g, "\\sqrt{$1}");
  s = s.replace(/∛([a-zA-Zπ])/g, "\\sqrt[3]{$1}");
  return s;
}

function toLatex(raw: string): string {
  return convertAtoms(convertRoots(raw));
}

export interface MathSegment {
  type: "text" | "math";
  content: string;
}

export function splitMathSegments(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MASTER)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, index) });
    }

    const [full, fraction, sqrt, parenExponent, bareExponent, plusMinus] = match;
    let latex: string;
    if (fraction !== undefined) {
      const slash = fraction.lastIndexOf("/");
      const num = fraction.slice(0, slash).trim();
      const den = fraction.slice(slash + 1).trim();
      latex = `\\frac{${toLatex(num)}}{${toLatex(den)}}`;
    } else if (sqrt !== undefined) {
      latex = toLatex(sqrt);
    } else if (parenExponent !== undefined) {
      const base = parenExponent.slice(0, -1);
      const power = parenExponent.endsWith("³") ? "3" : "2";
      latex = `${toLatex(base)}^{${power}}`;
    } else if (bareExponent !== undefined) {
      const base = bareExponent.slice(0, -1);
      const power = bareExponent.endsWith("³") ? "3" : "2";
      latex = `${base}^{${power}}`;
    } else {
      latex = "\\pm";
    }

    segments.push({ type: "math", content: latex });
    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}
