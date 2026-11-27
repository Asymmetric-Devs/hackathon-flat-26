/** Ficha del artesano. Se guarda como JSON; su sha256 va al contrato. */
export type ArtisanMeta = {
  name: string;
  craft: string;
  stall: string;
  city: string;
  bio: string;
  since: number | null;
  learnedFrom: {
    artisanId: number | null;
    name: string;
    note: string;
  } | null;
};

/** Ficha de la pieza. Se guarda como JSON; su sha256 va al contrato. */
export type PieceMeta = {
  title: string;
  technique: string;
  materials: string;
  year: number | null;
  story: string;
  artisanId: number;
};

export type ArtisanRecord = {
  id: number;
  txHash: string;
  createdAt: string;
};

export type PieceRecord = {
  id: number;
  txHash: string;
  createdAt: string;
  photoFile: string;
  photoType: string;
  revokeTxHash?: string;
};

/** Lo que guarda el contrato, ya convertido a tipos de JS. */
export type ChainArtisan = {
  metaHash: string; // hex
  master: number | null;
  registeredAt: number; // segundos unix
};

export type ChainPiece = {
  artisan: number;
  photoHash: string; // hex
  metaHash: string; // hex
  issuedAt: number; // segundos unix
  revoked: boolean;
};
