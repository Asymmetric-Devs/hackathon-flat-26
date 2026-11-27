import { useLayoutEffect, useRef } from "react";
import { gsap, lockScroll } from "../fx";
import { Wordmark } from "./Wordmark";

/**
 * Intro (corre en cada carga): solo la palabra MURO, con el mismo estilo rugoso del fondo del hero.
 * Cada letra se pinta con un trazo de pincel, la O chorrea y, sin cortes, la palabra viaja hasta el
 * lugar exacto que ocupa en el hero mientras el fondo se desvanece y entra el resto de la página.
 * Se salta con clic, Esc o Enter. `onReady`: empieza el viaje (arranca la entrada del hero).
 * `onLanded`: la palabra llegó (el hero muestra la suya). `onDone`: se puede desmontar.
 */
export function Intro({ onReady, onLanded, onDone }: { onReady: () => void; onLanded: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    lockScroll(true);
    const ctx = gsap.context(() => {
      const svg = el.querySelector<SVGSVGElement>(".iword")!;
      const brushes = el.querySelectorAll<SVGElement>(".iword .brush");
      const drips = el.querySelectorAll<SVGElement>(".iword .drip");
      const ink = el.querySelector<HTMLElement>(".ink-bg")!;
      gsap.set(brushes, { strokeDashoffset: 1 });
      gsap.set(drips, { y: (_i: number, t: Element) => -(Number((t as SVGElement).getAttribute("data-len")) + 80) });
      const tl = gsap.timeline({ onComplete: () => { lockScroll(false); onDone(); } });
      tlRef.current = tl;
      // 1) cada letra se pinta con un pincel en zigzag
      tl.to(brushes, { strokeDashoffset: 0, duration: 0.95, ease: "power2.inOut", stagger: 0.2 }, 0.25);
      // 2) la O (y las demás) chorrean
      tl.to(drips, { y: 0, duration: 1.15, ease: "power2.out", stagger: 0.12 }, 1.45);
      // 3) la palabra viaja hasta su lugar en el hero; el fondo se desvanece
      let tx = 0, ty = 0, ts = 1;
      tl.add(() => {
        const src = svg.querySelector(".lets") as SVGGElement;
        const dst = document.querySelector<SVGGElement>(".hero .hword .lets");
        const sr = src.getBoundingClientRect(), sv = svg.getBoundingClientRect();
        if (dst) {
          const dr = dst.getBoundingClientRect();
          ts = dr.width / sr.width;
          tx = dr.left + dr.width / 2 - (sr.left + sr.width / 2);
          ty = dr.top + dr.height / 2 - (sr.top + sr.height / 2);
        }
        gsap.set(svg, { transformOrigin: `${sr.left + sr.width / 2 - sv.left}px ${sr.top + sr.height / 2 - sv.top}px` });
        onReady();
      }, 2.35);
      tl.to(svg, { x: () => tx, y: () => ty, scale: () => ts, duration: 1, ease: "expo.inOut" }, 2.4);
      tl.to(drips, { opacity: 0, duration: 0.4, ease: "power1.out" }, 2.4);
      tl.to(ink, { opacity: 0, duration: 0.75, ease: "power2.out" }, 2.45);
      tl.call(onLanded, [], 3.38);
      tl.set(el, { opacity: 0 }, 3.42);
    }, el);
    const skip = () => tlRef.current?.timeScale(5);
    const onKey = (ev: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(ev.key)) skip(); };
    el.addEventListener("pointerdown", skip);
    addEventListener("keydown", onKey);
    return () => { removeEventListener("keydown", onKey); el.removeEventListener("pointerdown", skip); ctx.revert(); lockScroll(false); };
  }, [onReady, onLanded, onDone]);

  return (
    <div className="intro" ref={root} role="presentation">
      <div className="ink">
        <div className="ink-bg" />
        <div className="iwrap"><Wordmark className="iword"  paint title="" /></div>
      </div>
    </div>
  );
}
