"use client";

import { useEffect, useRef, useState } from "react";

// Sharing a piece of text (a result, a snippet of code) the way
// useInviteShare shares an invite link: the phone's own share sheet where
// there is one, else the clipboard, and where an in-app browser allows
// neither, the text is shown selected for copying by hand.

const COPIED_MS = 2200;

function selectField(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.focus();
  el.select();
  // iOS ignores select() on a read-only field but honours a range.
  el.setSelectionRange(0, el.value.length);
}

export function useShareText(text: string) {
  // Only known after mount: the server can't tell, and guessing would make
  // the button change on hydration.
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  // Counts failed copies, so each one selects the field again.
  const [failedCopies, setFailedCopies] = useState(0);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
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
      await navigator.clipboard.writeText(text);
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
      // Text only, link included: passed separately, some apps drop the
      // text and others put the link first.
      await navigator.share({ text });
    } catch (err) {
      // Closing the share sheet is a choice, not a failure.
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copy();
    }
  }

  return { copied, manual: failedCopies > 0, fieldRef, copy, share };
}
