"use client";

import { useEffect, useState } from "react";
import { localDay, utcDayDiff } from "@/lib/dateOnly";

// The page is built once a day, so a tab left open (or a copy cached since
// yesterday) can show yesterday's count. The server's number is shown
// first; this recounts from today on the US East Coast, the same "today"
// the server uses, when the page loads and whenever the tab comes back.
export function DaysAway({ date, initial, unit }: { date: string; initial: number; unit: "days" | "weeks" }) {
  const [days, setDays] = useState(initial);

  useEffect(() => {
    const recount = () => setDays(utcDayDiff(localDay(new Date(), "America/New_York"), `${date}T00:00:00Z`));
    recount();
    const onVisible = () => document.visibilityState === "visible" && recount();
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(recount, 10 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [date]);

  if (unit === "weeks") {
    const weeks = Math.floor(days / 7);
    if (days <= 0) return null;
    return <>{weeks === 0 ? "under 1 week" : `${weeks} ${weeks === 1 ? "week" : "weeks"}`}</>;
  }
  return <>{days <= 0 ? "Today" : `${days} ${days === 1 ? "day" : "days"}`}</>;
}
