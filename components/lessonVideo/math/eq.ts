// Equations as tokens, so one line of work can *become* the next: tokens
// that survive glide to their new place, terms that cancel are struck out,
// and terms that combine fly together into what they make (the idea behind
// Manim's TransformMatchingTex).

export type TokKind = "term" | "num" | "frac" | "sup" | "word" | "rel" | "op" | "open" | "close" | "punct";

export interface Tok {
  text: string;
  kind: TokKind;
  // Which side of the = (or <, ≤ …) it's on: 0 left, 1 right.
  side: 0 | 1;
  latex: string;
  // A minus sign with nothing to subtract from ("−3", "(−2)").
  unary?: boolean;
}

const RELS = new Set(["=", "<", ">", "≤", "≥", "≠", "≈"]);
const WORDS = new Set(["or", "so", "if", "of", "on", "to", "is", "no", "at", "in", "by", "as", "and", "both", "not", "yes"]);
const SUP: Record<string, string> = { "²": "2", "³": "3", "⁴": "4", "⁰": "0", "¹": "1", "⁵": "5", "⁶": "6" };

const RE = new RegExp(
  [
    "(\\d+(?:\\.\\d+)?\\/\\d+(?:\\.\\d+)?)", // 1 fraction 3/4
    "(\\^\\((?:[^()]|\\([^()]*\\))*\\)|\\^[-−]?[\\w.]+|[²³⁴⁰¹⁵⁶]+)", // 2 superscript
    "(√\\d+(?:\\.\\d+)?)", // 3 root of a number
    "([a-zA-Z]{3,}|[a-zA-Z]{2}(?=\\s|$|[:,;]))", // 4 word (checked below)
    "((?:\\d[\\d,]*(?:\\.\\d+)?)?(?:[a-zA-Zπ](?![a-zA-Z]{2}))+|\\d[\\d,]*(?:\\.\\d+)?%?|\\.\\d+%?)", // 5 term or number
    "(=|<|>|≤|≥|≠|≈)", // 6 relation
    "([+\\-−×·÷/±→↔:])", // 7 operator
    "([(\\[])", // 8
    "([)\\]])", // 9
    "(\\S)", // 10 anything else
  ].join("|"),
  "g",
);

function texNum(s: string) {
  return s.replace(/,/g, "{,}").replace(/%/g, "\\%");
}
function texTerm(s: string) {
  return s.replace(/π/g, "\\pi ").replace(/,/g, "{,}");
}

