import { TrackedLink } from "../TrackedLink";
import { MegaNav } from "./MegaNav";

export function Logo({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <span className={`nb-logo nb-logo--${size}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/oakmont-mark.png" alt="" aria-hidden className="nb-logo-mark" />
      <span className="nb-logo-word">Oakmont Study Center</span>
    </span>
  );
}

// Sticky top bar. The hero's solid blue button is the page's one loud thing, so
// both account actions here are paper pills. The public pages off the
// homepage wear the same bar (see SiteHeader), with `home={false}`.
export function Nav({ home = true }: { home?: boolean }) {
  return (
    <nav className="nb-nav" aria-label="Main">
      <a href={home ? "#top" : "/"} className="nb-logo-link" aria-label={home ? "Oakmont Study Center, back to top" : "Oakmont Study Center home"}>
        <Logo />
      </a>
      <MegaNav home={home} />
      <div className="nb-nav-actions">
        <a href="/login" className="nb-btn">
          Log in
        </a>
        <TrackedLink href="/start" event="signup_started" className="nb-btn nb-btn--raised">
          Start free trial
        </TrackedLink>
      </div>
    </nav>
  );
}
