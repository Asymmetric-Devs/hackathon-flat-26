import type { Entry } from "./chain";
import { DAY_SECS, UNIT } from "./config";
import { pct } from "./format";

export type Live = {
  paid: bigint; accruedNow: bigint; credited: bigint; pct: number; remaining: bigint;
  secsHung: number; runsOutIn: number | null; runoutAt: number | null; hung: boolean;
};

/** Cuánto lleva cobrado una obra, incluyendo lo devengado y todavía no reclamado (se estima con el reloj local). */
export function live(e: Entry, now: number): Live {
  const { work, lease } = e;
  const hung = work.status === "Hung" && !!lease;
  if (work.status === "Sold") return { paid: work.price, accruedNow: 0n, credited: work.price, pct: 100, remaining: 0n, secsHung: 0, runsOutIn: null, runoutAt: null, hung: false };
  if (!hung || !lease) {
    const paid = lease?.paid ?? 0n;
    return { paid, accruedNow: 0n, credited: paid, pct: pct(paid, work.price), remaining: work.price - paid, secsHung: 0, runsOutIn: null, runoutAt: null, hung: false };
  }
  const elapsed = Math.max(0, now - Number(lease.from));
  let accrued = (BigInt(elapsed) * work.rate) / BigInt(DAY_SECS);
  if (accrued > lease.prepaid) accrued = lease.prepaid;
  const room = work.price - lease.paid;
  if (accrued > room) accrued = room;
  const credited = lease.paid + accrued;
  // Igual que el contrato: runout = from + prepaid * día / tasa. Es un instante fijo; "runsOutIn" pasa a negativo cuando vence.
  const runoutAt = work.rate > 0n ? Number(lease.from) + Number((lease.prepaid * BigInt(DAY_SECS)) / work.rate) : null;
  const runsOutIn = runoutAt === null ? null : runoutAt - now;
  return { paid: lease.paid, accruedNow: accrued, credited, pct: pct(credited, work.price), remaining: work.price - credited,
    secsHung: Math.max(0, now - Number(lease.start)), runsOutIn, runoutAt, hung: true };
}

/** Obras de ejemplo para cuando todavía no hay contrato desplegado o la red no responde. Se marcan como simulación. */
export function demoEntries(): Entry[] {
  const now = Math.floor(Date.now() / 1000);
  const mk = (id: number, slug: string, price: number, rate: number, deposit: number, status: "Hung" | "Available", daysAgo = 0, paid = 0): Entry => ({
    work: { id, artist: "GDEMO", owner: "GDEMO", price: BigInt(price) * UNIT, rate: BigInt(rate) * UNIT, deposit: BigInt(deposit) * UNIT, meta: slug, status },
    lease: status === "Hung" ? { venue: "GVENUE", start: BigInt(now - daysAgo * DAY_SECS), from: BigInt(now - daysAgo * DAY_SECS + paid), prepaid: BigInt(rate * 30) * UNIT, paid: BigInt(Math.round(paid)) * UNIT, deposit: BigInt(deposit) * UNIT, ended_at: 0n } : null,
    history: [], tips: 0n,
  });
  return [
    mk(0, "afklint-retablo", 400, 4, 60, "Hung", 9),
    mk(1, "manet-bar", 300, 3, 45, "Hung", 14),
    mk(2, "candido-curupayti", 250, 2, 40, "Hung", 5),
    mk(3, "pueyrredon-alto", 180, 2, 30, "Available"),
    mk(4, "vangogh-terraza", 350, 3, 50, "Hung", 21),
    mk(5, "fader-mantones", 220, 2, 30, "Available"),
    mk(6, "rousseau-sueno", 200, 2, 30, "Available"),
  ];
}
