import { ALL_SUBSKILLS } from "@/data/curriculum";

// Every official subskill, grouped the way the dashboard groups them and
// counted from the same curriculum data the app studies from.
function groupedByDomain() {
  const sections: Record<string, Record<string, number>> = {};
  for (const s of ALL_SUBSKILLS) {
    sections[s.section] ??= {};
    sections[s.section][s.domain] = (sections[s.section][s.domain] ?? 0) + 1;
  }
  return sections;
}

export function SubskillMap() {
  const sections = groupedByDomain();
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Object.entries(sections).map(([section, domains]) => {
        const total = Object.values(domains).reduce((a, b) => a + b, 0);
        return (
          <div key={section}>
            <div className="mb-2 flex items-baseline justify-between border-b border-[#ece9f7] pb-2">
              <div className="text-sm font-semibold">{section}</div>
              <div className="text-xs tabular-nums text-gray-400">{total} subskills</div>
            </div>
            <ul className="flex flex-col">
              {Object.entries(domains).map(([domain, count]) => (
                <li key={domain} className="flex items-center justify-between py-1.5 text-[13px]">
                  <span className="text-gray-600">{domain}</span>
                  <span className="min-w-[26px] rounded-full bg-[#f3f2fc] px-2 py-0.5 text-center text-xs font-semibold tabular-nums text-[#4a5bb0]">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
