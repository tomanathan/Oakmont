// Plain data, deliberately its own module (not exported from
// components/landing/Faq.tsx, which is a "use client" component) --
// importing a value from a client-boundary module into a server component
// doesn't give you the real array, it gives you an opaque client
// reference, which breaks the very first thing LandingPage.tsx needs to do
// with it (map over it to build the FAQPage JSON-LD server-side).
export const FAQ_ITEMS = [
  {
    q: "Is this for the digital SAT?",
    a: "Yes. It follows the current digital format: two modules per section, with difficulty that adapts as you go.",
  },
  {
    q: "How is this different from Khan Academy?",
    a: "Khan Academy offers free practice. Oakmont is a complete week-by-week plan built around your test date and your student's weak spots, with every question explained.",
  },
  {
    q: "How long does it take?",
    a: "Six months is ideal. If the test is sooner, the plan moves faster and still covers every skill.",
  },
  {
    q: "What do parents get?",
    a: "A free dashboard with every session, skill and practice score, plus a Sunday email. Your student adds your email when they sign up.",
  },
  {
    q: "What if my student needs to retake?",
    a: "The 6-month pass covers one retake at no extra cost: choose the new test date in Settings. On the monthly plan, simply keep your subscription.",
  },
  {
    q: "Is there a free trial? Can I cancel?",
    a: "The monthly plan starts with a 7-day free trial, and you can cancel anytime in Settings. The 6-month pass is a single payment with nothing to cancel.",
  },
];
