"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/landingFaq";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-16 sm:py-20 bg-white border-y border-[#ece9f7]">
      <div className="max-w-[640px] mx-auto">
        <h2 className="font-display font-semibold text-[26px] sm:text-[30px] text-ink text-center mb-8">
          Frequently asked
        </h2>
        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q} className="border border-[#ece9f7] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-ink hover:bg-[#faf8f4] transition-colors"
                  aria-expanded={open}
                >
                  {item.q}
                  <span className="text-gray-400 flex-shrink-0">{open ? "−" : "+"}</span>
                </button>
                {open && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
