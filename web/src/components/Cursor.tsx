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
    // botones magnéticos: se acercan un poco al puntero
    const magnet = (e: PointerEvent) => {
      document.querySelectorAll<HTMLElement>(".mag").forEach((m) => {
        const b = m.getBoundingClientRect();
        const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        if (Math.hypot(dx, dy) < 110) { m.dataset.mag = "1"; gsap.to(m, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: "power3.out", overwrite: "auto" }); }
        else if (m.dataset.mag) { delete m.dataset.mag; gsap.to(m, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.4)", overwrite: "auto" }); }
      });
    };
    addEventListener("pointermove", magnet);
    addEventListener("pointermove", move);
    addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => { removeEventListener("pointermove", magnet); removeEventListener("pointermove", move); removeEventListener("pointerover", over); document.documentElement.removeEventListener("pointerleave", leave); };
  }, []);
  return <div className="cursor" ref={ring} aria-hidden="true"><span ref={label} /></div>;
}

/** Barra fina arriba que marca cuánto se scrolleó. */
export function Progress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.current?.style.setProperty("transform", `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`);
      });
    };
    addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
    return () => { removeEventListener("scroll", upd); removeEventListener("resize", upd); cancelAnimationFrame(raf); };
  }, []);
  return <div className="progress" aria-hidden="true"><div ref={bar} /></div>;
}
