import type { Metadata } from "next";
import { PieceCard } from "@/components/PieceCard";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Piezas" };

export default async function PiecesPage() {
  const [pieces, artisans] = await Promise.all([store.listPieces(), store.listArtisans()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));

  return (
    <div className="wrap piece">
      <header className="piece-head">
        <p className="label">Catálogo</p>
        <h1 className="title">Piezas certificadas</h1>
        <p className="lede">
          Cada una tiene un certificado firmado por la asociación de artesanos. Tocá una para ver su origen y
          comprobarlo.
        </p>
      </header>
      {pieces.length === 0 ? (
        <p className="muted">Todavía no hay piezas certificadas.</p>
      ) : (
        <div className="grid">
          {[...pieces].reverse().map((piece) => (
            <PieceCard key={piece.record.id} piece={piece} artisanName={names.get(piece.meta.artisanId)} />
          ))}
        </div>
      )}
    </div>
  );
}
