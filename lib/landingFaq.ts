// Plain data, deliberately its own module (not exported from
// components/landing/Faq.tsx, which is a "use client" component) --
// importing a value from a client-boundary module into a server component
// doesn't give you the real array, it gives you an opaque client
// reference, which breaks the very first thing LandingPage.tsx needs to do
// with it (map over it to build the FAQPage JSON-LD server-side).
export const FAQ_ITEMS = [
  {
    q: "Is this for the digital SAT?",
    a: "Yes. Every lesson and question is built for the current digital SAT format (two modules per section, adaptive difficulty), not the old paper test.",
  },
  {
    q: "How is this different from Khan Academy?",
    a: "Khan Academy is a free, general question bank. Oakmont is a structured week-by-week plan built by a tutor — it tells you exactly what to study each week based on your test date and your actual weak spots, with a pattern-based explanation for every question.",
  },
  {
    q: "How long does it take?",
    a: "The full plan is 6 months, but it automatically compresses to fit whatever time is actually left before your test date — see the test-date picker above.",
  },
  {
    q: "What if my test is in 6 weeks?",
    a: "The plan condenses to your actual timeline instead of assuming a full 6 months, covering every subskill at a faster pace rather than skipping any.",
  },
  {
    q: "What can parents see?",
    a: "A detailed report: every study session (when, how long, what was covered), questions answered and accuracy week by week, progress on all 29 skills, whether mastered skills are sticking, confidence and pace habits, mistakes that keep repeating, and practice test scores against the goal. A summary email arrives every Sunday.",
  },
  {
    q: "How up to date is the parent dashboard?",
    a: "It updates every time your student practices: each lesson, quiz, review and logged practice test shows up right away, and the Sunday email sums up the week.",
  },
  {
    q: "Do parents need to pay or have their own plan?",
    a: "No. Parent accounts are free. The parent dashboard and weekly email are included with your student's plan, and one parent account can follow more than one student.",
  },
  {
    q: "How do I connect to my student's account?",
    a: "The easiest way: when your student signs up, they choose parent supervision and enter your email. You'll get an email to set a password, and their report is waiting. If you'd rather start yourself, create a parent account and send them an invite link to approve, or enter the code from their Settings.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, anytime, from Settings. The monthly plan stops billing immediately going forward; the one-time 6-month pass simply runs until it expires.",
  },
  {
    q: "Is there a free trial?",
    a: "The monthly plan includes a 7-day free trial — your card isn't charged until it ends. You can also try a real question above with no account at all.",
  },
];
