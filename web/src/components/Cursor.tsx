import { useEffect, useRef } from "react";
import { finePointer, gsap, reduced } from "../fx";

/**
 * Seguidor de cursor (solo mouse): un ladrillito naranja pegado a la flecha, casi sin retraso, que sobre
 * las obras se vuelve una etiqueta ("Ver obra"). No tapa ni reemplaza el cursor del sistema.
 */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!finePointer() || reduced()) return;
    const c = el.current!;
    gsap.set(c, { opacity: 0 });
    const qx = gsap.quickTo(c, "x", { duration: 0.08, ease: "power3.out" });
    const qy = gsap.quickTo(c, "y", { duration: 0.08, ease: "power3.out" });
    const move = (e: PointerEvent) => { qx(e.clientX + 16); qy(e.clientY + 16); if (!c.dataset.on) { c.dataset.on = "1"; gsap.to(c, { opacity: 1, duration: 0.15 }); } };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      const txt = t?.dataset.cursor ?? "";
      label.current!.textContent = txt;
      c.classList.toggle("tag", !!txt);
    };
    const leave = () => { delete c.dataset.on; gsap.to(c, { opacity: 0, duration: 0.15 }); };
    addEventListener("pointermove", move);
    addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => { removeEventListener("pointermove", move); removeEventListener("pointerover", over); document.documentElement.removeEventListener("pointerleave", leave); };
  }, []);
  return <div className="cur" ref={el} aria-hidden="true"><i /><span ref={label} /></div>;
}
