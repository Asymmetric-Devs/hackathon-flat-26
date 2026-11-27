import "server-only";
import { sha256Hex } from "./hash";
import { getChainArtisan, getChainPiece } from "./stellar";
import { store, type StoredArtisan, type StoredPiece } from "./store";
import type { ChainPiece } from "./types";

export type PieceStatus = "vigente" | "revocado" | "alterado" | "desconocido";

export type PieceVerification = {
  status: PieceStatus;
  chain: ChainPiece | null;
  photoHash: string | null;
  metaHash: string | null;
  photoMatches: boolean;
  metaMatches: boolean;
  /** Error al consultar la red, si lo hubo. */
  networkError: string | null;
};

export async function verifyPiece(stored: StoredPiece): Promise<PieceVerification> {
  const photo = await store.getPhoto(stored.record.id);
  const photoHash = photo ? sha256Hex(photo.bytes) : null;
  const metaHash = sha256Hex(stored.metaBytes);

  let chain: ChainPiece | null = null;
  let networkError: string | null = null;
  try {
    chain = await getChainPiece(stored.record.id);
  } catch (error) {
    networkError = error instanceof Error ? error.message : String(error);
  }

  const photoMatches = Boolean(chain && photoHash && chain.photoHash === photoHash);
  const metaMatches = Boolean(chain && chain.metaHash === metaHash);

  let status: PieceStatus;
  if (!chain) status = "desconocido";
  else if (chain.revoked) status = "revocado";
  else if (!photoMatches || !metaMatches || chain.artisan !== stored.meta.artisanId) status = "alterado";
  else status = "vigente";

  return { status, chain, photoHash, metaHash, photoMatches, metaMatches, networkError };
}

export type LineageLink = {
  id: number | null;
  name: string;
  craft?: string;
  since?: number | null;
  /** El vínculo con su aprendiz está firmado en el contrato. */
  onChain: boolean;
};

/**
 * Línea del oficio hacia atrás: del maestro más antiguo al artesano.
 * Sigue el `master` del contrato; si el maestro no está registrado,
 * cierra con el nombre que quedó en la ficha.
 */
export async function lineageOf(artisan: StoredArtisan): Promise<LineageLink[]> {
  const chainLinks: LineageLink[] = [];
  const seen = new Set<number>([artisan.record.id]);
  let current: StoredArtisan | null = artisan;

  for (let depth = 0; current && depth < 12; depth++) {
    let masterId: number | null = null;
    try {
      masterId = (await getChainArtisan(current.record.id))?.master ?? null;
    } catch {
      masterId = current.meta.learnedFrom?.artisanId ?? null;
    }

    if (masterId !== null && !seen.has(masterId)) {
      seen.add(masterId);
      const master = await store.getArtisan(masterId);
      chainLinks.unshift({
        id: masterId,
        name: master?.meta.name ?? `Artesano N.º ${masterId}`,
        craft: master?.meta.craft,
        since: master?.meta.since,
        onChain: true,
      });
      current = master;
      continue;
    }

    const external = current.meta.learnedFrom;
    if (external && !external.artisanId && external.name.trim()) {
      chainLinks.unshift({ id: null, name: external.name, onChain: false });
    }
    break;
  }

  return chainLinks;
}

export async function apprenticesOf(id: number): Promise<StoredArtisan[]> {
  const all = await store.listArtisans();
  return all.filter((a) => a.meta.learnedFrom?.artisanId === id);
}
