import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { reduced, toTop } from "./fx";

export type Route =
  | { page: "inicio" } | { page: "galeria" } | { page: "obra"; id: number }
  | { page: "cartela"; id: number } | { page: "publicar" } | { page: "evidencia" } | { page: "cuenta" };

export function parseHash(hash: string): Route {
  const [seg, p] = hash.replace(/^#\/?/, "").split("/");
  const id = Number(p);
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
  const swap = () => {
    flushSync(() => { current = next; emit(); });
    toTop();
    const nid = heroId(next), pid = heroId(prev);
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
  go(parseHash(hash), source);
}

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
