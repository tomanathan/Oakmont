import type { PracticeQuestion } from "@/lib/skillPreview";

// Structured data for search engines, emitted the way the homepage does it
// (components/landing/LandingPage.tsx), plus one guard: every "<" is written
// as <, so no question text (math is full of "<" and ">") can ever
// close the script tag early. JSON parsers read < back as "<".
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  // eslint-disable-next-line react/no-danger
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

// Question text in the bank is plain text: its math is ordinary characters
// (√, ², "a/b"), typeset only when the page renders it. The practice-problem
// fields declare text/html, so the three characters HTML treats specially
// are written as entities and everything else goes through as it is.
function html(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * The page's practice questions as a schema.org Quiz, in the shape Google
 * documents for practice problems: each question with its wrong choices as
 * suggestedAnswer and its right one as acceptedAnswer, each carrying the
 * explanation the page shows once that choice is picked.
 */
export function quizJsonLd({
  skill,
  section,
  url,
  questions,
}: {
  skill: string;
  section: string;
  url: string;
  questions: PracticeQuestion[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `SAT ${skill} practice questions`,
    url,
    about: { "@type": "Thing", name: `SAT ${skill}` },
    educationalAlignment: [
      {
        "@type": "AlignmentObject",
        alignmentType: "educationalSubject",
        targetName: `SAT ${section}`,
      },
    ],
    hasPart: questions.map((q) => ({
      "@type": "Question",
      eduQuestionType: "Multiple choice",
      learningResourceType: "Practice problem",
      encodingFormat: "text/html",
      text: html(q.q),
      suggestedAnswer: q.choices
        .map((choice, i) => ({ choice, i }))
        .filter(({ i }) => i !== q.answer)
        .map(({ choice, i }) => ({
          "@type": "Answer",
          position: i,
          encodingFormat: "text/html",
          text: html(choice),
          comment: { "@type": "Comment", text: html(q.why?.[i] ?? q.explain) },
        })),
      acceptedAnswer: {
        "@type": "Answer",
        position: q.answer,
        encodingFormat: "text/html",
        text: html(q.choices[q.answer]),
        comment: { "@type": "Comment", text: html(q.explain) },
        answerExplanation: { "@type": "Comment", text: html(q.explain) },
      },
    })),
  };
}
