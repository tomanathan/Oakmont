import { LegalPageShell } from "@/components/LegalPageShell";
import { SUPPORT_EMAIL } from "@/components/LegalFooter";

export const metadata = {
  title: "Privacy Policy — Oakmont Study Center",
  description: "What Oakmont Study Center collects, why, who it's shared with, and what a connected parent can see.",
  alternates: { canonical: "https://oakmontsat.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="November 12, 2026">
      <p>
        This describes what Oakmont Study Center collects, why, and who it&apos;s shared with. The short version:
        we collect what's needed to run your study plan and nothing more, we never see your card number, and
        nothing about your progress is visible to anyone else unless you explicitly choose to share it with a
        parent.
      </p>

      <h2>1. What we collect</h2>
      <p>When you use Oakmont, we store:</p>
      <ul>
        <li>
          Your first name, your email address, and a securely hashed password (we never store the password
          itself). If you sign in with Google, we store the Google account identifier that tells us it&apos;s you.
        </li>
        <li>
          Study data: quiz answers and scores, which lessons and subskills you&apos;ve worked on and when, your
          target test date and goal score, practice-test results you log, and your daily study streak. For each
          practice question you answer, we also store how long you took and how confident you said you were.
        </li>
        <li>
          Your time zone, as your browser reports it, so that your study days, streak and plan turn over at your
          own midnight.
        </li>
        <li>
          If a student connects a parent, the parent&apos;s email address. A parent account also stores the
          parent&apos;s time zone, so the days in their reports match their own clock.
        </li>
        <li>A couple of small cosmetic settings, like which Ozho costume you&apos;ve equipped.</li>
        <li>
          How you found us: the link or site that brought you to Oakmont on your first visit, such as a search
          engine or a friend&apos;s invite link. It is kept in a cookie in your browser until you create an
          account, and then saved with the account.
        </li>
      </ul>
      <p>We don&apos;t track you across other sites, and we don&apos;t sell any of this to anyone.</p>

      <h2>2. Payment information</h2>
      <p>
        Payments are handled entirely by Stripe. When you subscribe or buy a pass, Stripe processes your card
        directly — Oakmont&apos;s own servers never receive or store your card number. We keep only a Stripe
        customer ID and your plan status (active, trial, canceled, etc.) so we know your account has access.
      </p>

      <h2>3. Sharing your progress with a parent</h2>
      <p>
        A student and a parent can connect their accounts, and either one can start it. A student can add a
        parent&apos;s email address (while signing up or later in Settings), or share an invite code or a link.
        A parent with their own account can send the student an invite link, and the two are connected when the
        student uses it.
      </p>
      <p>
        A connected parent sees a report of the student&apos;s studying: each study session (when it was, how
        long it lasted, and what was covered), progress on every skill, accuracy, whether the plan is on pace,
        mistakes that repeat, the confidence the student reports on their answers, and practice-test scores. The
        parent also gets a weekly email summary.
      </p>
      <p>
        Either one can remove the connection: a student from Settings, a parent from their own dashboard. A
        student can also turn off the shareable link in Settings, which stops it working right away. Because that
        link doesn&apos;t require logging in, treat it like a password — anyone who has the link can see the
        report behind it.
      </p>
      <p>
        Students can also invite friends with a personal invite link. If you sign up through a friend&apos;s
        link, that friend sees your first name and that you joined, and whether your studying has earned them a
        free month. They don&apos;t see anything else about your account.
      </p>

      <h2>4. Who else sees data, and why</h2>
      <ul>
        <li><strong>Stripe</strong> — processes payments (see above).</li>
        <li>
          <strong>Google</strong> — only if you choose to sign in with Google. Google confirms who you are and
          gives us your email address, first name, and Google account identifier.
        </li>
        <li>
          <strong>Resend</strong> — sends our email: account emails (password resets and parent setup links),
          daily study emails to students and connected parents, a weekly report to connected parents on Sundays,
          and a reminder before the free trial ends. The daily emails can be turned off in your account&apos;s
          settings or with the unsubscribe link in each one.
        </li>
        <li>
          <strong>Supabase and Vercel</strong> — host our database and the app itself. They store data on our
          behalf; they don&apos;t use it for anything of their own. We also use Vercel Analytics to count page
          views.
        </li>
      </ul>
      <p>We don&apos;t share your data with advertisers, and there are no ads in Oakmont.</p>

      <h2>5. How long we keep it</h2>
      <p>
        We keep your data as long as your account is active. Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
        to delete your account, and we&apos;ll remove your data within 30 days, aside from payment records Stripe
        or tax law requires us to retain.
      </p>

      <h2>6. Kids &amp; teenagers</h2>
      <p>
        Oakmont is built for students preparing for the SAT — typically high schoolers — and isn&apos;t
        intended for children under 13. If you believe a child under 13 has created an account, contact us and
        we&apos;ll delete it.
      </p>

      <h2>7. Security</h2>
      <p>
        Passwords are hashed, not stored in plain text, and the app is served over HTTPS. No system is perfectly
        secure, but we take reasonable, standard precautions with what we store.
      </p>

      <h2>8. Changes</h2>
      <p>If this policy changes, we&apos;ll update the date at the top of this page.</p>

      <h2>9. Contact</h2>
      <p>
        Questions about your data: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPageShell>
  );
}
