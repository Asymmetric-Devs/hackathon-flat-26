import "server-only";
import type { ArtisanMeta, ArtisanRecord, PieceMeta, PieceRecord } from "../types";
import { localStore } from "./local";

export type StoredArtisan = {
  record: ArtisanRecord;
  meta: ArtisanMeta;
  /** Bytes exactos de la ficha, tal como se hashearon al registrar. */
  metaBytes: Buffer;
};

export type StoredPiece = {
  record: PieceRecord;
  meta: PieceMeta;
  metaBytes: Buffer;
};

export type Photo = { bytes: Buffer; type: string };

/**
 * Dónde viven las fichas y fotos fuera de la cadena.
 * Hoy: disco local (web/.data). Para publicar en la nube alcanza con
 * otra implementación de esta interfaz (Vercel Blob, S3, Supabase…).
 */
export interface Store {
  putArtisan(record: ArtisanRecord, metaBytes: Buffer): Promise<void>;
  getArtisan(id: number): Promise<StoredArtisan | null>;
  listArtisans(): Promise<StoredArtisan[]>;

  putPiece(record: PieceRecord, metaBytes: Buffer, photo: Buffer): Promise<void>;
  getPiece(id: number): Promise<StoredPiece | null>;
  listPieces(): Promise<StoredPiece[]>;
  getPhoto(id: number): Promise<Photo | null>;
  updatePieceRecord(id: number, patch: Partial<PieceRecord>): Promise<void>;
}

export const store: Store = localStore;
