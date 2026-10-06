// The kinds of feedback a student can leave (components/FeedbackTab.tsx),
// shared with the API and the admin page.
export const FEEDBACK_KINDS = [
  { id: "bug", label: "Something's broken", prompt: "What happened, and what did you expect instead?" },
  { id: "confusing", label: "Something's confusing", prompt: "What was hard to follow?" },
  { id: "idea", label: "I have an idea", prompt: "What would make Oakmont better for you?" },
  { id: "praise", label: "I like this", prompt: "What's working well for you?" },
] as const;

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]["id"] | "other";
export const FEEDBACK_MAX = 2000;
export const kindLabel = (id: string) => FEEDBACK_KINDS.find((k) => k.id === id)?.label ?? "Other";
