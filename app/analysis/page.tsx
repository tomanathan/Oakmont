import { redirect } from "next/navigation";

// Practice exam analysis now lives on the /plan page (see app/plan/page.tsx)
// -- the whole point of the merge was for the schedule below it to react
// to the scores logged above it, which only makes sense as one page. This
// route stays as a redirect, not a 404, for anyone with an old bookmark or
// a stale link to it (including a couple of in-app ones this same change
// missed updating).
export default function AnalysisPage() {
  redirect("/plan#practice-tests");
}
