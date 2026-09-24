// TODO before launch: swap the monogram for a real photo, and the note for
// Aman's own words. Kept as an honest placeholder -- no invented quotes.
export function TutorSection() {
  return (
    <section className="bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1120px] items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">Who&apos;s behind it</div>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
            Built by a tutor, not a test-prep factory.
          </h2>
        </div>
        <figure className="rounded-2xl border border-[#ece9f7] bg-[#faf8f4] p-7 sm:p-9">
          <blockquote className="font-display text-[19px] leading-[1.55] sm:text-[21px]">
            I built Oakmont around the same week-by-week plan I&apos;ve used with my tutoring students for six years —
            every skill the SAT tests, in the order that actually moves a score. This is that structure, without the
            hourly rate.
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-ink font-display text-[17px] font-semibold text-white"
              aria-hidden="true"
            >
              A
            </div>
            <div>
              <div className="text-sm font-semibold">Aman</div>
              <div className="text-xs text-gray-500">Founder · 6 years tutoring the SAT</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
