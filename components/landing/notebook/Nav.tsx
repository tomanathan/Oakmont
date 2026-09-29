import { PixelDog } from "@/components/PixelDog";
import { TrackedLink } from "../TrackedLink";

export function Logo({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <span className={`nb-logo nb-logo--${size}`}>
      <span className="nb-logo-face" aria-hidden>
        <PixelDog size={46} mood="happy" costume="sunglasses" shadow={false} />
      </span>
      <span className="nb-logo-word">Oakmont</span>
    </span>
  );
}

// Sticky top bar. The hero's pink button is the page's one loud thing, so
// both account actions here are paper pills.
export function Nav() {
  return (
    <nav className="nb-nav" aria-label="Main">
      <a href="#top" className="nb-logo-link" aria-label="Oakmont, back to top">
        <Logo />
      </a>
      <div className="nb-navlinks">
        <a href="#how" className="nb-navlink">
          How it works
        </a>
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
          Start free
        </TrackedLink>
      </div>
    </nav>
  );
}
