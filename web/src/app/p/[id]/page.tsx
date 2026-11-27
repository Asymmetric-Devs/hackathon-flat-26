import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { Lineage } from "@/components/Lineage";
import { config, explorer } from "@/lib/config";
import { catalogNumber, formatDate, shortHash } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { store } from "@/lib/store";
import { lineageOf, verifyPiece, type PieceStatus } from "@/lib/verify";

export const dynamic = "force-dynamic";

const statusIcon: Record<PieceStatus, IconName> = {
  vigente: "check",
  revocado: "x",
  alterado: "alert",
  desconocido: "alert",
};

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const { lang, t } = await getDict();
  const id = parseId((await params).id);
  const piece = id ? await store.getPiece(id) : null;
  return { title: piece ? `${piece.meta.title} · ${catalogNumber(id!, lang)}` : t.piece.notFoundTitle };
}

export default async function PiecePage({ params }: PageProps<"/p/[id]">) {
  const id = parseId((await params).id);
  if (!id) notFound();
  const piece = await store.getPiece(id);
  if (!piece) notFound();

  const [{ lang, t }, artisan, verification] = await Promise.all([
    getDict(),
    store.getArtisan(piece.meta.artisanId),
    verifyPiece(piece),
  ]);
  const lineage = artisan ? await lineageOf(artisan) : [];
  const { meta, record } = piece;
  const p = t.piece;
  const [statusTitle, statusText] = t.status[verification.status];

  return (
    <article className="wrap page">
      <header className="page-head">
        <span className="kicker">
          {p.kicker} · {catalogNumber(id, lang)}
        </span>
        <h1 className="h1">{meta.title}</h1>
        {artisan ? (
          <p className="lead">
            {p.madeBy}{" "}
            <Link className="link" href={`/a/${artisan.record.id}`}>
              {artisan.meta.name}
            </Link>
            {artisan.meta.stall ? ` · ${artisan.meta.stall}` : ""}
            {artisan.meta.city ? `, ${artisan.meta.city}` : ""}
          </p>
        ) : null}
      </header>

      <div className="report">
        <div className="report-aside">
          <figure className="photo" style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/files/pieces/${id}`} alt={meta.title} />
            <figcaption className="photo-caption">
              <span>{p.photoCaption}</span>
              <span className={verification.photoMatches ? "check-ok" : "check-bad"}>
                {verification.photoMatches ? p.photoOk : p.photoBad}
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="stack" style={{ ["--gap" as string]: "1.25rem" }}>
          <section className={`verdict verdict-${verification.status}`} aria-live="polite">
            <span className="verdict-icon">
              <Icon name={statusIcon[verification.status]} size={22} stroke={2.6} />
            </span>
            <div>
              <p className="verdict-title">{statusTitle}</p>
              <p>{statusText}</p>
            </div>
          </section>

          <section className="card card-flush">
            <dl className="kv">
              <div>
                <dt>{p.technique}</dt>
                <dd>{meta.technique}</dd>
              </div>
              {meta.materials ? (
                <div>
                  <dt>{p.materials}</dt>
                  <dd>{meta.materials}</dd>
                </div>
              ) : null}
              {meta.year ? (
                <div>
                  <dt>{p.year}</dt>
                  <dd className="num">{meta.year}</dd>
                </div>
              ) : null}
              {artisan?.meta.stall ? (
                <div>
                  <dt>{p.soldAt}</dt>
                  <dd>
                    {artisan.meta.stall}
                    {artisan.meta.city ? `, ${artisan.meta.city}` : ""}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>{p.certified}</dt>
                <dd>
                  {formatDate(verification.chain ? verification.chain.issuedAt : record.createdAt, lang)}{" "}
                  {p.byAssociation}
                </dd>
              </div>
            </dl>
          </section>

          {meta.story ? (
            <section className="card stack" style={{ ["--gap" as string]: "0.5rem" }}>
              <h2 className="card-title">{p.about}</h2>
              <p className="muted">{meta.story}</p>
            </section>
          ) : null}

          {artisan ? (
            <section className="card stack" style={{ ["--gap" as string]: "1.1rem" }}>
              <h2 className="card-title">{p.lineage}</h2>
              <Lineage
                links={[
                  ...lineage,
                  {
                    id: artisan.record.id,
                    name: artisan.meta.name,
                    craft: artisan.meta.craft,
                    since: artisan.meta.since,
                    onChain: true,
                  },
                ]}
                current={artisan.record.id}
              />
            </section>
          ) : null}

          <section className="card stack" style={{ ["--gap" as string]: "0.75rem" }}>
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                {p.chainTitle}
              </h2>
              <span className="badge">
                <span className="dot dot-live" style={{ color: "var(--ok)" }} /> {p.live}
              </span>
            </div>
            <dl className="kv">
              <div>
                <dt>{p.chainState}</dt>
                <dd>
                  {verification.chain ? (verification.chain.revoked ? p.stateRevoked : p.stateValid) : p.stateUnread}
                </dd>
              </div>
              <div>
                <dt>{p.photoHash}</dt>
                <dd className="mono">
                  {verification.photoHash ? shortHash(verification.photoHash, 10) : "—"}
                  <Check ok={verification.photoMatches} yes={p.matches} no={p.noMatch} />
                </dd>
              </div>
              <div>
                <dt>{p.metaHash}</dt>
                <dd className="mono">
                  {verification.metaHash ? shortHash(verification.metaHash, 10) : "—"}
                  <Check ok={verification.metaMatches} yes={p.matches} no={p.noMatch} />
                </dd>
              </div>
              <div>
                <dt>{p.tx}</dt>
                <dd>
                  <a className="mono link" href={explorer.tx(record.txHash)}>
                    {shortHash(record.txHash, 10)} ↗
                  </a>
                </dd>
              </div>
              {record.revokeTxHash ? (
                <div>
                  <dt>{p.revokeTx}</dt>
                  <dd>
                    <a className="mono link" href={explorer.tx(record.revokeTxHash)}>
                      {shortHash(record.revokeTxHash, 10)} ↗
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>{p.contract}</dt>
                <dd>
                  <a className="mono link" href={explorer.contract(config.contractId)}>
                    {shortHash(config.contractId, 8)} ↗
                  </a>
                </dd>
              </div>
            </dl>
            {verification.networkError ? (
              <p className="notice">
                {p.networkError} {verification.networkError}
              </p>
            ) : null}
            <p className="faint small">{p.hashNote}</p>
          </section>
        </div>
      </div>
    </article>
  );
}

function Check({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span className={ok ? "check check-ok" : "check check-bad"}>
      <Icon name={ok ? "check" : "x"} size={13} stroke={3} />
      {ok ? yes : no}
    </span>
  );
}
