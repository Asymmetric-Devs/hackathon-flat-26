import Link from "next/link";
import { catalogNumber } from "@/lib/format";
import type { StoredPiece } from "@/lib/store";

export function PieceCard({ piece, artisanName }: { piece: StoredPiece; artisanName?: string }) {
  const { record, meta } = piece;
  const revoked = Boolean(record.revokeTxHash);
  return (
    <Link href={`/p/${record.id}`} className="piece-card">
      <div className="piece-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/files/pieces/${record.id}`} alt={meta.title} loading="lazy" />
        <span className={revoked ? "badge" : "badge badge-ok"}>
          <span className="dot" />
          {revoked ? "Revocado" : "Verificado"}
        </span>
      </div>
      <div className="piece-card-body">
        <span className="faint small num">{catalogNumber(record.id)}</span>
        <p className="piece-card-title">{meta.title}</p>
        <p className="muted small">
          {artisanName ? `${artisanName} · ` : ""}
          {meta.technique}
        </p>
      </div>
    </Link>
  );
}
