import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

  const [lineage, apprentices, pieces] = await Promise.all([lineageOf(artisan), apprenticesOf(id), store.listPieces()]);
  const own = pieces.filter((p) => p.meta.artisanId === id).reverse();
  const { meta, record } = artisan;

  return (
    <article className="wrap page">
      <header className="page-head">
        <span className="kicker">{[meta.craft, meta.city].filter(Boolean).join(" · ") || "Artesano"}</span>
        <h1 className="h1">{meta.name}</h1>
        {meta.bio ? <p className="lead">{meta.bio}</p> : null}
        <div className="cluster">
          {meta.stall ? <span className="badge">{meta.stall}</span> : null}
          {meta.since ? <span className="badge num">En el oficio desde {meta.since}</span> : null}
          <span className="badge badge-ok">
            <span className="dot" /> Registrado por la asociación
          </span>
        </div>
      </header>

      <div className="report">
        <section className="card stack" style={{ ["--gap" as string]: "1.1rem" }}>
          <h2 className="card-title">De quién aprendió</h2>
          <Lineage
            links={[...lineage, { id, name: meta.name, craft: meta.craft, since: meta.since, onChain: true }]}
            current={id}
          />
          {meta.learnedFrom?.note ? <p className="muted">{meta.learnedFrom.note}</p> : null}
        </section>

        <div className="stack" style={{ ["--gap" as string]: "1.25rem" }}>
          <section className="card stack" style={{ ["--gap" as string]: "0.75rem" }}>
            <h2 className="card-title">A quién le enseñó</h2>
            {apprentices.length > 0 ? (
              <ul className="plain-list">
                {apprentices.map((a) => (
                  <li key={a.record.id}>
                    <Link className="link" href={`/a/${a.record.id}`}>
                      {a.meta.name}
                    </Link>
                    <span className="faint"> · {a.meta.craft}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Todavía no tiene aprendices registrados.</p>
            )}
          </section>
          <section className="card card-flush">
            <dl className="kv">
              <div>
                <dt>Registrado</dt>
                <dd>{formatDate(record.createdAt)}</dd>
              </div>
              <div>
                <dt>Transacción</dt>
                <dd>
                  <a className="mono link" href={explorer.tx(record.txHash)}>
                    {shortHash(record.txHash, 10)} ↗
                  </a>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <section className="stack" style={{ ["--gap" as string]: "1.25rem", marginTop: "3.5rem" }}>
        <h2 className="h2" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
          Piezas certificadas <span className="faint num">{own.length}</span>
        </h2>
        {own.length > 0 ? (
          <div className="pieces">
            {own.map((piece) => (
              <PieceCard key={piece.record.id} piece={piece} />
            ))}
          </div>
        ) : (
          <div className="empty">Todavía no tiene piezas certificadas.</div>
        )}
      </section>
    </article>
  );
}
