import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { LogoMark } from "@/components/Logo";
import { LogoutButton, RevokeButton } from "@/components/panel/Actions";
import { LoginForm } from "@/components/panel/LoginForm";
import { isAuthed } from "@/lib/auth";
import { config, explorer } from "@/lib/config";
import { catalogNumber, formatDate, shortHash } from "@/lib/format";
import { associationPublicKey } from "@/lib/stellar";
import { getDict } from "@/lib/i18n/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.panel.loginTitle, robots: { index: false } };
}

export default async function PanelPage() {
  const { lang, t } = await getDict();
  const p = t.panel;
  if (!(await isAuthed())) {
    return (
      <div className="wrap page">
        <div className="card login stack" style={{ ["--gap" as string]: "1.5rem", marginInline: "auto" }}>
          <LogoMark size={40} />
          <div className="stack" style={{ ["--gap" as string]: "0.5rem" }}>
            <h1 className="h3" style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
              {p.loginTitle}
            </h1>
            <p className="muted">{p.loginLead}</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  const [artisans, pieces] = await Promise.all([store.listArtisans(), store.listPieces()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));
  const revoked = pieces.filter((x) => x.record.revokeTxHash).length;

  return (
    <div className="wrap page">
      <header className="page-head" style={{ maxWidth: "none" }}>
        <span className="kicker">{p.kicker}</span>
        <div className="cluster" style={{ justifyContent: "space-between" }}>
          <h1 className="h1">{p.title}</h1>
          <div className="btn-row">
            <Link className="btn btn-brand" href="/panel/piezas/nueva">
              <Icon name="stamp" size={18} /> {p.certify}
            </Link>
            <Link className="btn btn-secondary" href="/panel/artesanos/nuevo">
              {p.register}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="panel-stats">
        <div className="panel-stat">
          <span className="faint small">{p.statValid}</span>
          <strong>{pieces.length - revoked}</strong>
        </div>
        <div className="panel-stat">
          <span className="faint small">{p.statRevoked}</span>
          <strong>{revoked}</strong>
        </div>
        <div className="panel-stat">
          <span className="faint small">{p.statArtisans}</span>
          <strong>{artisans.length}</strong>
        </div>
      </div>

      <section className="panel-block">
        <div className="panel-block-head">
          <h2 className="h3">{p.certificates}</h2>
        </div>
        {pieces.length === 0 ? (
          <div className="empty">{p.noCertificates}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {p.certCols.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...pieces].reverse().map((piece) => (
                  <tr key={piece.record.id}>
                    <td className="num faint">{catalogNumber(piece.record.id, lang)}</td>
                    <td>
                      <Link href={`/p/${piece.record.id}`}>{piece.meta.title}</Link>
                    </td>
                    <td>{names.get(piece.meta.artisanId)}</td>
                    <td className="muted">{formatDate(piece.record.createdAt, lang)}</td>
                    <td>
                      {piece.record.revokeTxHash ? (
                        <span className="badge">{t.piece.revoked}</span>
                      ) : (
                        <span className="badge badge-ok">
                          <span className="dot" /> {t.piece.stateValid}
                        </span>
                      )}
                    </td>
                    <td className="row-actions">
                      <Link className="link" href={`/p/${piece.record.id}/etiqueta`}>
                        {p.label}
                      </Link>
                      {piece.record.revokeTxHash ? null : <RevokeButton id={piece.record.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-block">
        <div className="panel-block-head">
          <h2 className="h3">{p.artisans}</h2>
        </div>
        {artisans.length === 0 ? (
          <div className="empty">{p.noArtisans}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {p.artisanCols.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {artisans.map((a) => (
                  <tr key={a.record.id}>
                    <td>
                      <Link href={`/a/${a.record.id}`}>{a.meta.name}</Link>
                    </td>
                    <td>{a.meta.craft}</td>
                    <td className="muted">{a.meta.learnedFrom?.name || "—"}</td>
                    <td className="row-actions">
                      <Link className="link" href={`/panel/piezas/nueva?artesano=${a.record.id}`}>
                        {p.certifyFor}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-block">
        <h2 className="h3">{p.signer}</h2>
        <div className="card card-flush">
          <dl className="kv">
            <div>
              <dt>{p.association}</dt>
              <dd>
                <a className="mono link" href={explorer.account(associationPublicKey())}>
                  {shortHash(associationPublicKey(), 8)} ↗
                </a>
              </dd>
            </div>
            <div>
              <dt>{p.contract}</dt>
              <dd>
                <a className="mono link" href={explorer.contract(config.contractId)}>
                  {shortHash(config.contractId, 8)} ↗
                </a>
              </dd>
            </div>
            <div>
              <dt>{p.custody}</dt>
              <dd className="muted">
                {p.custodyText}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
