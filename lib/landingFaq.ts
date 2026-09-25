// Plain data, deliberately its own module (not exported from
// components/landing/Faq.tsx, which is a "use client" component) --
// importing a value from a client-boundary module into a server component
// doesn't give you the real array, it gives you an opaque client
// reference, which breaks the very first thing LandingPage.tsx needs to do
// with it (map over it to build the FAQPage JSON-LD server-side).
export const FAQ_ITEMS = [
  {
    q: "Is this for the digital SAT?",
    a: "Yes. It matches the current test: two modules per section, adaptive difficulty.",
  },
  {
    q: "How is this different from Khan Academy?",
    a: "Khan Academy is a free question bank. Oakmont is a week-by-week plan built around your test date and your weak spots, with every question explained.",
  },
  {
    q: "How long does it take?",
    a: "Six months is ideal. A sooner test just means a faster pace; every skill is still covered.",
  },
  {
    q: "What do parents get?",
    a: "A free dashboard with every session, skill and practice score, plus a Sunday email. Your student adds your email when they sign up.",
  },
  {
    q: "What if my student needs to retake?",
    a: "The 6-month pass covers one retake free: pick the new date in Settings. On monthly, just keep going.",
  },
  {
    q: "Is there a free trial? Can I cancel?",
    a: "Monthly starts with a 7-day free trial and cancels anytime in Settings. The 6-month pass is one payment and simply runs out.",
  },
];
