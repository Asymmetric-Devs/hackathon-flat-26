import { useLayoutEffect, useRef } from "react";
import { gsap, lockScroll } from "../fx";
import { BrickWord } from "./BrickWord";

/** Pseudoaleatorio con semilla: el muro de fondo se arma siempre igual. */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/**
 * Intro (corre en cada visita): cae un muro de ladrillos, la palabra MURO se arma ladrillo por
 * ladrillo, la O se pinta de naranja y chorrea, y todo se derrumba para dejar ver la página.
 * Se puede saltar con clic, Esc o Enter. `onReady` se llama cuando empieza el derrumbe (arranca
 * la entrada del hero); `onDone` cuando termina.
 */
export function Intro({ onReady, onDone }: { onReady: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const wall = el.querySelector<HTMLElement>(".wall")!;
    const W = innerWidth, H = innerHeight;
    const bw = Math.max(104, W / 10), bh = Math.round(bw * 0.44);
    const cols = Math.ceil(W / bw) + 2, rows = Math.ceil(H / bh) + 1;
    const rand = rng(11);
    const bricks: HTMLElement[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const b = document.createElement("i");
        const k = rand();
        b.className = "brick" + (k < 0.05 ? " o" : k < 0.28 ? " l" : "");
        b.style.cssText = `left:${c * bw - (r % 2 ? bw / 2 : 0) - bw / 2}px;top:${r * bh}px;width:${bw - 3}px;height:${bh - 3}px`;
        wall.appendChild(b);
        bricks.push(b);
      }
    }
    lockScroll(true);
    const ctx = gsap.context(() => {
      const cells = el.querySelectorAll<SVGElement>(".iword .b");
      const drips = el.querySelectorAll<SVGElement>(".iword .drip");
      const num = el.querySelector<HTMLElement>(".count b")!;
      const counter = { v: 0 };
      gsap.set(bricks, { y: () => -(H * 0.9 + Math.random() * H * 0.8), rotation: () => gsap.utils.random(-24, 24) });
      gsap.set(cells, { opacity: 0, scale: 0.2, y: () => gsap.utils.random(-30, 30), transformOrigin: "50% 50%" });
      gsap.set(drips, { scaleY: 0, transformOrigin: "50% 0%" });
      const tl = gsap.timeline({ onComplete: () => { lockScroll(false); onDone(); } });
      tlRef.current = tl;
      // 1) el muro cae de abajo hacia arriba, con rebote
      tl.to(bricks, { y: 0, rotation: 0, duration: 0.8, ease: "bounce.out", delay: (i: number) => (rows - 1 - Math.floor(i / cols)) * 0.04 + Math.random() * 0.1 }, 0);
      tl.to(counter, { v: 100, duration: 1.9, ease: "power2.inOut", onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0);
      // 2) la palabra se arma ladrillo por ladrillo
      tl.to(cells, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2.2)", stagger: { amount: 0.75, from: "random" } }, 0.95);
      // 3) la O chorrea
      tl.to(drips, { scaleY: 1, duration: 0.7, ease: "power2.out", stagger: 0.1 }, 1.9);
      tl.to(el.querySelector(".iword"), { x: () => gsap.utils.random(-4, 4), y: () => gsap.utils.random(-3, 3), duration: 0.04, repeat: 5, yoyo: true, ease: "none" }, 1.75);
      tl.set(el.querySelector(".iword"), { x: 0, y: 0 }, 1.98);
      // 4) derrumbe: todo cae y deja ver la página
      tl.to(el.querySelectorAll(".count, .skip"), { opacity: 0, duration: 0.2 }, 2.4);
      tl.call(onReady, [], 2.62);
      tl.set(el, { backgroundColor: "rgba(18,18,18,0)" }, 2.62);
      const fall = { y: () => H * 1.25 + gsap.utils.random(0, H * 0.5), rotation: () => gsap.utils.random(-50, 50), duration: 0.95, ease: "power3.in" };
      tl.to(cells, { ...fall, y: () => H * 1.1 + gsap.utils.random(0, H * 0.4), stagger: { amount: 0.3, from: "start" } }, 2.62);
      tl.to(drips, { opacity: 0, duration: 0.2 }, 2.62);
      tl.to(bricks, { ...fall, stagger: { amount: 0.55, from: "start", grid: [rows, cols] } }, 2.7);
    }, el);
    const skip = () => tlRef.current?.timeScale(6);
    const onKey = (ev: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(ev.key)) skip(); };
    el.addEventListener("pointerdown", skip);
    addEventListener("keydown", onKey);
    return () => { removeEventListener("keydown", onKey); el.removeEventListener("pointerdown", skip); ctx.revert(); lockScroll(false); };
  }, [onReady, onDone]);

  return (
    <div className="intro" ref={root} role="presentation">
      <div className="wall" />
      <div className="iwrap"><BrickWord className="iword" title="" /></div>
      <div className="count mono" aria-live="off"><b>000</b><i>colgando el muro</i></div>
      <button className="skip" type="button">Saltar ↵</button>
    </div>
  );
}
