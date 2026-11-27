import type { Metadata } from "next";
import Link from "next/link";
import { PieceCard } from "@/components/PieceCard";
import { getDict } from "@/lib/i18n/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pieces.title };
}

export default async function PiecesPage() {
  const [{ t }, pieces, artisans] = await Promise.all([getDict(), store.listPieces(), store.listArtisans()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));

  return (
    <div className="wrap page">
      <header className="page-head">
        <span className="kicker">{t.pieces.kicker}</span>
        <h1 className="h1">{t.pieces.title}</h1>
        <p className="lead">
          {t.pieces.lead}
        </p>
      </header>
      {pieces.length === 0 ? (
        <div className="empty">
          <p>{t.pieces.empty}</p>
          <Link className="btn btn-sm" href="/panel">
            {t.pieces.emptyCta}
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
