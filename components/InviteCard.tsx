"use client";

import { useId } from "react";
import type { ReferralSummary } from "@/lib/referral";
import { TRIAL_DAYS } from "@/lib/subscription";
import { PenTick, seedOf } from "./paper/Pencil";
import { useInviteShare } from "./useInviteShare";

// Invite a friend (lib/referral.ts), in two looks: the full card in
// Settings, with the link and how the student's invites are going, and a
// slim strip on the dashboard. InviteNudge is the one line under a passed
// quiz. All three share and copy through useInviteShare.

const MANUAL_HINT = "Couldn't copy in this browser. The link is selected so you can copy it yourself.";

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * A button whose label turns to "Copied" with a green tick drawn on its
 * corner. Both labels share one grid cell so the button keeps its width.
 */
function CopyButton({ label, copied, seed, onClick, className }: { label: string; copied: boolean; seed: number; onClick: () => void; className: string }) {
  return (
    <button type="button" onClick={onClick} className={`relative ${className}`}>
      <span className="inline-grid">
        <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>{label}</span>
        <span className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>Copied</span>
      </span>
      <PenTick show={copied} seed={seed} className="-right-3 -top-3.5 h-[24px] w-[28px]" />
    </button>
  );
}

/** Says "Link copied" to screen readers, or shows the copy-it-yourself hint. */
function CopyStatus({ copied, manual, className = "" }: { copied: boolean; manual: boolean; className?: string }) {
  return (
    <p aria-live="polite" className={manual ? `text-xs text-stone-500 ${className}` : "sr-only"}>
      {manual ? MANUAL_HINT : copied ? "Link copied." : ""}
    </p>
  );
}

const FIELD = "min-w-0 rounded-lg border border-[#b4c5e6] bg-[#eef3fb] px-3 font-mono text-xs text-ink focus:border-[#4a67a6] focus:outline-none";

type InviteCardProps =
  | {
      variant: "full";
      summary: ReferralSummary;
      // Days a friend has to study before the inviter's month arrives.
      studyDays: number;
    }
  | {
      variant: "compact";
      summary: Pick<ReferralSummary, "url" | "joined">;
    };

export function InviteCard(props: InviteCardProps) {
  return props.variant === "full" ? <FullCard summary={props.summary} studyDays={props.studyDays} /> : <CompactStrip summary={props.summary} />;
}

function FullCard({ summary, studyDays }: { summary: ReferralSummary; studyDays: number }) {
  const { canShare, copied, manual, fieldRef, copy, share } = useInviteShare(summary.url);
  const fieldId = useId();
  const seed = seedOf(summary.url);
  const { joined, monthsEarned, maxMonths, friends } = summary;
  const allEarned = monthsEarned >= maxMonths;

  return (
    <div className="bg-white border border-[#c9d6ee] rounded-xl p-6 mb-6">
      <div className="text-[15px] font-semibold text-ink mb-1">Invite a friend</div>
      <p className="text-xs leading-relaxed text-stone-500 mb-4">
        {allEarned
          ? `You've earned all ${maxMonths} free months from invites. Friends who sign up with your link still get their free month on top of the ${TRIAL_DAYS} free days.`
          : `A friend who signs up with your link gets a free month on top of the ${TRIAL_DAYS} free days. Once they've studied on ${studyDays} different days, you get a free month too, up to ${maxMonths} in all.`}
      </p>

      <label htmlFor={fieldId} className="block text-sm text-stone-700 mb-1">
        Your invite link
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={fieldId}
          ref={fieldRef}
          readOnly
          value={summary.url}
          onFocus={(e) => e.currentTarget.select()}
          className={`${FIELD} flex-[1_1_220px] py-2.5`}
        />
        <CopyButton
          label="Copy link"
          copied={copied}
          seed={seed}
          onClick={copy}
          className="px-4 py-2.5 rounded-lg bg-forest text-white font-semibold text-sm"
        />
        {canShare && (
          <button type="button" onClick={share} className="px-4 py-2.5 rounded-lg border border-[#b4c5e6] text-ink font-semibold text-sm">
            Share
          </button>
        )}
      </div>
      <CopyStatus copied={copied} manual={manual} className="mt-2" />

      {(joined > 0 || monthsEarned > 0) && (
        <div className="border-t border-[#e9effb] mt-5 pt-4">
          <div className="text-[13px] text-stone-600">
            {plural(joined, "friend", "friends")} joined &middot; {monthsEarned} of {plural(maxMonths, "free month", "free months")} earned
          </div>
          {friends.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {friends.map((f, i) => (
                <li key={`${f.joinedAt}-${i}`} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="min-w-0 truncate text-ink">{f.firstName || "A friend"}</span>
                  {/* Past the cap a friend's study days no longer earn a
                      month, and which ones did isn't known here, so those
                      just say what the friend did. */}
                  {f.earned ? (
                    <span className="flex-none font-semibold text-accent">&#10003; {allEarned ? `Studied ${studyDays} days` : "Free month earned"}</span>
                  ) : (
                    <span className="flex-none text-stone-500">Joined</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {joined > friends.length && friends.length > 0 && (
            <div className="mt-1.5 text-xs text-stone-500">and {joined - friends.length} more</div>
          )}
        </div>
      )}
    </div>
  );
}

function CompactStrip({ summary }: { summary: Pick<ReferralSummary, "url" | "joined"> }) {
  const { canShare, copied, manual, fieldRef, copy, share } = useInviteShare(summary.url);
  const seed = seedOf(summary.url) + 3;
  const button = "px-3 py-1.5 rounded-lg text-xs font-semibold";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[#c9d6ee] bg-white px-4 py-2.5">
      <p className="flex-auto text-[13.5px] text-stone-600">
        <span className="font-semibold text-ink">Invite a friend.</span> You both get a free month.
      </p>
      <div className="flex items-center gap-3">
        {summary.joined > 0 && <span className="text-[12px] text-stone-500">{plural(summary.joined, "friend", "friends")} joined</span>}
        <CopyButton label="Copy link" copied={copied} seed={seed} onClick={copy} className={`${button} border border-[#b4c5e6] text-ink`} />
        {canShare && (
          <button type="button" onClick={share} className={`${button} border border-[#b4c5e6] text-ink`}>
            Share
          </button>
        )}
      </div>
      {manual && <input ref={fieldRef} readOnly value={summary.url} aria-label="Your invite link" className={`${FIELD} basis-full py-2`} />}
      <CopyStatus copied={copied} manual={manual} className="basis-full" />
    </div>
  );
}

/** One quiet line under a just-passed quiz's buttons. */
export function InviteNudge({ url }: { url: string }) {
  const { copied, manual, fieldRef, share } = useInviteShare(url);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#e9effb] px-5 py-3 sm:px-6">
      <p className="flex-auto text-[13px] text-stone-500">Know someone taking the SAT? Invite them and you both get a free month.</p>
      <CopyButton
        label="Share invite"
        copied={copied}
        seed={seedOf(url) + 5}
        onClick={share}
        className="rounded-lg border border-[#b4c5e6] bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-[#c2d1ee]"
      />
      {manual && <input ref={fieldRef} readOnly value={url} aria-label="Your invite link" className={`${FIELD} basis-full py-2`} />}
      <CopyStatus copied={copied} manual={manual} className="basis-full" />
    </div>
  );
}
