import { ASSET, UNIT, EXPERT } from "./config";

export const xlm = (v: bigint, max = 2): string => {
  const neg = v < 0n; const a = neg ? -v : v;
  const whole = a / UNIT; const frac = Number(a % UNIT) / Number(UNIT);
  const n = Number(whole) + frac;
  return (neg ? "−" : "") + n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: max });
};
export const money = (v: bigint, max = 2) => `${xlm(v, max)} ${ASSET}`;
export const toStroops = (n: number): bigint => BigInt(Math.round(n * 1e7));
export const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;
export const txUrl = (h: string) => `${EXPERT}/tx/${h}`;
export const contractUrl = (c: string) => `${EXPERT}/contract/${c}`;
export const accountUrl = (a: string) => `${EXPERT}/account/${a}`;
export const pct = (part: bigint, whole: bigint) => (whole === 0n ? 0 : Math.min(100, Number((part * 10000n) / whole) / 100));

export function when(ts: number | bigint, withTime = false) {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) });
}
export function dur(secs: number, daySecs: number) {
  const days = secs / daySecs;
  if (days >= 1) return `${Math.floor(days)} ${Math.floor(days) === 1 ? "día" : "días"}`;
  const h = Math.floor(secs / (daySecs / 24));
  return `${h} h`;
}
