/** Acento de la pared. Un solo color por vez; se puede cambiar con ?acento=nombre o desde el pie de la página. */
export type Accent = { name: string; label: string; c: string; c2: string; on: string };
export const ACCENTS: Accent[] = [
  { name: "violeta", label: "Violeta", c: "#8b5cff", c2: "#b194ff", on: "#ffffff" },
  { name: "rosa", label: "Rosa", c: "#ff3d8b", c2: "#ff78ad", on: "#111111" },
  { name: "coral", label: "Coral", c: "#ff5a3c", c2: "#ff8a73", on: "#111111" },
  { name: "naranja", label: "Naranja", c: "#ff8a1f", c2: "#ffb05c", on: "#111111" },
  { name: "lima", label: "Lima", c: "#c6f432", c2: "#dcff6e", on: "#111111" },
  { name: "azul", label: "Azul", c: "#2f56ff", c2: "#6f8aff", on: "#ffffff" },
];
const KEY = "muro.acento";

export function currentAccent(): string {
  try {
    const q = new URLSearchParams(location.search).get("acento");
    if (q && ACCENTS.some((a) => a.name === q)) { localStorage.setItem(KEY, q); return q; }
    const s = localStorage.getItem(KEY);
    if (s && ACCENTS.some((a) => a.name === s)) return s;
  } catch { /* sin storage */ }
  return ACCENTS[0].name;
}
export function applyAccent(name: string) {
  const a = ACCENTS.find((x) => x.name === name) ?? ACCENTS[0];
  const r = document.documentElement.style;
  r.setProperty("--rosa", a.c); r.setProperty("--rosa-2", a.c2); r.setProperty("--on", a.on);
  document.documentElement.dataset.acento = a.name;
  try { localStorage.setItem(KEY, a.name); } catch { /* sin storage */ }
}
