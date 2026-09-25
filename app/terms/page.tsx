import { LegalPageShell } from "@/components/LegalPageShell";
import { SUPPORT_EMAIL } from "@/components/LegalFooter";

export const metadata = { title: "Terms of Service — Oakmont Study Center" };

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" updated="September 24, 2026">
      <p>
        These terms cover your use of Oakmont Study Center (&ldquo;Oakmont,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), an
        online SAT preparation course. By creating an account or paying for access, you agree to them. If you&apos;re
        under 18, we&apos;d ask a parent or guardian to look these over with you.
      </p>

      <h2>1. What Oakmont is</h2>
      <p>
        Oakmont is a self-guided study tool: lessons and practice quizzes organized by official SAT subskill, a
        day-by-day plan, and space to log full-length practice tests. It&apos;s a study aid, not a guarantee —
        we don&apos;t promise any particular score, and the SAT is a trademark of the College Board, which doesn&apos;t
        endorse or sponsor Oakmont.
      </p>

      <h2>2. Your account</h2>
      <p>
        Keep your login private and use a real email address you check — it&apos;s how we&apos;d reach you about
        your account or billing. You&apos;re responsible for what happens under your account.
      </p>

      <h2>3. Plans &amp; billing</h2>
      <p>
        Every new account starts with a 7-day free trial with full access. No card is needed to start, and nothing
        is charged when it ends; to keep using Oakmont after that, choose one of two paid plans:
      </p>
      <ul>
        <li>
          <strong>Monthly ($25/month):</strong> renews automatically each month until you cancel. If you choose it
          during your free trial, your first charge is on the day the trial ends. Cancel anytime from Settings —
          access continues through the end of the period you already paid for.
        </li>
        <li>
          <strong>Full Course Access ($100 one time):</strong> a single payment that unlocks everything for 182
          days from the date you pay (or, if you buy during your free trial, from the day the trial ends). It does not renew or charge you again. It includes one free retake extension: in
          Settings, choose an upcoming official SAT date within six months of your access ending, and access extends
          through three days after that date. It can be claimed once, up to 90 days after the pass ends.
        </li>
      </ul>
      <p>All payments are processed by Stripe. We never see or store your card number.</p>

      <h2>4. Refunds</h2>
      <p>
        <strong>Full Course Access:</strong> if it&apos;s within 3 days of your purchase and you haven&apos;t
        gotten meaningfully into the material, email us and we&apos;ll refund it in full, no hassle. After that, or
        with heavier use, reach out anyway — we look at these individually rather than applying a hard rule.
      </p>
      <p>
        <strong>Monthly:</strong> the free trial exists so you can decide before anything is charged. Once a
        billing period is paid for, we don&apos;t refund it partway through, but canceling stops all future
        charges immediately.
      </p>
      <p>
        Either way, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we&apos;ll sort it out.
      </p>

      <h2>5. Letting a parent see your progress</h2>
      <p>
        From Settings, you can optionally generate an invite code (for a parent to make their own account) or a
        public link — either one shows a read-only view of your practice scores, subject mastery, and test
        history. This is entirely your choice: nothing is shared until you generate one of these, and turning it
        off in Settings revokes access right away.
      </p>

      <h2>6. Using Oakmont fairly</h2>
      <p>
        Your account is for your own studying. Please don&apos;t share logins to spread one paid account across
        multiple students, scrape or resell the content, or otherwise try to circumvent access controls.
      </p>

      <h2>7. Ending your access</h2>
      <p>
        You can stop using Oakmont and delete your account anytime by emailing us. We can also suspend or end an
        account that clearly violates these terms.
      </p>

      <h2>8. No guarantees</h2>
      <p>
        Oakmont is provided as-is. We work hard to keep it accurate and available, but we can&apos;t promise
        it&apos;ll be error-free or uninterrupted, and we&apos;re not liable for indirect damages arising from its
        use, to the extent the law allows us to limit that.
      </p>

      <h2>9. Changes</h2>
      <p>
        If we update these terms, we&apos;ll update the date at the top. Continuing to use Oakmont after a change
        means you accept the new version.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about any of this: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPageShell>
  );
}
