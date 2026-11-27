import { useLayoutEffect, useRef } from "react";
import { gsap, lockScroll } from "../fx";

/** Pseudoaleatorio con semilla: la intro se arma siempre igual. */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/**
 * Intro: cae un muro de ladrillos (unos pocos naranja), las letras MURO se estampan encima con un
 * temblor y todo estalla hacia afuera para dejar ver la página. Se puede saltar con clic o teclado.
 * `onReady` se llama cuando empieza la explosión (arranca la animación del hero); `onDone` al terminar.
 */
export function Intro({ onReady, onDone }: { onReady: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const wall = el.querySelector<HTMLElement>(".wall")!;
    const W = innerWidth, H = innerHeight;
    const bw = Math.max(110, W / 9), bh = Math.round(bw * 0.46);
    const cols = Math.ceil(W / bw) + 2, rows = Math.ceil(H / bh) + 1;
    const rand = rng(11);
    const bricks: HTMLElement[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const b = document.createElement("i");
        const k = rand();
        b.className = "brick" + (k < 0.065 ? " o" : k < 0.3 ? " l" : "");
        b.style.cssText = `left:${c * bw - (r % 2 ? bw / 2 : 0) - bw / 2}px;top:${r * bh}px;width:${bw - 3}px;height:${bh - 3}px`;
        wall.appendChild(b);
        bricks.push(b);
      }
    }
    lockScroll(true);
    const ctx = gsap.context(() => {
      const letters = el.querySelectorAll<HTMLElement>(".letters span");
      const num = el.querySelector<HTMLElement>(".count b")!;
      const flash = el.querySelector<HTMLElement>(".flash")!;
      const counter = { v: 0 };
      gsap.set(bricks, { y: () => -(H * 0.9 + Math.random() * H * 0.9), rotation: () => gsap.utils.random(-28, 28), opacity: 1 });
      gsap.set(letters, { yPercent: 125, opacity: 0, scale: 1.3 });
      const tl = gsap.timeline({ onComplete: () => { lockScroll(false); onDone(); } });
      tlRef.current = tl;
      // 1) el muro cae, de abajo hacia arriba, con rebote
      tl.to(bricks, { y: 0, rotation: 0, duration: 0.9, ease: "bounce.out", delay: (i: number) => (rows - 1 - Math.floor(i / cols)) * 0.045 + Math.random() * 0.12 }, 0);
      tl.to(counter, { v: 100, duration: 1.8, ease: "power2.inOut", onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0);
      // 2) las letras se estampan, con temblor
      tl.to(letters, { yPercent: 0, opacity: 1, scale: 1, duration: 0.55, ease: "expo.out", stagger: 0.1 }, 1.15);
      tl.to(el, { x: () => gsap.utils.random(-9, 9), y: () => gsap.utils.random(-7, 7), duration: 0.045, repeat: 7, yoyo: true, ease: "none" }, 1.5);
      tl.set(el, { x: 0, y: 0 }, 1.86);
      // 3) estalla todo hacia afuera
      tl.call(onReady, [], 2.25);
      tl.to(el.querySelectorAll(".count, .skip"), { opacity: 0, duration: 0.2 }, 2.1);
      tl.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.45, ease: "power2.out", immediateRender: false }, 2.2);
      tl.to(letters, { scale: 1.7, yPercent: -30, opacity: 0, duration: 0.42, ease: "power3.in", stagger: 0.03 }, 2.15);
      tl.to(bricks, {
        x: (_i: number, t: Element) => { const r = (t as HTMLElement).getBoundingClientRect(); return (r.left + r.width / 2 - W / 2) * gsap.utils.random(1.2, 2.4); },
        y: (_i: number, t: Element) => { const r = (t as HTMLElement).getBoundingClientRect(); return (r.top + r.height / 2 - H / 2) * gsap.utils.random(1.2, 2.4) + gsap.utils.random(-80, 160); },
        rotation: () => gsap.utils.random(-260, 260), scale: () => gsap.utils.random(0.3, 0.9), opacity: 0, duration: 1.05, ease: "power4.out",
        stagger: { amount: 0.4, from: "center", grid: [rows, cols] },
      }, 2.25);
      tl.to(el, { backgroundColor: "rgba(18,18,18,0)", duration: 0.5 }, 2.3);
    }, el);
    const skip = () => tlRef.current?.timeScale(6);
    const onKey = (ev: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(ev.key)) skip(); };
    el.addEventListener("pointerdown", skip);
    addEventListener("keydown", onKey);
    return () => { removeEventListener("keydown", onKey); el.removeEventListener("pointerdown", skip); ctx.revert(); lockScroll(false); };
  }, [onReady, onDone]);

  return (
    <div className="intro" ref={root} role="presentation">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="rough2" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03 .045" numOctaves="3" seed="9" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="12" /></filter>
      </svg>
      <div className="wall" />
      <div className="letters" aria-hidden="true"><span>M</span><span>U</span><span>R</span><span>O</span></div>
      <div className="flash" />
      <div className="count mono" aria-live="off"><b>000</b><i>colgando el muro</i></div>
      <button className="skip" type="button">Saltar ↵</button>
    </div>
  );
}
