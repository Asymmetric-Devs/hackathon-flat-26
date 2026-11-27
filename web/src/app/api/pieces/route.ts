import { NextResponse } from "next/server";
import { describeChainError, jsonError, optionalInt, requireAuth, text } from "@/lib/api";
import { sha256 } from "@/lib/hash";
import { issuePiece } from "@/lib/stellar";
import { store } from "@/lib/store";
import type { PieceMeta } from "@/lib/types";

const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const form = await request.formData();
  const artisanId = optionalInt(form, "artisanId");
  const title = text(form, "title", 160);
  const technique = text(form, "technique", 200);
  const photo = form.get("photo");

  if (artisanId === null || !(await store.getArtisan(artisanId))) return jsonError("Elegí un artesano registrado.");
  if (!title || !technique) return jsonError("Título y técnica son obligatorios.");
  if (!(photo instanceof File) || photo.size === 0) return jsonError("Falta la foto de la pieza.");
  const ext = PHOTO_TYPES[photo.type];
  if (!ext) return jsonError("La foto tiene que ser JPG, PNG o WebP.");
  if (photo.size > MAX_PHOTO_BYTES) return jsonError("La foto pesa más de 8 MB.");

  const photoBytes = Buffer.from(await photo.arrayBuffer());
  const meta: PieceMeta = {
    title,
    technique,
    materials: text(form, "materials", 300),
    year: optionalInt(form, "year"),
    story: text(form, "story", 2000),
    artisanId,
  };
  const metaBytes = Buffer.from(JSON.stringify(meta, null, 2), "utf8");

  try {
    const { id, txHash } = await issuePiece(artisanId, sha256(photoBytes), sha256(metaBytes));
    await store.putPiece(
      { id, txHash, createdAt: new Date().toISOString(), photoFile: `photo.${ext}`, photoType: photo.type },
      metaBytes,
      photoBytes,
    );
    return NextResponse.json({ id, txHash });
  } catch (error) {
    console.error("issue", error);
    return jsonError(describeChainError(error), 502);
  }
}
