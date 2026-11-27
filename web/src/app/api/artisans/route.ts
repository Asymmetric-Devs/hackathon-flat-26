import { NextResponse } from "next/server";
import { describeChainError, jsonError, optionalInt, requireAuth, text } from "@/lib/api";
import { sha256 } from "@/lib/hash";
import { registerArtisan } from "@/lib/stellar";
import { store } from "@/lib/store";
import type { ArtisanMeta } from "@/lib/types";

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const form = await request.formData();
  const name = text(form, "name", 120);
  const craft = text(form, "craft", 120);
  if (!name || !craft) return jsonError("Nombre y oficio son obligatorios.");

  const masterId = optionalInt(form, "masterId");
  if (masterId !== null && !(await store.getArtisan(masterId))) {
    return jsonError("El maestro elegido no está registrado.");
  }
  const masterName = masterId !== null ? (await store.getArtisan(masterId))!.meta.name : text(form, "masterName", 120);
  const note = text(form, "masterNote", 600);

  const meta: ArtisanMeta = {
    name,
    craft,
    stall: text(form, "stall", 120),
    city: text(form, "city", 120),
    bio: text(form, "bio", 1200),
    since: optionalInt(form, "since"),
    learnedFrom: masterId !== null || masterName ? { artisanId: masterId, name: masterName, note } : null,
  };
  const metaBytes = Buffer.from(JSON.stringify(meta, null, 2), "utf8");

  try {
    const { id, txHash } = await registerArtisan(sha256(metaBytes), masterId);
    await store.putArtisan({ id, txHash, createdAt: new Date().toISOString() }, metaBytes);
    return NextResponse.json({ id, txHash });
  } catch (error) {
    console.error("register_artisan", error);
    return jsonError(describeChainError(error), 502);
  }
}
