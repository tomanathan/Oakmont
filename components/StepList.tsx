/**
 * Curriculum walkthroughs and Desmos tricks are written as "Step 1: ... Step 2: ..."
 * prose so they read naturally as data, but shown as one dense paragraph they're a
 * wall of text — intimidating for a student who's already anxious about the test.
 * This splits that prose into a visually separated, numbered list instead. Text
 * without "Step N:" markers renders as a plain paragraph, unchanged.
 */
function splitSteps(text: string): string[] {
  const parts = text
    .split(/Step \d+:\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

export function StepList({ text, className = "" }: { text: string; className?: string }) {
  const steps = splitSteps(text);

  if (steps.length === 1) {
    return <p className={`leading-relaxed ${className}`}>{steps[0]}</p>;
  }

  return (
    <ol className={`space-y-2.5 ${className}`}>
      {steps.map((step, i) => (
        <li key={i} className="flex gap-2.5 leading-relaxed">
          <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-white border border-gray-300 text-gray-500 text-[10px] font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Pattern explanations are conceptual prose, not numbered steps, but many run
 * 400-900 characters as a single unbroken paragraph — also a wall of text.
 * Every explanation in this codebase opens with one sentence stating what the
 * pattern is, then continues into the method — so splitting off that lead
 * sentence into its own short paragraph gives a nervous reader a place to get
 * oriented before committing to the denser part. Short text is left alone.
 */
function splitLeadSentence(text: string): [string, string] | null {
  if (text.length < 350) return null;
  const match = text.match(/^(.+?[.!?])\s+(?=[A-Z(])/);
  if (!match) return null;
  const lead = match[1];
  const rest = text.slice(match[0].length).trim();
  if (lead.length < 30 || rest.length < 80) return null;
  return [lead, rest];
}

export function ProseText({ text, className = "" }: { text: string; className?: string }) {
  const split = splitLeadSentence(text);
  if (!split) {
    return <p className={`leading-relaxed ${className}`}>{text}</p>;
  }
  const [lead, rest] = split;
  return (
    <div className={className}>
      <p className="leading-relaxed font-medium mb-2.5">{lead}</p>
      <p className="leading-relaxed">{rest}</p>
    </div>
  );
}
