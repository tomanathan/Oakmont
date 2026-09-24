import { MathText } from "./MathText";

// Feedback for one wrong choice: why the choice the student picked is
// wrong, and the trap behind it when there is one. Only ever about the
// choice they actually picked.
export function WhyWrong({
  letter,
  note,
  trap,
  children,
}: {
  letter: string;
  note: string | null | undefined;
  trap?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-3 rounded-lg border border-[#f0d0d0] bg-[#fdf6f6] px-3.5 py-3">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#b23b3b]">
        {note ? `Why ${letter} is wrong` : `${letter} isn't the answer`}
      </div>
      {note && (
        <div className="text-[13px] leading-relaxed text-[#5a2a2a]">
          <MathText text={note} />
        </div>
      )}
      {trap && (
        <div className="mt-2 text-[12.5px] leading-relaxed text-[#6b3a14]">
          <span className="font-semibold text-[#b4541a]">The trap: </span>
          {trap}
        </div>
      )}
      {children}
    </div>
  );
}

// The whole explanation of the right answer, folded away under a miss so
// the reason for their own choice reads first.
export function FullExplanation({ letter, text }: { letter: string; text: string }) {
  return (
    <details className="group mt-2.5">
      <summary className="cursor-pointer list-none text-[12.5px] font-semibold text-[#4a5bb0] hover:underline">
        <span className="group-open:hidden">Why {letter} is right &rarr;</span>
        <span className="hidden group-open:inline">Why {letter} is right</span>
      </summary>
      <div className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
        <MathText text={text} />
      </div>
    </details>
  );
}
