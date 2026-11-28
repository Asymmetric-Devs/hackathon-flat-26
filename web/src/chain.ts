import { Account, Address, BASE_FEE, Contract, nativeToScVal, rpc, scValToNative, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { CONTRACT_ID, PASSPHRASE, READ_ACCOUNT, RPC_URL } from "./config";
import type { Signer } from "./wallet";

const server = new rpc.Server(RPC_URL);
const muro = () => new Contract(CONTRACT_ID);

export type Status = "Available" | "Hung" | "Returning" | "Sold" | "Lost";
export type Outcome = "Returned" | "Bought" | "Seized";
export type Work = { id: number; artist: string; owner: string; price: bigint; rate: bigint; deposit: bigint; meta: string; status: Status };
export type Lease = { venue: string; start: bigint; from: bigint; prepaid: bigint; paid: bigint; deposit: bigint; ended_at: bigint };
export type Record = { venue: string; start: bigint; end: bigint; paid: bigint; outcome: Outcome };
export type Entry = { work: Work; lease: Lease | null; history: Record[]; tips: bigint };

const u32 = (n: number) => nativeToScVal(n, { type: "u32" });
const i128 = (n: bigint) => nativeToScVal(n, { type: "i128" });
const str = (s: string) => nativeToScVal(s, { type: "string" });
const addr = (a: string) => new Address(a).toScVal();
/** Los enums sin datos llegan como ["Variante"]. */
const tag = <T extends string>(v: unknown): T => (Array.isArray(v) ? v[0] : v) as T;

async function read<T>(method: string, ...args: xdr.ScVal[]): Promise<T> {
  const tx = new TransactionBuilder(new Account(READ_ACCOUNT, "0"), { fee: BASE_FEE, networkPassphrase: PASSPHRASE })
    .addOperation(muro().call(method, ...args)).setTimeout(30).build();
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  const ok = sim as rpc.Api.SimulateTransactionSuccessResponse;
  return (ok.result ? scValToNative(ok.result.retval) : undefined) as T;
}

/** Códigos de error del contrato, traducidos para quien usa la app. */
const ERRORS: { [k: string]: string } = {
  NotFound: "Esa obra no existe.", BadState: "La obra no está en un estado que permita esto.", BadAmount: "El monto no es válido.",
  Early: "Todavía es pronto: no pasó el plazo de gracia.", Unauthorized: "Esta cuenta no puede hacer eso en esta obra.", BadMeta: "Los datos de la obra son demasiado largos.",
};
/** Mismo orden que `enum Error` del contrato (el RPC devuelve solo el número: Error(Contract, #N)). */
const CODES: { [n: string]: keyof typeof ERRORS } = { "1": "NotFound", "2": "BadState", "3": "BadAmount", "4": "Early", "5": "Unauthorized", "6": "BadMeta" };
function explain(raw: string): string {
  const hit = /Error\(Contract, #(\d+)\)/.exec(raw);
  if (hit) return ERRORS[CODES[hit[1]]] ?? `El contrato rechazó la operación (código ${hit[1]}).`;
  for (const k of Object.keys(ERRORS)) if (raw.includes(k)) return ERRORS[k];
  if (/insufficient|underfunded|balance/i.test(raw)) return "No alcanza el saldo de esta cuenta. En Testnet podés fondearla con Friendbot.";
  return raw.length > 220 ? raw.slice(0, 220) + "…" : raw;
}

export async function submit(who: Signer, method: string, ...args: xdr.ScVal[]): Promise<string> {
  try {
    const acct = await server.getAccount(who.address);
    const built = new TransactionBuilder(acct, { fee: BASE_FEE, networkPassphrase: PASSPHRASE }).addOperation(muro().call(method, ...args)).setTimeout(60).build();
    const prepared = await server.prepareTransaction(built);
    const signed = await who.sign(prepared.toXDR());
    const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signed, PASSPHRASE));
    if (sent.status === "TRY_AGAIN_LATER") throw new Error("La red está ocupada en este momento. Probá de nuevo en unos segundos.");
    if (sent.status === "ERROR") throw new Error("La red rechazó la transacción.");
    for (let i = 0; i < 40; i++) {
      const r = await server.getTransaction(sent.hash);
      if (r.status === "SUCCESS") return sent.hash;
      if (r.status === "FAILED") throw new Error("La transacción falló en la red.");
      await new Promise((res) => setTimeout(res, 1000));
    }
    throw new Error("Se agotó el tiempo esperando la confirmación.");
  } catch (e) {
    throw new Error(explain(e instanceof Error ? e.message : String(e)));
  }
}

export const count = () => read<number>("count").then(Number);
const norm = (w: Work): Work => ({ ...w, status: tag<Status>(w.status) });
const normR = (r: Record): Record => ({ ...r, outcome: tag<Outcome>(r.outcome) });

export async function loadEntry(id: number): Promise<Entry> {
  const [work, lease, history, tips] = await Promise.all([
    read<Work>("work", u32(id)), read<Lease | null | undefined>("lease", u32(id)), read<Record[]>("history", u32(id)), read<bigint>("tips", u32(id)),
  ]);
  return { work: norm({ ...work, id }), lease: lease ?? null, history: (history ?? []).map(normR), tips: BigInt(tips ?? 0) };
}
export async function loadAll(): Promise<Entry[]> {
  const n = await count();
  return Promise.all(Array.from({ length: n }, (_, i) => loadEntry(i)));
}
export const getAccrued = (id: number) => read<bigint>("accrued", u32(id)).then(BigInt);


export const publish = (who: Signer, price: bigint, rate: bigint, deposit: bigint, meta: string) =>
  submit(who, "publish", addr(who.address), i128(price), i128(rate), i128(deposit), str(meta));
export const hang = (who: Signer, id: number, days: number) => submit(who, "hang", addr(who.address), u32(id), u32(days));
export const topUp = (who: Signer, id: number, days: number) => submit(who, "top_up", addr(who.address), u32(id), u32(days));
export const claim = (who: Signer, id: number) => submit(who, "claim", u32(id));
export const buyNow = (who: Signer, id: number) => submit(who, "buy_now", addr(who.address), u32(id));
export const stop = (who: Signer, id: number) => submit(who, "stop", addr(who.address), u32(id));
export const confirmReturn = (who: Signer, id: number) => submit(who, "confirm_return", addr(who.address), u32(id));
export const seize = (who: Signer, id: number) => submit(who, "seize", addr(who.address), u32(id));
export const tip = (who: Signer, id: number, amount: bigint) => submit(who, "tip", addr(who.address), u32(id), i128(amount));
