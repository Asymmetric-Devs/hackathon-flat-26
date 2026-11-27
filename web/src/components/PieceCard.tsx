import Link from "next/link";
import { catalogNumber } from "@/lib/format";
import type { StoredPiece } from "@/lib/store";

export function PieceCard({ piece, artisanName }: { piece: StoredPiece; artisanName?: string }) {
  const { record, meta } = piece;
  return (
    <Link href={`/p/${record.id}`} className="card">
      <div className="card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/files/pieces/${record.id}`} alt={meta.title} loading="lazy" />
      </div>
      <div className="card-meta">
        <span className="label catalog">{catalogNumber(record.id)}</span>
        {record.revokeTxHash ? <span className="status status-revocado">Revocado</span> : null}
      </div>
      <div>
        <p className="card-title" style={{ margin: 0 }}>
          {meta.title}
        </p>
        <p className="muted" style={{ margin: 0, fontSize: "0.98rem" }}>
          {artisanName ? `${artisanName} · ` : ""}
          {meta.technique}
        </p>
      </div>
    </Link>
  );
}
