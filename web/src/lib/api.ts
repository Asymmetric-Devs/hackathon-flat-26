import "server-only";
import { NextResponse } from "next/server";
import { isAuthed } from "./auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAuth() {
  return (await isAuthed()) ? null : jsonError("Sesión vencida. Volvé a entrar al panel.", 401);
}

/** Traduce errores de red y del contrato a algo que el fiscalizador entienda. */
export function describeChainError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  if (/Error\(Contract, #1\)|ArtisanNotFound/.test(text)) return "El artesano no está registrado en el contrato.";
  if (/Error\(Contract, #2\)|PieceNotFound/.test(text)) return "La pieza no existe en el contrato.";
  if (/Error\(Contract, #3\)|MasterNotFound/.test(text)) return "El maestro elegido no está registrado en el contrato.";
  if (/Error\(Contract, #4\)|AlreadyRevoked/.test(text)) return "Ese certificado ya estaba revocado.";
  if (/Falta la variable/.test(text)) return text;
  return `No se pudo firmar en Stellar: ${text.slice(0, 240)}`;
}

export function text(form: FormData, key: string, max = 2000) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function optionalInt(form: FormData, key: string) {
  const raw = text(form, key, 12);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}
