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
    a: "Khan Academy is a free, general question bank. Oakmont is a structured week-by-week plan built by a tutor. It tells your student exactly what to study each week based on their test date and their actual weak spots, and explains every question step by step.",
  },
  {
    q: "How long does it take? What if the test is soon?",
    a: "We recommend about six months: enough time to learn all 29 skills, review them, and take all 8 practice tests without cramming. If the test is sooner, enter the date and the plan fits every skill into the weeks that are left, at a faster pace, with practice tests in the final weeks.",
  },
  {
    q: "What can parents see, and does it cost extra?",
    a: "Parent accounts are free. The dashboard updates every time your student practices: every study session (when, how long, what was covered), progress on all 29 skills, practice test scores against the goal, and mistakes that keep repeating. A summary email arrives every Sunday. One parent account can follow more than one student.",
  },
  {
    q: "How do I connect to my student's account?",
    a: "When your student signs up, they choose parent supervision and enter your email. You'll get an email to set a password, and their report is waiting. If you'd rather start yourself, create a parent account and send them an invite link, or enter the code from their Settings.",
  },
  {
    q: "Is there a free trial? Can I cancel?",
    a: "The monthly plan includes a 7-day free trial, and your card isn't charged until it ends. Cancel anytime from Settings; the monthly plan stops billing going forward, and the one-time 1-year pass simply runs until it expires.",
  },
];
