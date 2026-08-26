import katex from "katex";
import { splitMathSegments } from "@/lib/mathText";

/**
 * Renders text with any embedded math notation (fractions, √, ², ³, ±)
 * typeset properly via KaTeX — e.g. a fraction shows as a real horizontal
 * bar with a stacked numerator/denominator, the way it appears on the exam,
 * instead of "a/b" as plain characters. Everything else renders as normal
 * text, unchanged.
 */
export function MathText({ text }: { text: string }) {
  const segments = splitMathSegments(text);

  // Skip the KaTeX wrapper entirely when there's nothing to typeset --
  // keeps the common case (no math) as cheap as a plain string render.
  if (segments.length === 1 && segments[0].type === "text") {
    return <>{text}</>;
  }

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <span key={i}>{seg.content}</span>;
        const html = katex.renderToString(seg.content, {
          throwOnError: false,
          output: "html",
        });
        return <span key={i} className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </>
  );
}
