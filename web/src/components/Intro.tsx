import { useLayoutEffect, useRef } from "react";
import { gsap, lockScroll } from "../fx";
import { Wordmark } from "./Wordmark";

/**
 * Intro (corre en cada carga): pantalla oscura, las letras del logo suben una a una desde una máscara,
 * la O chorrea, y una cortina naranja barre hacia arriba y deja ver la página. Sobria y rápida (~3 s);
 * se salta con clic, Esc o Enter. `onReady` se llama cuando la cortina empieza a irse (arranca la entrada
 * del hero) y `onDone` cuando termina.
 */
export function Intro({ onReady, onDone }: { onReady: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    lockScroll(true);
    const ctx = gsap.context(() => {
      const letters = el.querySelectorAll<SVGElement>(".iword .l");
      const drips = el.querySelectorAll<SVGElement>(".iword .drip");
      const num = el.querySelector<HTMLElement>(".count")!;
      const ink = el.querySelector<HTMLElement>(".ink")!;
      const orange = el.querySelector<HTMLElement>(".orange")!;
      const counter = { v: 0 };
      gsap.set(letters, { y: 1900 });
      gsap.set(drips, { scaleY: 0, transformOrigin: "50% 0%", transformBox: "fill-box" });
      gsap.set(orange, { yPercent: 100 });
      gsap.set(el.querySelectorAll(".meta > *"), { opacity: 0, y: 12 });
      const tl = gsap.timeline({ onComplete: () => { lockScroll(false); onDone(); } });
      tlRef.current = tl;
      tl.to(el.querySelectorAll(".meta > *"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.05);
      tl.to(counter, { v: 100, duration: 1.7, ease: "power3.inOut", onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0);
      tl.to(letters, { y: 0, duration: 1.05, ease: "expo.out", stagger: 0.085 }, 0.2);
      tl.to(drips, { scaleY: 1, duration: 0.9, ease: "power3.out", stagger: 0.09 }, 1.15);
      // la cortina naranja sube, tapa todo y se va hacia arriba mostrando la página
      tl.to(orange, { yPercent: 0, duration: 0.75, ease: "expo.inOut" }, 1.9);
      tl.set(ink, { opacity: 0 }, 2.66);
      tl.call(onReady, [], 2.7);
      tl.to(orange, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 2.72);
    }, el);
    const skip = () => tlRef.current?.timeScale(5);
    const onKey = (ev: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(ev.key)) skip(); };
    el.addEventListener("pointerdown", skip);
    addEventListener("keydown", onKey);
    return () => { removeEventListener("keydown", onKey); el.removeEventListener("pointerdown", skip); ctx.revert(); lockScroll(false); };
  }, [onReady, onDone]);

  return (
    <div className="intro" ref={root} role="presentation">
      <div className="ink">
        <div className="iwrap"><Wordmark className="iword" clip title="" /></div>
        <div className="meta">
          <span className="hint">La obra cobra por día</span>
          <b className="count">000</b>
        </div>
        <button className="skip" type="button">Saltar ↵</button>
      </div>
      <div className="orange" />
    </div>
  );
}
