// The homepage's one accent: a highlighter swipe behind the words that
// matter most in a heading, like a student marking up their notes.
export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="-mx-1 box-decoration-clone bg-[linear-gradient(180deg,transparent_58%,#ffd15c_58%,#ffd15c_90%,transparent_90%)] px-1">
      {children}
    </span>
  );
}
