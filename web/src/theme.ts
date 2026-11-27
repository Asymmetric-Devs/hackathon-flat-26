/** Acento de la marca. Naranja por defecto; se puede probar otro con ?acento=nombre. */
export type Accent = { name: string; label: string; c: string; c2: string; on: string };
export const ACCENTS: Accent[] = [
  { name: "naranja", label: "Naranja", c: "#ff7a00", c2: "#e86c00", on: "#121212" },
  { name: "bermellon", label: "Bermellón", c: "#ff5a1f", c2: "#e84d12", on: "#121212" },
  { name: "ambar", label: "Ámbar", c: "#ff8a00", c2: "#e87c00", on: "#121212" },
  { name: "oxido", label: "Óxido", c: "#e8590c", c2: "#cc4d08", on: "#ffffff" },
  { name: "senal", label: "Señal", c: "#ff4f00", c2: "#e04500", on: "#121212" },
  { name: "violeta", label: "Violeta", c: "#8b5cff", c2: "#7447ee", on: "#ffffff" },
];
const KEY = "muro.acento.v4";

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
  r.setProperty("--ac", a.c); r.setProperty("--ac-2", a.c2); r.setProperty("--on", a.on);
  document.documentElement.dataset.acento = a.name;
}
