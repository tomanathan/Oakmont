import { MathText } from "./MathText";

/**
 * Underlines one exact substring of `text` -- the tested word in a Words in
 * Context question, or the specific sentence a text-structure question is
 * asking about (both via `highlight`) -- so the student sees it highlighted
 * directly in the passage instead of having to relocate it, matching how
 * the real exam marks it. Falls back to a plain MathText render when
 * there's nothing to highlight, or it can't be found verbatim.
 */
export function HighlightedText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <MathText text={text} />;
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return <MathText text={text} />;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      <MathText text={before} />
      <u className="decoration-2 decoration-accent underline-offset-2">{match}</u>
      <MathText text={after} />
    </>
  );
}

// Matches a leading "Passage 1:", "Passage 2 (a historian):" etc. at the
// start of a paragraph -- see PassageText below.
const PASSAGE_LABEL_RE = /^(Passage \d+(?:\s*\([^)]+\))?)\s*:\s*/i;

/**
 * Renders a question's full text, splitting on blank lines (`\n\n`) into
 * real, visually separated paragraphs instead of one dense run-on block --
 * and, when a paragraph starts with "Passage 1:"/"Passage 2:" (Cross-Text
 * Connections), pulling that label out into its own small heading above a
 * distinctly boxed passage, so each passage and the question itself read as
 * clearly separate pieces rather than one blob of text. Single-paragraph
 * text (the vast majority of questions) renders exactly as before, with
 * `number` (if given) inline as "1. " -- multi-paragraph text moves that
 * same number to a small heading above the stacked paragraphs instead,
 * since there's no longer one single line to prefix it onto.
 */
export function PassageText({
  text,
  highlight,
  number,
}: {
  text: string;
  highlight?: string;
  number?: number;
}) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  if (paragraphs.length <= 1) {
    return (
      <p className="leading-relaxed">
        {number !== undefined && `${number}. `}
        <HighlightedText text={text} highlight={highlight} />
      </p>
    );
  }

  return (
    <div>
      {number !== undefined && (
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Question {number}
        </div>
      )}
      <div className="flex flex-col gap-3">
        {paragraphs.map((para, i) => {
          const m = para.match(PASSAGE_LABEL_RE);
          if (m) {
            const label = m[1];
            const body = para.slice(m[0].length);
            return (
              <div key={i} className="bg-[#f8f8fb] border border-[#ece9f7] rounded-lg px-3.5 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                  {label}
                </div>
                <p className="leading-relaxed">
                  <HighlightedText text={body} highlight={highlight} />
                </p>
              </div>
            );
          }
          return (
            <p key={i} className="leading-relaxed font-medium whitespace-pre-line">
              <HighlightedText text={para} highlight={highlight} />
            </p>
          );
        })}
      </div>
    </div>
  );
}
