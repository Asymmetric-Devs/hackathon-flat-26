import { getNetworkDetails, isConnected, requestAccess, signTransaction as freighterSign } from "@stellar/freighter-api";
import { Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { FRIENDBOT, PASSPHRASE } from "./config";

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
/**
 * Modo invitado (solo Testnet): se crea una cuenta en el navegador y se fondea con Friendbot.
 * Existe para que cualquier persona pueda probar Muro en un minuto, sin instalar una billetera.
 */
export async function guestSigner(): Promise<Signer> {
  // La clave vive en el navegador y firma sola: solo es aceptable en la red de pruebas.
  if (PASSPHRASE !== Networks.TESTNET) throw new WalletError("network", "El modo invitado solo existe en Testnet.");
  let secret: string | null = null;
  try { secret = localStorage.getItem(GUEST_KEY); } catch { /* sin storage */ }
  const fresh = !secret;
  const kp = secret ? Keypair.fromSecret(secret) : Keypair.random();
  if (fresh) try { localStorage.setItem(GUEST_KEY, kp.secret()); } catch { /* sin storage */ }
  const res = await fetch(`${FRIENDBOT}?addr=${kp.publicKey()}`);
  if (!res.ok && fresh) throw new WalletError("other", "Friendbot no pudo fondear la cuenta de invitado.");
  return {
    address: kp.publicKey(), kind: "guest",
    sign: async (xdr) => {
      const tx = TransactionBuilder.fromXDR(xdr, PASSPHRASE);
      tx.sign(kp);
      return tx.toXDR();
    },
  };
}
export const forgetGuest = () => { try { localStorage.removeItem(GUEST_KEY); } catch { /* */ } };
