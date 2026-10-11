import { TrackedLink } from "../TrackedLink";

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
// both account actions here are paper pills.
export function Nav() {
  return (
    <nav className="nb-nav" aria-label="Main">
      <a href="#top" className="nb-logo-link" aria-label="Oakmont Study Center, back to top">
        <Logo />
      </a>
      <div className="nb-navlinks">
        <a href="#parents" className="nb-navlink">
          For parents
        </a>
        <a href="#pricing" className="nb-navlink">
          Pricing
        </a>
        <a href="#faq" className="nb-navlink">
          FAQ
        </a>
      </div>
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
