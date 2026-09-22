// TODO before launch: swap the monogram below for a real photo, and this
// bio for Aman's own words (2-3 sentences) -- see the plan's "Before
// launch" checklist. Kept as a plain, honest placeholder rather than
// inventing quotes or specifics that aren't real.
export function TutorSection() {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="max-w-[640px] mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div
          className="w-20 h-20 rounded-full bg-ink text-white font-display font-semibold text-2xl flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          A
        </div>
        <div>
          <div className="font-display font-semibold text-[18px] text-ink mb-0.5">Meet your tutor</div>
          <div className="text-xs text-gray-400 mb-3">Aman · Founder, Oakmont Study Center · 6 years tutoring the SAT</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            I built Oakmont around the same week-by-week plan I&apos;ve used with tutoring students for six years —
            every official subskill, in the order that actually moves a score, not a generic syllabus. This is that
            structure, available without an hourly rate.
          </p>
        </div>
      </div>
    </section>
  );
}
