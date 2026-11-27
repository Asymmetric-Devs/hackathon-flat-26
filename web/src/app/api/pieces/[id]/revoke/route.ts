import { NextResponse } from "next/server";
import { describeChainError, jsonError, requireAuth } from "@/lib/api";
import { revokePiece } from "@/lib/stellar";
import { store } from "@/lib/store";

export async function POST(_request: Request, { params }: RouteContext<"/api/pieces/[id]/revoke">) {
  const denied = await requireAuth();
  if (denied) return denied;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || !(await store.getPiece(id))) return jsonError("La pieza no existe.", 404);

  try {
    const { txHash } = await revokePiece(id);
    await store.updatePieceRecord(id, { revokeTxHash: txHash });
    return NextResponse.json({ id, txHash });
  } catch (error) {
    console.error("revoke", error);
    return jsonError(describeChainError(error), 502);
  }
}
