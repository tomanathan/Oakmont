"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/landingFaq";
import { SUPPORT_EMAIL } from "@/components/LegalFooter";
import { NapPet } from "./SectionPets";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-ivory px-6 py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] text-forest-900 sm:text-[42px]">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-sm text-gray-500">
            Have another question?{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-ink underline decoration-sage/60 underline-offset-4 hover:decoration-forest">
              Email us
            </a>
            .
          </p>
          <NapPet className="mt-8 md:mt-12" />
        </div>
        <div className="divide-y divide-sage/25 border-y border-sage/30">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-medium"
                  aria-expanded={open}
                >
                  {item.q}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[560px] pb-5 text-sm leading-relaxed text-gray-600">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
