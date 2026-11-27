import { useEffect, useRef } from "react";
import { finePointer, gsap, reduced } from "../fx";

/**
 * Cursor propio (solo mouse): un aro que sigue al puntero con inercia y crece con una etiqueta
 * sobre los elementos con data-cursor. No oculta el cursor del sistema.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!finePointer() || reduced()) return;
    const r = ring.current!;
    gsap.set(r, { xPercent: -50, yPercent: -50, opacity: 0 });
    const qx = gsap.quickTo(r, "x", { duration: 0.35, ease: "power3.out" });
    const qy = gsap.quickTo(r, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => { qx(e.clientX); qy(e.clientY); gsap.to(r, { opacity: 1, duration: 0.2, overwrite: "auto" }); };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button");
      const txt = t?.dataset.cursor;
      if (txt) { label.current!.textContent = txt; r.classList.add("big"); r.classList.remove("small"); }
      else if (t) { label.current!.textContent = ""; r.classList.add("small"); r.classList.remove("big"); }
      else { label.current!.textContent = ""; r.classList.remove("big", "small"); }
    };
    const leave = () => gsap.to(r, { opacity: 0, duration: 0.2 });
    addEventListener("pointermove", move);
    addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => { removeEventListener("pointermove", move); removeEventListener("pointerover", over); document.documentElement.removeEventListener("pointerleave", leave); };
  }, []);
  return <div className="cursor" ref={ring} aria-hidden="true"><span ref={label} /></div>;
}
