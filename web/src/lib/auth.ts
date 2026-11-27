import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { config } from "./config";

const COOKIE = "hilo_panel";

function token() {
  return createHmac("sha256", config.panelPassword).update("hilo-panel-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordMatches(input: string) {
  return safeEqual(input, config.panelPassword);
}

export async function startSession() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthed() {
  const value = (await cookies()).get(COOKIE)?.value;
  return Boolean(value && safeEqual(value, token()));
}
