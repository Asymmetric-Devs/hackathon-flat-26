/**
 * Temas de color. Cada uno define el acento, el color de texto sobre el acento y la "tinta" (el negro de
 * los textos y de las secciones oscuras, ligeramente teñido). El lienzo (fondo claro) es común.
 * Se cambia con ?acento=nombre (se recuerda en el navegador).
 */
export type Accent = { name: string; label: string; c: string; c2: string; on: string; ink: string; warm: string; lit: string };
export const ACCENTS: Accent[] = [
  { name: "ultramar", label: "Ultramar", c: "#2236ff", c2: "#1828d6", on: "#ffffff", ink: "#0d1024", warm: "#ffc61a", lit: "#8f9bff" },
  { name: "bermellon", label: "Bermellón", c: "#e8341c", c2: "#c92a14", on: "#ffffff", ink: "#171210", warm: "#ffc61a", lit: "#ff6a52" },
  { name: "tinta-roja", label: "Rojo y tinta azul", c: "#ff4a2b", c2: "#e03a1d", on: "#ffffff", ink: "#0f1a3a", warm: "#ffc61a", lit: "#ff7a5e" },
  { name: "amarillo", label: "Amarillo cadmio", c: "#ffc20e", c2: "#e6ad00", on: "#14141c", ink: "#14141c", warm: "#2236ff", lit: "#ffc20e" },
  { name: "viridian", label: "Viridian", c: "#0a8f68", c2: "#07765a", on: "#ffffff", ink: "#0e1914", warm: "#ffc61a", lit: "#2fd0a0" },
  { name: "naranja", label: "Naranja", c: "#ff7a00", c2: "#e86c00", on: "#121212", ink: "#121212", warm: "#2236ff", lit: "#ff7a00" },
];
const KEY = "muro.acento.v5";

export function currentAccent(): string {
  try {
    const q = new URLSearchParams(location.search).get("acento") ?? new URLSearchParams(location.hash.split("?")[1] ?? "").get("acento");
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
  r.setProperty("--warm", a.warm); r.setProperty("--ac-lit", a.lit); r.setProperty("--tinta", a.ink); r.setProperty("--asfalto", a.ink);
  document.documentElement.dataset.acento = a.name;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", a.ink);
}
