import Link from "next/link";
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
  // Where the homepage's sections are, from here (as in MegaNav).
  const at = home ? "" : "/";
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
      {/* Phones and tablets, where the menus are hidden: the section links
          as a plain second row. Styles: .nb-navrow in notebook.css. */}
      <div className="nb-navrow">
        <Link href={`${at}#pricing`} className="nb-navlink">
          Pricing
        </Link>
        <Link href={`${at}#faq`} className="nb-navlink">
          FAQ
        </Link>
        <Link href={`${at}#parents`} className="nb-navlink">
          For parents
        </Link>
      </div>
    </nav>
  );
}
