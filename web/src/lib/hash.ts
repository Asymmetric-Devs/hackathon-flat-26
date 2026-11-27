import "server-only";
import { createHash } from "node:crypto";

export function sha256(bytes: Uint8Array): Buffer {
  return createHash("sha256").update(bytes).digest();
}

export function sha256Hex(bytes: Uint8Array): string {
  return sha256(bytes).toString("hex");
}
