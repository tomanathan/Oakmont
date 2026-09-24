"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Two ways to connect a student: their code (if they already use Oakmont),
// or a link the parent sends them, which they open and approve.
export function ConnectStudent({ initialName = "", compact = false }: { initialName?: string; compact?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [linking, setLinking] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function linkWithCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeError("");
    setLinking(true);
    const res = await fetch("/api/parent/link-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, nickname: name }),
    });
    const data = await res.json().catch(() => ({}));
    setLinking(false);
    if (!res.ok) {
      setCodeError(data.error || "Something went wrong.");
      return;
    }
    router.push(`/parent/dashboard?student=${data.studentId}`);
    router.refresh();
  }

  async function createInvite() {
    setInviteError("");
    setCreating(true);
    const res = await fetch("/api/parent/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: name }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      setInviteError(data.error || "Something went wrong.");
      return;
    }
    setInviteUrl(data.url);
  }

  async function copy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the link is selectable on screen anyway.
    }
  }

  const message = inviteUrl
    ? `Hi${name ? ` ${name}` : ""}! I set up a parent account on Oakmont so I can follow along with your SAT prep. Open this link while you're logged in to approve it: ${inviteUrl}`
    : "";
  const input = "w-full rounded-lg border border-[#e0defa] px-3 py-2.5 text-sm focus:border-[#6d7fd6] focus:outline-none";

  return (
    <div className={compact ? "" : "mx-auto max-w-[860px]"}>
      {!compact && (
        <div className="mb-6">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400">Get started</div>
          <h1 className="font-display text-[30px] font-semibold text-ink">Connect your student</h1>
          <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-gray-600">
            Once connected, this page becomes a live report of their studying. They approve the connection and can see it&apos;s on; you
            can&apos;t change anything in their account.
          </p>
        </div>
      )}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-700">Student&apos;s first name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya" maxLength={40} className={`${input} max-w-[320px]`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#ece9f7] bg-white p-6">
          <div className="font-display text-[18px] font-semibold text-ink">Send them a link</div>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
            Best if they&apos;re new to Oakmont. They sign up (or log in), open the link, and tap Approve.
          </p>
          {!inviteUrl ? (
            <>
              <button
                onClick={createInvite}
                disabled={creating}
                className="mt-4 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create invite link"}
              </button>
              {inviteError && <div className="mt-2 text-sm text-red-700">{inviteError}</div>}
            </>
          ) : (
            <div className="mt-4">
              <div className="flex gap-2">
                <input readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()} className={`${input} font-mono text-[12px]`} />
                <button onClick={copy} className="whitespace-nowrap rounded-lg border border-[#e0defa] px-3 text-sm font-medium text-ink hover:bg-[#f3f2fc]">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a href={`sms:?&body=${encodeURIComponent(message)}`} className="rounded-lg border border-[#e0defa] px-3 py-1.5 font-medium text-ink hover:bg-[#f3f2fc]">
                  Text it
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent("Approve my Oakmont parent account")}&body=${encodeURIComponent(message)}`}
                  className="rounded-lg border border-[#e0defa] px-3 py-1.5 font-medium text-ink hover:bg-[#f3f2fc]"
                >
                  Email it
                </a>
              </div>
              <p className="mt-3 text-[12px] text-gray-400">Works once, for 14 days. This page updates after they approve; refresh to check.</p>
            </div>
          )}
        </div>
        <form onSubmit={linkWithCode} className="rounded-2xl border border-[#ece9f7] bg-white p-6">
          <div className="font-display text-[18px] font-semibold text-ink">Use their code</div>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
            If they already use Oakmont: Settings &rarr; Parent access &rarr; Generate code.
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 7K9QXFRT"
            className={`${input} mt-4 uppercase tracking-wide`}
            required
          />
          {codeError && <div className="mt-2 text-sm text-red-700">{codeError}</div>}
          <button type="submit" disabled={linking} className="mt-3 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {linking ? "Connecting..." : "Connect"}
          </button>
        </form>
      </div>
    </div>
  );
}
