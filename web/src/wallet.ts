import { getNetworkDetails, isConnected, requestAccess, signTransaction as freighterSign } from "@stellar/freighter-api";
import { Keypair, Networks, rpc, TransactionBuilder } from "@stellar/stellar-sdk";
import { FRIENDBOT, PASSPHRASE, RPC_URL } from "./config";

export type Signer = { address: string; kind: "freighter" | "guest"; sign: (xdr: string) => Promise<string> };
export type WalletIssue = "missing" | "denied" | "network" | "other";
export class WalletError extends Error {
  constructor(public issue: WalletIssue, message: string) { super(message); }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));

async function detected(): Promise<boolean> {
  const attempt = () => Promise.race([isConnected().then((r) => r.isConnected), sleep(700).then(() => false)]);
  for (let i = 0; i < 4; i++) {
    try { if (await attempt()) return true; } catch { /* sin extensión */ }
    await sleep(200);
  }
  return false;
}

export async function connectFreighter(): Promise<Signer> {
  if (!(await detected())) throw new WalletError("missing", "No se detectó Freighter en este navegador.");
  const r = await requestAccess();
  if (r.error) {
    const msg = String(r.error.message ?? r.error);
    throw new WalletError(/declin|reject|denied|cancel|closed/i.test(msg) ? "denied" : "other", msg);
  }
  const net = await getNetworkDetails().catch(() => null);
  if (net && !net.error && net.networkPassphrase && net.networkPassphrase !== PASSPHRASE) {
    throw new WalletError("network", "Freighter está en otra red. Cambiala a Testnet.");
  }
  const address = r.address;
  return {
    address, kind: "freighter",
    sign: async (xdr) => {
      const s = await freighterSign(xdr, { networkPassphrase: PASSPHRASE, address });
      if (s.error) throw new Error(String(s.error.message ?? s.error));
      return s.signedTxXdr;
    },
  };
}

const GUEST_KEY = "muro.guest";
const chain = new rpc.Server(RPC_URL);

/** Fondea la cuenta con Friendbot solo si todavía no existe en la red (evita pegarle a Friendbot en cada recarga). */
async function fundIfNeeded(address: string) {
  try { await chain.getAccount(address); return; } catch { /* todavía no existe: se fondea */ }
  let last = "";
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(`${FRIENDBOT}?addr=${address}`);
      if (res.ok) return;
      last = await res.text().catch(() => "");
      if (/already|exist/i.test(last)) return; // otra llamada la fondeó un instante antes
    } catch { /* red caída: se reintenta una vez */ }
    await sleep(800);
  }
  throw new WalletError("other", "Friendbot no pudo fondear la cuenta de invitado. Probá de nuevo en un momento.");
}

async function makeGuest(): Promise<Signer> {
  let kp: Keypair | null = null;
  try { const s = localStorage.getItem(GUEST_KEY); if (s) kp = Keypair.fromSecret(s); } catch { /* sin storage o clave dañada: se crea otra */ }
  const fresh = !kp;
  if (!kp) kp = Keypair.random();
  await fundIfNeeded(kp.publicKey());
  // la clave se guarda recién cuando la cuenta existe de verdad: así no queda una cuenta sin fondos en el navegador
  if (fresh) try { localStorage.setItem(GUEST_KEY, kp.secret()); } catch { /* sin storage */ }
  const key = kp;
  return {
    address: key.publicKey(), kind: "guest",
    sign: async (xdr) => {
      const tx = TransactionBuilder.fromXDR(xdr, PASSPHRASE);
      tx.sign(key);
      return tx.toXDR();
    },
  };
}

let guest: Promise<Signer> | null = null;
/**
 * Modo invitado (solo Testnet): se crea una cuenta en el navegador y se fondea con Friendbot.
 * Existe para que cualquier persona pueda probar Muro en un minuto, sin instalar una billetera.
 * Las llamadas simultáneas comparten la misma cuenta (una sola ida a Friendbot).
 */
export function guestSigner(): Promise<Signer> {
  // La clave vive en el navegador y firma sola: solo es aceptable en la red de pruebas.
  if (PASSPHRASE !== Networks.TESTNET) return Promise.reject(new WalletError("network", "El modo invitado solo existe en Testnet."));
  if (!guest) guest = makeGuest().catch((e) => { guest = null; throw e; });
  return guest;
}
export const forgetGuest = () => { guest = null; try { localStorage.removeItem(GUEST_KEY); } catch { /* */ } };
