import "server-only";
import { Keypair, contract } from "@stellar/stellar-sdk";
import { config } from "./config";
import type { ChainArtisan, ChainPiece } from "./types";

/**
 * Cliente del contrato `sello`. Firma con la clave de la asociación, que vive
 * solo en el servidor: el fiscalizador nunca ve una wallet.
 */

type ResultLike<T> = {
  isOk(): boolean;
  isErr(): boolean;
  unwrap(): T;
  unwrapErr(): { message?: string };
};

type Assembled<T> = {
  result: T | ResultLike<T>;
  signAndSend(): Promise<{
    result: T | ResultLike<T>;
    sendTransactionResponse?: { hash: string };
    getTransactionResponse?: { txHash?: string };
  }>;
};

type SelloClient = {
  register_artisan(args: { meta_hash: Buffer; master: number | undefined }): Promise<Assembled<number>>;
  issue(args: { artisan: number; photo_hash: Buffer; meta_hash: Buffer }): Promise<Assembled<number>>;
  revoke(args: { id: number }): Promise<Assembled<void>>;
  artisan(args: { id: number }): Promise<Assembled<RawArtisan>>;
  piece(args: { id: number }): Promise<Assembled<RawPiece>>;
  artisan_count(): Promise<Assembled<number>>;
  piece_count(): Promise<Assembled<number>>;
};

type RawArtisan = { meta_hash: Buffer; master?: number | null; registered_at: bigint | number };
type RawPiece = {
  artisan: number;
  photo_hash: Buffer;
  meta_hash: Buffer;
  issued_at: bigint | number;
  revoked: boolean;
};

export class ContractError extends Error {}

let clientPromise: Promise<SelloClient> | null = null;

function keypair() {
  return Keypair.fromSecret(config.associationSecret);
}

export function associationPublicKey() {
  return keypair().publicKey();
}

function client(): Promise<SelloClient> {
  if (!clientPromise) {
    const kp = keypair();
    const { signTransaction } = contract.basicNodeSigner(kp, config.networkPassphrase);
    clientPromise = contract.Client.from({
      contractId: config.contractId,
      networkPassphrase: config.networkPassphrase,
      rpcUrl: config.rpcUrl,
      publicKey: kp.publicKey(),
      signTransaction,
    }).then((c) => c as unknown as SelloClient);
    clientPromise.catch(() => {
      clientPromise = null;
    });
  }
  return clientPromise;
}

function isResult<T>(value: unknown): value is ResultLike<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ResultLike<T>).isErr === "function" &&
    typeof (value as ResultLike<T>).unwrap === "function"
  );
}

function unwrap<T>(value: T | ResultLike<T>): T {
  if (isResult<T>(value)) {
    if (value.isErr()) throw new ContractError(value.unwrapErr().message ?? "Error del contrato");
    return value.unwrap();
  }
  return value;
}

async function send<T>(tx: Assembled<T>): Promise<{ value: T; txHash: string }> {
  const sent = await tx.signAndSend();
  const txHash = sent.sendTransactionResponse?.hash ?? sent.getTransactionResponse?.txHash ?? "";
  return { value: unwrap(sent.result), txHash };
}

/** Lecturas: simulación sin firmar. `null` si el id no existe en el contrato. */
async function read<T>(tx: Promise<Assembled<T>>): Promise<T | null> {
  try {
    return unwrap((await tx).result);
  } catch (error) {
    if (error instanceof ContractError || /Error\(Contract, #[12]\)/.test(String(error))) return null;
    throw error;
  }
}

const toNumber = (v: bigint | number) => Number(v);
const toHex = (b: Buffer | Uint8Array) => Buffer.from(b).toString("hex");

export async function registerArtisan(metaHash: Buffer, master: number | null) {
  const c = await client();
  const { value, txHash } = await send(await c.register_artisan({ meta_hash: metaHash, master: master ?? undefined }));
  return { id: Number(value), txHash };
}

export async function issuePiece(artisan: number, photoHash: Buffer, metaHash: Buffer) {
  const c = await client();
  const { value, txHash } = await send(
    await c.issue({ artisan, photo_hash: photoHash, meta_hash: metaHash }),
  );
  return { id: Number(value), txHash };
}

export async function revokePiece(id: number) {
  const c = await client();
  const { txHash } = await send(await c.revoke({ id }));
  return { txHash };
}

export async function getChainArtisan(id: number): Promise<ChainArtisan | null> {
  const c = await client();
  const raw = await read(c.artisan({ id }));
  if (!raw) return null;
  return {
    metaHash: toHex(raw.meta_hash),
    master: raw.master === undefined || raw.master === null ? null : Number(raw.master),
    registeredAt: toNumber(raw.registered_at),
  };
}

export async function getChainPiece(id: number): Promise<ChainPiece | null> {
  const c = await client();
  const raw = await read(c.piece({ id }));
  if (!raw) return null;
  return {
    artisan: Number(raw.artisan),
    photoHash: toHex(raw.photo_hash),
    metaHash: toHex(raw.meta_hash),
    issuedAt: toNumber(raw.issued_at),
    revoked: Boolean(raw.revoked),
  };
}
