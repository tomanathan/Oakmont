"use client";

import { useEffect, useRef, useState } from "react";
import { PixelDog } from "@/components/PixelDog";

type Tail = 0 | 1 | 2 | 3 | 4 | 5;

// Ozho in his room: a happy tail wag, and a boing when he's tapped. The
// only interactive piece of the room. The wag pauses while he's off screen
// so it costs nothing once you've scrolled past the hero.
export function OzhoPoke() {
  const ref = useRef<HTMLButtonElement>(null);
  const [tail, setTail] = useState<Tail>(0);
  const [visible, setVisible] = useState(true);
  const [boing, setBoing] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    let dir = 1;
    const id = window.setInterval(() => {
      i += dir;
      if (i >= 5 || i <= 0) dir *= -1;
      setTail(i as Tail);
    }, 85);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <button ref={ref} type="button" className="nb-ozho" aria-label="Poke Ozho" onClick={() => setBoing((b) => b + 1)}>
      <span key={boing} className={`nb-ozho-in ${boing ? "is-poked" : ""}`}>
        <PixelDog size={240} mood="happy" tailFrame={tail} costume="sunglasses" shadow={false} />
      </span>
      <span className="nb-ozho-shadow" aria-hidden />
    </button>
  );
}
