// A tiny, safe parser for the functions a scene plots ("2x + 3",
// "-(x - 2)^2 + 4", "300(0.8)^x", "sqrt(x)", "m*x + b"). Implicit
// multiplication works the way it's written on paper. Compiles once to a
// closure; names other than x come from the object's params.

type Node = (x: number, p: Record<string, number>) => number;

const FUNCS: Record<string, (v: number) => number> = { sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10 };

export function compileExpr(src: string): Node {
  const toks = src
    .replace(/−/g, "-")
    .replace(/×|·/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-zA-Z_]+|[-+*/^()]/g);
  if (!toks) throw new Error(`empty function "${src}"`);
  let i = 0;
  const peek = () => toks?.[i];
  const next = () => toks![i++];
  const isAtomStart = (t: string | undefined) => !!t && (t === "(" || /^[\d.a-zA-Z_]/.test(t));

  // expr := term (("+"|"-") term)*
  function expr(): Node {
    let a = term();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const b = term();
      const l = a;
      a = op === "+" ? (x, p) => l(x, p) + b(x, p) : (x, p) => l(x, p) - b(x, p);
    }
    return a;
  }
  // term := unary (("*"|"/"|implicit) unary)*
  function term(): Node {
    let a = unary();
    for (;;) {
      const t = peek();
      if (t === "*" || t === "/") {
        next();
        const b = unary();
        const l = a;
        a = t === "*" ? (x, p) => l(x, p) * b(x, p) : (x, p) => l(x, p) / b(x, p);
      } else if (isAtomStart(t)) {
        const b = power();
        const l = a;
        a = (x, p) => l(x, p) * b(x, p);
      } else return a;
    }
  }
  function unary(): Node {
    if (peek() === "-") {
      next();
      const a = unary();
      return (x, p) => -a(x, p);
    }
    if (peek() === "+") {
      next();
      return unary();
    }
    return power();
  }
  // power := atom ("^" unary)?   (right-associative)
  function power(): Node {
    const base = atom();
    if (peek() === "^") {
      next();
      const e = unary();
      return (x, p) => Math.pow(base(x, p), e(x, p));
    }
    return base;
  }
  function atom(): Node {
    const t = next();
    if (t === undefined) throw new Error(`unexpected end of "${src}"`);
    if (t === "(") {
      const a = expr();
      if (next() !== ")") throw new Error(`missing ) in "${src}"`);
      return a;
    }
    if (/^[\d.]/.test(t)) {
      const v = Number(t);
      return () => v;
    }
    if (/^[a-zA-Z_]/.test(t)) {
      if (FUNCS[t] && peek() === "(") {
        const f = FUNCS[t];
        const a = atom();
        return (x, p) => f(a(x, p));
      }
      if (t === "x") return (x) => x;
      if (t === "pi") return () => Math.PI;
      if (t === "e") return () => Math.E;
      // A run of letters like "mx" is m times x.
      if (t.length > 1 && !(t in FUNCS)) {
        const parts = t.split("").map((c): Node => (c === "x" ? (x) => x : (_x, p) => p[c] ?? NaN));
        return (x, p) => parts.reduce((acc, f) => acc * f(x, p), 1);
      }
      return (_x, p) => p[t] ?? NaN;
    }
    throw new Error(`unexpected "${t}" in "${src}"`);
  }
  const root = expr();
  if (i !== (toks?.length ?? 0)) throw new Error(`couldn't read "${src}" past "${toks![i]}"`);
  return root;
}
