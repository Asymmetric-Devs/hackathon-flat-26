import { NextResponse } from "next/server";
import { endSession, passwordMatches, startSession } from "@/lib/auth";
import { jsonError, text } from "@/lib/api";

/** Entrar al panel. */
export async function POST(request: Request) {
  const form = await request.formData();
  if (!passwordMatches(text(form, "password", 200))) return jsonError("Contraseña incorrecta.", 401);
  await startSession();
  return NextResponse.json({ ok: true });
}

/** Salir del panel. */
export async function DELETE() {
  await endSession();
  return NextResponse.json({ ok: true });
}
