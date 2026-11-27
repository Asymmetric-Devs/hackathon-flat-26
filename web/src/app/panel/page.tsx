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
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel de la asociación", robots: { index: false } };

export default async function PanelPage() {
  if (!(await isAuthed())) {
    return (
      <div className="wrap page">
        <div className="card login stack" style={{ ["--gap" as string]: "1.5rem", marginInline: "auto" }}>
          <LogoMark size={40} />
          <div className="stack" style={{ ["--gap" as string]: "0.5rem" }}>
            <h1 className="h3" style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
              Panel de la asociación
            </h1>
            <p className="muted">Para registrar artesanos y emitir certificados. Solo la asociación puede firmar.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  const [artisans, pieces] = await Promise.all([store.listArtisans(), store.listPieces()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));
  const revoked = pieces.filter((p) => p.record.revokeTxHash).length;

  return (
    <div className="wrap page">
      <header className="page-head" style={{ maxWidth: "none" }}>
        <span className="kicker">Asociación de artesanos</span>
        <div className="cluster" style={{ justifyContent: "space-between" }}>
          <h1 className="h1">Panel de certificación</h1>
          <div className="btn-row">
            <Link className="btn btn-brand" href="/panel/piezas/nueva">
              <Icon name="stamp" size={18} /> Certificar pieza
            </Link>
            <Link className="btn btn-secondary" href="/panel/artesanos/nuevo">
              Registrar artesano
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="panel-stats">
        <div className="panel-stat">
          <span className="faint small">Certificados vigentes</span>
          <strong>{pieces.length - revoked}</strong>
        </div>
        <div className="panel-stat">
          <span className="faint small">Revocados</span>
          <strong>{revoked}</strong>
        </div>
        <div className="panel-stat">
          <span className="faint small">Artesanos</span>
          <strong>{artisans.length}</strong>
        </div>
      </div>

      <section className="panel-block">
        <div className="panel-block-head">
          <h2 className="h3">Certificados</h2>
        </div>
        {pieces.length === 0 ? (
          <div className="empty">Todavía no emitiste certificados.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Pieza</th>
                  <th>Artesano</th>
                  <th>Emitido</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...pieces].reverse().map((p) => (
                  <tr key={p.record.id}>
                    <td className="num faint">{catalogNumber(p.record.id)}</td>
                    <td>
                      <Link href={`/p/${p.record.id}`}>{p.meta.title}</Link>
                    </td>
                    <td>{names.get(p.meta.artisanId)}</td>
                    <td className="muted">{formatDate(p.record.createdAt)}</td>
                    <td>
                      {p.record.revokeTxHash ? (
                        <span className="badge">Revocado</span>
                      ) : (
                        <span className="badge badge-ok">
                          <span className="dot" /> Vigente
                        </span>
                      )}
                    </td>
                    <td className="row-actions">
                      <Link className="link" href={`/p/${p.record.id}/etiqueta`}>
                        Etiqueta
                      </Link>
                      {p.record.revokeTxHash ? null : <RevokeButton id={p.record.id} />}
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
          <h2 className="h3">Artesanos</h2>
        </div>
        {artisans.length === 0 ? (
          <div className="empty">Empezá registrando a un artesano.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Oficio</th>
                  <th>Aprendió de</th>
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
                        Certificar pieza
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
        <h2 className="h3">Cuenta firmante</h2>
        <div className="card card-flush">
          <dl className="kv">
            <div>
              <dt>Asociación</dt>
              <dd>
                <a className="mono link" href={explorer.account(associationPublicKey())}>
                  {shortHash(associationPublicKey(), 8)} ↗
                </a>
              </dd>
            </div>
            <div>
              <dt>Contrato</dt>
              <dd>
                <a className="mono link" href={explorer.contract(config.contractId)}>
                  {shortHash(config.contractId, 8)} ↗
                </a>
              </dd>
            </div>
            <div>
              <dt>Custodia</dt>
              <dd className="muted">
                La clave de la asociación vive en el servidor de Oficio. Nadie en el panel ve ni maneja una wallet.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
