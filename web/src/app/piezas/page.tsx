import type { Metadata } from "next";
import Link from "next/link";
import { PieceCard } from "@/components/PieceCard";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Piezas certificadas" };

export default async function PiecesPage() {
  const [pieces, artisans] = await Promise.all([store.listPieces(), store.listArtisans()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));

  return (
    <div className="wrap page">
      <header className="page-head">
        <span className="kicker">Catálogo</span>
        <h1 className="h1">Piezas certificadas</h1>
        <p className="lead">
          Cada una tiene un certificado firmado en Stellar por la asociación. Abrí una para ver su origen y comprobarlo.
        </p>
      </header>
      {pieces.length === 0 ? (
        <div className="empty">
          <p>Todavía no hay piezas certificadas.</p>
          <Link className="btn btn-sm" href="/panel">
            Certificar la primera
          </Link>
        </div>
      ) : (
        <div className="pieces">
          {[...pieces].reverse().map((piece) => (
            <PieceCard key={piece.record.id} piece={piece} artisanName={names.get(piece.meta.artisanId)} />
          ))}
        </div>
      )}
    </div>
  );
}
