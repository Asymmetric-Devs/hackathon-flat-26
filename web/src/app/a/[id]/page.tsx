import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Lineage } from "@/components/Lineage";
import { PieceCard } from "@/components/PieceCard";
import { explorer } from "@/lib/config";
import { formatDate, shortHash } from "@/lib/format";
import { store } from "@/lib/store";
import { apprenticesOf, lineageOf } from "@/lib/verify";

export const dynamic = "force-dynamic";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: PageProps<"/a/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const artisan = id ? await store.getArtisan(id) : null;
  return { title: artisan?.meta.name ?? "Artesano" };
}

export default async function ArtisanPage({ params }: PageProps<"/a/[id]">) {
  const id = parseId((await params).id);
  if (!id) notFound();
  const artisan = await store.getArtisan(id);
  if (!artisan) notFound();

  const [lineage, apprentices, pieces] = await Promise.all([
    lineageOf(artisan),
    apprenticesOf(id),
    store.listPieces(),
  ]);
  const own = pieces.filter((p) => p.meta.artisanId === id).reverse();
  const { meta, record } = artisan;

  return (
    <article className="wrap piece">
      <header className="piece-head">
        <p className="label">{[meta.craft, meta.stall, meta.city].filter(Boolean).join(" · ")}</p>
        <h1 className="title">{meta.name}</h1>
        {meta.bio ? <p className="lede">{meta.bio}</p> : null}
      </header>

      <section className="section-tight">
        <div className="section-head">
          <p className="label">Línea del oficio</p>
          <div className="stack" style={{ ["--stack" as string]: "1.25rem" }}>
            <h2 className="subtitle">De quién aprendió</h2>
            <Lineage
              links={[...lineage, { id, name: meta.name, craft: meta.craft, since: meta.since, onChain: true }]}
              current={id}
            />
            {meta.learnedFrom?.note ? <p className="muted prose">{meta.learnedFrom.note}</p> : null}
            {apprentices.length > 0 ? (
              <div className="stack" style={{ ["--stack" as string]: "0.5rem" }}>
                <p className="label">Aprendices registrados</p>
                <ul className="plain-list">
                  {apprentices.map((a) => (
                    <li key={a.record.id}>
                      <Link href={`/a/${a.record.id}`}>{a.meta.name}</Link>
                      <span className="muted"> · {a.meta.craft}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="section-head">
          <p className="label">Piezas certificadas</p>
          <div className="stack">
            <h2 className="subtitle">{own.length === 1 ? "1 pieza" : `${own.length} piezas`}</h2>
            {own.length > 0 ? (
              <div className="grid">
                {own.map((piece) => (
                  <PieceCard key={piece.record.id} piece={piece} />
                ))}
              </div>
            ) : (
              <p className="muted">Todavía no tiene piezas certificadas.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="section-head">
          <p className="label">Registro</p>
          <div className="ledger">
            <div className="ledger-row">
              <span className="label">Registrado</span>
              <span>{formatDate(record.createdAt)} por la asociación</span>
            </div>
            <div className="ledger-row">
              <span className="label">Transacción</span>
              <a className="mono" href={explorer.tx(record.txHash)}>
                {shortHash(record.txHash, 10)} ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