export function tokenize(line: string): Tok[] {
  const out: Tok[] = [];
  let side: 0 | 1 = 0;
  for (const m of line.matchAll(RE)) {
    const [text, frac, sup, root, word, termOrNum, rel, op, open, close] = m;
    let t: Tok;
    if (frac) {
      const [a, b] = frac.split("/");
      t = { text, kind: "frac", side, latex: `\\tfrac{${a}}{${b}}` };
    } else if (sup) {
      const body = sup.startsWith("^") ? sup.slice(1).replace(/^\((.*)\)$/, "$1").replace(/−/g, "-") : sup.split("").map((c) => SUP[c] ?? c).join("");
      t = { text, kind: "sup", side, latex: `{}^{${body.replace(/\//g, "/")}}` };
    } else if (root) {
      t = { text, kind: "num", side, latex: `\\sqrt{${root.slice(1)}}` };
    } else if (word && (word.length >= 3 || WORDS.has(word.toLowerCase()))) {
      t = { text, kind: "word", side, latex: `\\text{${word}}` };
    } else if (word || termOrNum) {
      const s = word || termOrNum;
      const isNum = /^[\d.,]+%?$/.test(s);
      t = { text: s, kind: isNum ? "num" : "term", side, latex: isNum ? texNum(s) : texTerm(s) };
    } else if (rel) {
      t = { text, kind: "rel", side, latex: { "=": "=", "<": "<", ">": ">", "≤": "\\le", "≥": "\\ge", "≠": "\\ne", "≈": "\\approx" }[rel]! };
    } else if (op) {
      const tex: Record<string, string> = { "+": "+", "-": "-", "−": "-", "×": "\\times", "·": "\\cdot", "÷": "\\div", "/": "/", "±": "\\pm", "→": "\\to", "↔": "\\leftrightarrow", ":": ":" };
      t = { text, kind: op === ":" ? "punct" : "op", side, latex: tex[op] };
    } else if (open) {
      t = { text, kind: "open", side, latex: open === "[" ? "[" : "(" };
    } else if (close) {
      t = { text, kind: "close", side, latex: close === "]" ? "]" : ")" };
    } else {
      const c = text;
      t = { text: c, kind: c === "," || c === ";" ? "punct" : c === "|" ? "open" : "punct", side, latex: c === "|" ? "|" : c === "%" ? "\\%" : c === "°" ? "^\\circ" : c === "∠" ? "\\angle" : c === "△" ? "\\triangle" : c.replace(/[{}\\$&#_]/g, "") || "\\cdot" };
    }
    if ((t.text === "−" || t.text === "-" || t.text === "+" || t.text === "±") && t.kind === "op") {
      const prev = out[out.length - 1];
      t.unary = !prev || prev.kind === "rel" || prev.kind === "open" || prev.kind === "punct" || (prev.kind === "op" && prev.text !== "/");
    }
    if (rel && side === 0) {
      t.side = 0;
      out.push(t);
      side = 1;
      continue;
    }
    out.push(t);
  }
  return out;
}

const key = (t: Tok) => t.text.replace(/−/g, "-");
const isQuantity = (t: Tok) => t.kind === "term" || t.kind === "num" || t.kind === "frac" || t.kind === "sup";
const letters = (s: string) => new Set(s.replace(/[^a-zA-Zπ]/g, "").split(""));
const digits = (s: string) => s.replace(/[^\d]/g, "");

/** The operation a margin note applies to both sides ("−3x both sides"). */
export function noteOp(note: string | undefined): Tok[] | null {
  if (!note) return null;
  const m = note.match(/^\s*([−+\-×÷·]\s?[^\s]+)\s+(?:to\s+)?both sides/i) ?? note.match(/^\s*(?:both sides\s+)?([−+\-×÷·]\s?[^\s]+)\s*$/);
  if (!m || !/both/i.test(note)) return null;
  const toks = tokenize(m[1].replace(/\s/g, ""));
  toks.forEach((t) => (t.unary = t.kind === "op" ? true : undefined));
  return toks;
}

export interface MorphPlan {
  // For each token of the new line: where it comes from.
  //   "stay": the same token in the old line (index), glides over
  //   "from": built from these old tokens (indexes) and op tokens (op:side:index)
  //   "new":  just appears
  into: ({ how: "stay"; a: number } | { how: "from"; a: number[]; ops: [0 | 1, number][] } | { how: "new" })[];
  // Old tokens that go nowhere: they cancel (struck, then fade).
  cancel: number[];
  // Op tokens (per side) that go nowhere.
  opCancel: [0 | 1, number][];
}

/** Matches the tokens of two consecutive lines. */
export function planMorph(a: Tok[], b: Tok[], op: Tok[] | null): MorphPlan {
  // 1. Longest common subsequence on token text: what simply stays.
  const n = a.length;
  const m = b.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) L[i][j] = key(a[i]) === key(b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const bFromA = new Array<number>(m).fill(-1);
  const aUsed = new Array<boolean>(n).fill(false);
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (key(a[i]) === key(b[j])) {
      bFromA[j] = i;
      aUsed[i] = true;
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  // 2. Quantities that moved (across the = sign, or reordered).
  for (let j = 0; j < m; j++) {
    if (bFromA[j] >= 0 || !isQuantity(b[j])) continue;
    const i = a.findIndex((t, k) => !aUsed[k] && key(t) === key(b[j]));
    if (i >= 0) {
      bFromA[j] = i;
      aUsed[i] = true;
    }
  }
  // 3. New quantities are made from the leftover old ones nearby.
  const opToks: [0 | 1, number, Tok][] = [];
  if (op)
    for (const side of [0, 1] as const)
      op.forEach((t, k) => {
        if (isQuantity(t)) opToks.push([side, k, t]);
      });
  const opUsed = new Set<string>();
  const into: MorphPlan["into"] = b.map((t, j) => {
    if (bFromA[j] >= 0) return { how: "stay", a: bFromA[j] };
    if (!isQuantity(t)) return { how: "new" };
    const fits = (s: Tok) => {
      if (!isQuantity(s)) return false;
      const lt = letters(t.text);
      const ls = letters(s.text);
      if (lt.size && ls.size) return [...ls].some((c) => lt.has(c));
      if (lt.size) return s.kind === "num" && digits(t.text).includes(digits(s.text)) && digits(s.text) !== "";
      return !ls.size;
    };
    const pick = (sameSide: boolean) => {
      const src = a.map((s, k) => k).filter((k) => !aUsed[k] && (a[k].side === t.side) === sameSide && fits(a[k]));
      const ops = opToks.filter(([side, , s]) => (side === t.side) === sameSide && fits(s)).map(([side, k]) => [side, k] as [0 | 1, number]);
      return { src, ops };
    };
    let { src, ops } = pick(true);
    if (!src.length && !ops.length) ({ src, ops } = pick(false));
    if (!src.length && !ops.length) return { how: "new" };
    ops.forEach(([s, k]) => opUsed.add(`${s}:${k}`));
    return { how: "from", a: src, ops };
  });
  const feeds = new Set(into.flatMap((x) => (x.how === "from" ? x.a : [])));
  const cancel = a.map((_, k) => k).filter((k) => !aUsed[k] && !feeds.has(k));
  const opCancel = opToks.filter(([s, k]) => !opUsed.has(`${s}:${k}`)).map(([s, k]) => [s, k] as [0 | 1, number]);
  return { into, cancel, opCancel };
}
