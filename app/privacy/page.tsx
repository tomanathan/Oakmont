import { LegalPageShell } from "@/components/LegalPageShell";
import { SUPPORT_EMAIL } from "@/components/LegalFooter";

export const metadata = { title: "Privacy Policy — Oakmont Study Center" };

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="September 22, 2026">
      <p>
        This describes what Oakmont Study Center collects, why, and who it&apos;s shared with. The short version:
        we collect what's needed to run your study plan and nothing more, we never see your card number, and
        nothing about your progress is visible to anyone else unless you explicitly choose to share it with a
        parent.
      </p>

      <h2>1. What we collect</h2>
      <p>When you use Oakmont, we store:</p>
      <ul>
        <li>Your email address and a securely hashed password (we never store the password itself).</li>
        <li>
          Study data: quiz answers and scores, which subskills you&apos;ve practiced, your target test date and
          goal score, practice-test results you log, and your daily study streak.
        </li>
        <li>A couple of small cosmetic settings, like which Ozho costume you&apos;ve equipped.</li>
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
        From Settings, a student can optionally generate a parent invite code or a public share link. If you do,
        whoever has that code or link can view a read-only summary of your practice scores, subject mastery, and
        test history. This is off by default, entirely your choice, and can be turned off at any time from
        Settings, which immediately revokes access. Because the public link doesn&apos;t require logging in,
        treat it like a password — anyone who has the link can see the data behind it.
      </p>

      <h2>4. Who else sees data, and why</h2>
      <ul>
        <li><strong>Stripe</strong> — processes payments (see above).</li>
        <li>
          <strong>Resend</strong> — sends the occasional study-streak email, only if that feature is enabled on
          your account.
        </li>
        <li>
          <strong>Supabase and Vercel</strong> — host our database and the app itself. They store data on our
          behalf; they don&apos;t use it for anything of their own.
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
