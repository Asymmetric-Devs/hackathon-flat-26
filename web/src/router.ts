import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { reduced, scrollJump, scrollToId, toTop } from "./fx";

export type Route =
  | { page: "inicio" } | { page: "galeria" } | { page: "obra"; id: number }
  | { page: "cartela"; id: number } | { page: "publicar" } | { page: "evidencia" } | { page: "cuenta" };

export function parseHash(hash: string): Route {
  // se ignora todo lo que va después de "?" (por ejemplo ?acento=… o ?utm=… al escanear un QR)
  const [seg, p] = hash.replace(/^#\/?/, "").split("?")[0].split("/");
  const id = /^\d+$/.test(p ?? "") ? Number(p) : NaN;
  switch (seg) {
    case "galeria": return { page: "galeria" };
    case "obra": return Number.isInteger(id) ? { page: "obra", id } : { page: "galeria" };
    case "cartela": return Number.isInteger(id) ? { page: "cartela", id } : { page: "galeria" };
    case "publicar": return { page: "publicar" };
    case "evidencia": return { page: "evidencia" };
    case "cuenta": return { page: "cuenta" };
    default: return { page: "inicio" };
  }
}
export const href = {
  inicio: "#/", galeria: "#/galeria", publicar: "#/publicar", evidencia: "#/evidencia", cuenta: "#/cuenta",
  obra: (id: number) => `#/obra/${id}`, cartela: (id: number) => `#/cartela/${id}`,
};

/* ------------------------------------------------------------------------------------------
 * Router mínimo con transiciones. Si el navegador soporta View Transitions, la obra que se toca
 * viaja y crece hasta su lugar en la página de detalle (y vuelve al salir). Si no, cambia sin más.
 * Los elementos que participan llevan data-work="<id>" (en listados) o data-hero (en el detalle).
 * ------------------------------------------------------------------------------------------ */
let current: Route = parseHash(location.hash);
/** Destino en curso: evita que popstate + hashchange (que llegan juntos) lancen dos transiciones. */
let target: Route = current;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const same = (a: Route, b: Route) => JSON.stringify(a) === JSON.stringify(b);
const heroId = (r: Route) => (r.page === "obra" ? r.id : null);
const NAME = "hero";
/** Posición de scroll de cada página al salir, para volver exactamente donde estaba la obra. */
const scrollPos = new Map<string, number>();
const key = (r: Route) => (r.page === "obra" ? `obra/${r.id}` : r.page);
const anyWork = (id: number) => document.querySelector<HTMLElement>(`[data-work="${id}"]:not([data-hero])`);

function clearNames() {
  document.querySelectorAll<HTMLElement>("[data-vt]").forEach((e) => { e.style.viewTransitionName = ""; e.removeAttribute("data-vt"); });
}
function visibleWork(id: number): HTMLElement | null {
  const els = [...document.querySelectorAll<HTMLElement>(`[data-work="${id}"]`)];
  return els.find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }) ?? null;
}
function tag(el: Element | null) {
  clearNames();
  if (!el) return;
  (el as HTMLElement).style.viewTransitionName = NAME;
  el.setAttribute("data-vt", "1");
}

function go(next: Route, source?: Element | null) {
  const prev = current;
  if (same(next, target)) return;
  target = next;
  scrollPos.set(key(prev), scrollY);
  const swap = () => {
    flushSync(() => { current = next; emit(); });
    const nid = heroId(next), pid = heroId(prev);
    // Al volver a un listado: se restaura el scroll de antes y, si la obra a la que se vuelve
    // no queda a la vista (las de abajo de la galería), se centra. Si no, no hay a qué animar.
    const saved = scrollPos.get(key(next));
    if (nid === null && saved !== undefined) scrollJump(saved); else toTop();
    if (nid === null && pid !== null && !visibleWork(pid)) {
      const el = anyWork(pid);
      if (el) { const b = el.getBoundingClientRect(); scrollJump(Math.max(0, scrollY + b.top - (innerHeight - b.height) / 2)); }
    }
    if (nid !== null) tag(document.querySelector("[data-hero]"));
    else if (pid !== null) tag(visibleWork(pid));
    else clearNames();
  };
  const svt = (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition;
  if (typeof svt !== "function" || reduced()) { swap(); return; }
  const nid = heroId(next), pid = heroId(prev);
  if (nid !== null) tag(source ?? visibleWork(nid));
  else if (pid !== null) tag(document.querySelector("[data-hero]"));
  else clearNames();
  const t = svt.call(document, swap) as { finished: Promise<void>; ready?: Promise<void>; updateCallbackDone?: Promise<void> };
  t.ready?.catch(() => {});
  t.updateCallbackDone?.catch(() => {});
  t.finished.catch(() => {}).finally(clearNames);
}

/** Navega a un hash (por ejemplo `href.obra(3)`), con transición. */
export function navigate(hash: string, source?: Element | null) {
  if (location.hash !== hash) history.pushState(null, "", hash);
  // enlaces con ancla ("#/#como"): se marca antes de cambiar de página para que la portada no repita la intro
  const anchor = /^#\/#([\w-]+)$/.exec(hash)?.[1];
  if (anchor) anchorPending = true;
  go(parseHash(hash), source);
  if (anchor) {
    // una vez en la portada, se baja hasta la sección
    let tries = 0;
    const seek = () => {
      if (document.getElementById(anchor) && !document.querySelector(".intro")) { scrollToId(anchor); anchorPending = false; }
      else if (tries++ < 300) requestAnimationFrame(seek);
      else anchorPending = false;
    };
    setTimeout(seek, 450);
  }
}
/** Hay una navegación con ancla en curso (la portada se salta la intro para llegar directo a la sección). */
let anchorPending = false;
export const anchorNavigating = () => anchorPending;

let started = false;
export function initRouter() {
  if (started) return;
  started = true;
  addEventListener("click", (ev) => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const a = (ev.target as Element | null)?.closest?.("a[href^='#/']") as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== "_self")) return;
    ev.preventDefault();
    navigate(a.getAttribute("href")!, a.querySelector("[data-work]"));
  });
  const onBack = () => go(parseHash(location.hash));
  addEventListener("popstate", onBack);
  addEventListener("hashchange", onBack);
}

const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => current);
}
