import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;

let lenis: Lenis | null = null;
let tick: ((t: number) => void) | null = null;

/** Scroll suave con inercia, sincronizado con ScrollTrigger. No se activa con "reducir movimiento". */
export function startSmooth() {
  if (lenis || reduced()) return;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}
export function stopSmooth() {
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null; tick = null;
}
export const lockScroll = (on: boolean) => {
  if (on) lenis?.stop(); else lenis?.start();
  document.documentElement.style.overflow = on ? "hidden" : "";
  // al desbloquear, recalcular los anclajes (miden el ancho de la ventana)
  if (!on) requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
};
export const scrollJump = (y: number) => { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); };
export const toTop = () => { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0); };
export const scrollToId = (id: string) => {
  const el = document.getElementById(id); if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 }); else el.scrollIntoView({ behavior: "smooth" });
};

export { gsap, ScrollTrigger };
