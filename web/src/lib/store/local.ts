import "server-only";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config";
import type { ArtisanMeta, ArtisanRecord, PieceMeta, PieceRecord } from "../types";
import type { Photo, Store, StoredArtisan, StoredPiece } from "./index";

function root(...parts: string[]) {
  return path.join(process.cwd(), config.dataDir, ...parts);
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

async function readBytes(file: string): Promise<Buffer | null> {
  try {
    return await readFile(file);
  } catch {
    return null;
  }
}

async function ids(kind: "artisans" | "pieces"): Promise<number[]> {
  try {
    const entries = await readdir(root(kind));
    return entries
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

async function getArtisan(id: number): Promise<StoredArtisan | null> {
  const dir = root("artisans", String(id));
  const record = await readJson<ArtisanRecord>(path.join(dir, "record.json"));
  const metaBytes = await readBytes(path.join(dir, "meta.json"));
  if (!record || !metaBytes) return null;
  return { record, metaBytes, meta: JSON.parse(metaBytes.toString("utf8")) as ArtisanMeta };
}

async function getPiece(id: number): Promise<StoredPiece | null> {
  const dir = root("pieces", String(id));
  const record = await readJson<PieceRecord>(path.join(dir, "record.json"));
  const metaBytes = await readBytes(path.join(dir, "meta.json"));
  if (!record || !metaBytes) return null;
  return { record, metaBytes, meta: JSON.parse(metaBytes.toString("utf8")) as PieceMeta };
}

export const localStore: Store = {
  async putArtisan(record, metaBytes) {
    const dir = root("artisans", String(record.id));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "meta.json"), metaBytes);
    await writeFile(path.join(dir, "record.json"), JSON.stringify(record, null, 2));
  },

  getArtisan,

  async listArtisans() {
    const all = await Promise.all((await ids("artisans")).map(getArtisan));
    return all.filter((a): a is StoredArtisan => a !== null);
  },

  async putPiece(record, metaBytes, photo) {
    const dir = root("pieces", String(record.id));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, record.photoFile), photo);
    await writeFile(path.join(dir, "meta.json"), metaBytes);
    await writeFile(path.join(dir, "record.json"), JSON.stringify(record, null, 2));
  },

  getPiece,

  async listPieces() {
    const all = await Promise.all((await ids("pieces")).map(getPiece));
    return all.filter((p): p is StoredPiece => p !== null);
  },

  async getPhoto(id): Promise<Photo | null> {
    const piece = await getPiece(id);
    if (!piece) return null;
    const bytes = await readBytes(root("pieces", String(id), piece.record.photoFile));
    return bytes ? { bytes, type: piece.record.photoType } : null;
  },

  async updatePieceRecord(id, patch) {
    const file = root("pieces", String(id), "record.json");
    const current = await readJson<PieceRecord>(file);
    if (!current) throw new Error(`No existe la pieza ${id} en el almacenamiento`);
    await writeFile(file, JSON.stringify({ ...current, ...patch }, null, 2));
  },
};

export type { ArtisanMeta, PieceMeta };
