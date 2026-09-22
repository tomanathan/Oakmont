"use client";

import { motion, useReducedMotion } from "motion/react";
import { ALL_SUBSKILLS } from "@/data/curriculum";

// "We cover everything," made concrete -- every one of the 29 official
// subskills, grouped the way the real dashboard groups them, computed from
// the same curriculum data the app itself studies from (never a separately
// maintained count that could drift out of sync).
function groupedByDomain() {
  const sections: Record<string, Record<string, number>> = {};
  for (const s of ALL_SUBSKILLS) {
    sections[s.section] ??= {};
    sections[s.section][s.domain] = (sections[s.section][s.domain] ?? 0) + 1;
  }
  return sections;
}

// Functions of reduceMotion (not module-level constants) so the reduced-
// motion case collapses stagger/duration to 0 -- but `initial`/`variants`
// themselves stay unconditionally present on every render (see Reveal.tsx's
// comment on why: conditioning whether `initial` is set at all, rather than
// just its transition durations, is what causes a server/client hydration
// mismatch the moment a real browser has reduced-motion already on).
function containerVariants(reduceMotion: boolean) {
  return { hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } } };
}
function cardVariants(reduceMotion: boolean) {
  return {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.4, ease: [0.34, 0.56, 0.64, 1] as const } },
  };
}

export function SubskillMap() {
  const sections = groupedByDomain();
  const total = ALL_SUBSKILLS.length;
  const reduceMotion = !!useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[720px] mx-auto"
      variants={containerVariants(reduceMotion)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {Object.entries(sections).map(([section, domains]) => {
        const sectionTotal = Object.values(domains).reduce((a, b) => a + b, 0);
        return (
          <motion.div
            key={section}
            variants={cardVariants(reduceMotion)}
            className="bg-white border border-[#ece9f7] rounded-xl p-5"
          >
            <div className="flex items-baseline justify-between mb-3">
              <div className="font-display font-semibold text-[15px] text-ink">{section}</div>
              <div className="text-xs text-gray-400">{sectionTotal} subskills</div>
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(domains).map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{domain}</span>
                  <span className="text-xs font-semibold text-[#4a5bb0] bg-[#f0eff9] rounded-full px-2 py-0.5">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
      <div className="sm:col-span-2 text-center text-xs text-gray-400 mt-1">
        {total} official subskills, covered in full — nothing skipped.
      </div>
    </motion.div>
  );
}
