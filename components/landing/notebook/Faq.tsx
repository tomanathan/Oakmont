import { FAQ_ITEMS } from "@/lib/landingFaq";
import { SUPPORT_EMAIL } from "@/lib/support";
import { Scribble } from "./art";

// Native <details> disclosures: keyboard and screen-reader support for
// free, and no client JS. The first answer starts open.
export function Faq() {
  return (
    <section className="nb-sec nb-faq" id="faq" aria-labelledby="nb-faq-h">
      <div className="nb-faq-side">
        <div className="nb-sec-head">
          <h2 id="nb-faq-h" className="nb-h2 nb-h2--md">
            Frequently asked questions
          </h2>
          <Scribble w={220} className="nb-scribble" />
        </div>
        <p className="nb-body">
          Have another question?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="nb-inline-link">
            Email us
          </a>
          .
        </p>
      </div>
      <div className="nb-faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <details key={item.q} className="nb-qa" open={i === 0}>
            <summary>
              <span>{item.q}</span>
              <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden className="nb-qa-plus">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
