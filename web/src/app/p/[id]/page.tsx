import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lineage } from "@/components/Lineage";
import { Seal } from "@/components/Seal";
import { config, explorer } from "@/lib/config";
import { catalogNumber, formatDate, shortHash } from "@/lib/format";
import { store } from "@/lib/store";
import { lineageOf, statusCopy, verifyPiece } from "@/lib/verify";

export const dynamic = "force-dynamic";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const piece = id ? await store.getPiece(id) : null;
  return { title: piece ? `${piece.meta.title} · ${catalogNumber(id!)}` : "Pieza" };
}

export default async function PiecePage({ params }: PageProps<"/p/[id]">) {
  const id = parseId((await params).id);
  if (!id) notFound();
  const piece = await store.getPiece(id);
  if (!piece) notFound();

  const [artisan, verification] = await Promise.all([store.getArtisan(piece.meta.artisanId), verifyPiece(piece)]);
  const lineage = artisan ? await lineageOf(artisan) : [];
  const { meta, record } = piece;
  const copy = statusCopy[verification.status];

  return (
    <article className="wrap piece">
      <header className="piece-head">
        <p className="label catalog">
          {catalogNumber(id)} · Certificado de origen
        </p>
        <h1 className="title">{meta.title}</h1>
        {artisan ? (
          <p className="lede" style={{ margin: 0 }}>
            Por <Link href={`/a/${artisan.record.id}`}>{artisan.meta.name}</Link>
            {artisan.meta.stall ? `, ${artisan.meta.stall}` : ""}
          </p>
        ) : null}
      </header>

      <div className="piece-grid">
        <figure className="piece-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/files/pieces/${id}`} alt={meta.title} />
          <figcaption className="label">Foto registrada al certificar</figcaption>
        </figure>

        <div className="piece-body">
          <section className={`verdict verdict-${verification.status}`} aria-live="polite">
            <Seal number={id} size={104} muted={verification.status !== "vigente"} />
            <div className="stack" style={{ ["--stack" as string]: "0.4rem" }}>
              <span className={`status status-${verification.status}`}>{copy.label}</span>
              <p style={{ margin: 0 }}>{copy.text}</p>
            </div>
          </section>

          <dl className="ficha">
            <div className="ficha-row">
              <dt className="label">Técnica</dt>
              <dd>{meta.technique}</dd>
            </div>
            <div className="ficha-row">
              <dt className="label">Materiales</dt>
              <dd>{meta.materials}</dd>
            </div>
            {meta.year ? (
              <div className="ficha-row">
                <dt className="label">Año</dt>
                <dd>{meta.year}</dd>
              </div>
            ) : null}
            {artisan ? (
              <div className="ficha-row">
                <dt className="label">Puesto</dt>
                <dd>
                  {artisan.meta.stall}
                  {artisan.meta.city ? ` · ${artisan.meta.city}` : ""}
                </dd>
              </div>
            ) : null}
            <div className="ficha-row">
              <dt className="label">Certificado</dt>
              <dd>
                {verification.chain ? formatDate(verification.chain.issuedAt) : formatDate(record.createdAt)} por la
                asociación de artesanos
              </dd>
            </div>
          </dl>

          {meta.story ? (
            <div className="prose">
              <p className="label">La pieza</p>
              <p>{meta.story}</p>
            </div>
          ) : null}
        </div>
      </div>

      {artisan ? (
        <section className="section-tight">
          <div className="section-head">
            <p className="label">Línea del oficio</p>
            <div className="stack">
              <h2 className="subtitle">De quién viene esta técnica</h2>
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
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-tight">
        <div className="section-head">
          <p className="label">Verificación</p>
          <div className="stack">
            <h2 className="subtitle">Lo que dice Stellar</h2>
            <div className="ledger">
              <div className="ledger-row">
                <span className="label">Estado en el contrato</span>
                <span className="mono">
                  {verification.chain ? (verification.chain.revoked ? "revocado" : "vigente") : "sin leer"}
                </span>
              </div>
              <div className="ledger-row">
                <span className="label">Huella de la foto</span>
                <span className="mono">
                  {verification.photoHash ? shortHash(verification.photoHash, 10) : "—"}{" "}
                  <Check ok={verification.photoMatches} />
                </span>
              </div>
              <div className="ledger-row">
                <span className="label">Huella de la ficha</span>
                <span className="mono">
                  {verification.metaHash ? shortHash(verification.metaHash, 10) : "—"}{" "}
                  <Check ok={verification.metaMatches} />
                </span>
              </div>
              <div className="ledger-row">
                <span className="label">Transacción</span>
                <a className="mono" href={explorer.tx(record.txHash)}>
                  {shortHash(record.txHash, 10)} ↗
                </a>
              </div>
              {record.revokeTxHash ? (
                <div className="ledger-row">
                  <span className="label">Revocación</span>
                  <a className="mono" href={explorer.tx(record.revokeTxHash)}>
                    {shortHash(record.revokeTxHash, 10)} ↗
                  </a>
                </div>
              ) : null}
              <div className="ledger-row">
                <span className="label">Contrato</span>
                <a className="mono" href={explorer.contract(config.contractId)}>
                  {shortHash(config.contractId, 8)} ↗
                </a>
              </div>
            </div>
            {verification.networkError ? (
              <p className="notice">No se pudo consultar la red: {verification.networkError}</p>
            ) : null}
            <p className="muted" style={{ fontSize: "0.98rem", margin: 0 }}>
              La huella es un resumen matemático (sha256) de la foto y la ficha. La asociación la guardó en Stellar al
              certificar; esta página la vuelve a calcular cada vez que se abre y la compara.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}

function Check({ ok }: { ok: boolean }) {
  return (
    <span className={ok ? "check check-ok" : "check check-bad"}>{ok ? "coincide" : "no coincide"}</span>
  );
}
