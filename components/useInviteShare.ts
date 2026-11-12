"use client";

import { useEffect, useRef, useState } from "react";

// Sharing a student's invite link (lib/referral.ts), for every place that
// offers it: Settings, the dashboard strip, and the line under a passed
// quiz. Share opens the phone's own share sheet where there is one; Copy
// puts the link on the clipboard. Some in-app browsers allow neither, so
// then the link's field is shown selected for the student to copy by hand.

export const INVITE_SHARE_TEXT = "I'm using Oakmont for SAT prep. Sign up with my link and we both get a free month.";
const INVITE_SHARE_TITLE = "Oakmont SAT prep";
const COPIED_MS = 2200;

function selectField(el: HTMLInputElement | null) {
  if (!el) return;
  el.focus();
  el.select();
  // iOS ignores select() on a read-only field but honours a range.
  el.setSelectionRange(0, el.value.length);
}

export function useInviteShare(url: string) {
  // Only known after mount: the server can't tell, and guessing would make
  // the button flicker in or out on hydration.
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  // Counts failed copies, so each one selects the field again.
  const [failedCopies, setFailedCopies] = useState(0);
  const fieldRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
    return () => window.clearTimeout(timer.current);
  }, []);

  // After the render that shows the field (it may not have existed before).
  useEffect(() => {
    if (failedCopies > 0) selectField(fieldRef.current);
  }, [failedCopies]);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("No clipboard here");
      await navigator.clipboard.writeText(url);
      setFailedCopies(0);
      setCopied(true);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      setCopied(false);
      setFailedCopies((n) => n + 1);
    }
  }

  async function share() {
    if (!canShare) return copy();
    try {
      await navigator.share({ title: INVITE_SHARE_TITLE, text: INVITE_SHARE_TEXT, url });
    } catch (err) {
      // Closing the share sheet is a choice, not a failure.
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copy();
    }
  }

  return { canShare, copied, manual: failedCopies > 0, fieldRef, copy, share };
}
