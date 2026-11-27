import type { Metadata } from "next";
import Link from "next/link";
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
      <div className="wrap piece">
        <header className="piece-head">
          <p className="label">Asociación de artesanos</p>
          <h1 className="title">Panel de certificación</h1>
          <p className="lede">Para registrar artesanos y emitir certificados. Solo la asociación puede firmar.</p>
        </header>
        <LoginForm />
      </div>
    );
  }

  const [artisans, pieces] = await Promise.all([store.listArtisans(), store.listPieces()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));

  return (
    <div className="wrap piece">
      <header className="piece-head">
        <p className="label">Asociación de artesanos</p>
        <h1 className="title">Panel de certificación</h1>
        <div className="btn-row">
          <Link className="btn" href="/panel/piezas/nueva">
            Certificar una pieza
          </Link>
          <Link className="btn btn-ghost" href="/panel/artesanos/nuevo">
            Registrar artesano
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="section-tight">
        <div className="section-head">
          <p className="label">Certificados</p>
          {pieces.length === 0 ? (
            <p className="muted">Todavía no emitiste certificados.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>N.º</th>
                    <th>Pieza</th>
                    <th>Artesano</th>
                    <th>Emitido</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...pieces].reverse().map((p) => (
                    <tr key={p.record.id}>
                      <td className="catalog">{catalogNumber(p.record.id)}</td>
                      <td>
                        <Link href={`/p/${p.record.id}`}>{p.meta.title}</Link>
                      </td>
                      <td>{names.get(p.meta.artisanId)}</td>
                      <td>{formatDate(p.record.createdAt)}</td>
                      <td className="row-actions">
                        <Link href={`/p/${p.record.id}/etiqueta`}>Etiqueta</Link>
                        {p.record.revokeTxHash ? (
                          <span className="status status-revocado">Revocado</span>
                        ) : (
                          <RevokeButton id={p.record.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="section-tight">
        <div className="section-head">
          <p className="label">Artesanos</p>
          {artisans.length === 0 ? (
            <p className="muted">Empezá registrando a un artesano.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>N.º</th>
                    <th>Nombre</th>
                    <th>Oficio</th>
                    <th>Aprendió de</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {artisans.map((a) => (
                    <tr key={a.record.id}>
                      <td className="catalog">{a.record.id}</td>
                      <td>
                        <Link href={`/a/${a.record.id}`}>{a.meta.name}</Link>
                      </td>
                      <td>{a.meta.craft}</td>
                      <td>{a.meta.learnedFrom?.name || "—"}</td>
                      <td className="row-actions">
                        <Link href={`/panel/piezas/nueva?artesano=${a.record.id}`}>Certificar pieza</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="section-tight">
        <div className="section-head">
          <p className="label">Cuenta firmante</p>
          <div className="ledger">
            <div className="ledger-row">
              <span className="label">Asociación</span>
              <a className="mono" href={explorer.account(associationPublicKey())}>
                {shortHash(associationPublicKey(), 8)} ↗
              </a>
            </div>
            <div className="ledger-row">
              <span className="label">Contrato</span>
              <a className="mono" href={explorer.contract(config.contractId)}>
                {shortHash(config.contractId, 8)} ↗
              </a>
            </div>
            <div className="ledger-row">
              <span className="label">Custodia</span>
              <span>La clave de la asociación vive en el servidor de Hilo. Nadie en el panel ve ni maneja una wallet.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
