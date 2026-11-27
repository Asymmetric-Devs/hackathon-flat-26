import evidence from "../evidence.json";
import deployed from "../deployed.json";
import { contractUrl, short, txUrl } from "../format";

export default function Evidencia() {
  const rows = evidence.rows as { label: string; hash: string }[];
  const inst = deployed.instances as { [k: string]: { contractId: string; daySecs: number; graceDays: number; deployTx?: string } };
  return (
    <main className="page">
      <h1>Evidencia</h1>
      <p className="sub">Todo lo que Muro afirma se puede comprobar en Stellar Expert, sin creernos.</p>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Instancia</th><th>Contrato</th><th>Duración de un "día"</th><th>Gracia</th><th>Despliegue</th></tr></thead>
          <tbody>
            {Object.entries(inst).map(([k, v]) => (
              <tr key={k}><td>{k === "demo" ? "Demo" : "Real"}</td>
                <td><a className="mono" href={contractUrl(v.contractId)} target="_blank" rel="noreferrer">{short(v.contractId)}</a></td>
                <td>{v.daySecs >= 86400 ? "24 horas" : `${v.daySecs} segundos`}</td><td>{v.graceDays} {v.graceDays === 1 ? "día" : "días"}</td>
                <td>{v.deployTx ? <a className="mono" href={txUrl(v.deployTx)} target="_blank" rel="noreferrer">{v.deployTx.slice(0, 10)}…</a> : "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-.025em", margin: "56px 0 6px" }}>Transacciones de la demo</h2>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Qué pasó</th><th>Hash</th></tr></thead>
          <tbody>{rows.length === 0 ? <tr><td colSpan={2}>Se cargan al correr el seed de Testnet.</td></tr> : rows.map((r) => (
            <tr key={r.hash}><td>{r.label}</td><td><a className="mono" href={txUrl(r.hash)} target="_blank" rel="noreferrer">{r.hash.slice(0, 16)}…</a></td></tr>))}</tbody>
        </table>
      </div>
      <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", letterSpacing: "-.025em", margin: "56px 0 12px" }}>Cómo verificar</h2>
      <ol style={{ display: "grid", gap: 10, maxWidth: "60ch", color: "var(--tinta-2)", listStyle: "decimal", paddingLeft: 22 }}>
        <li>Abrí un hash en Stellar Expert (red Testnet).</li>
        <li>Mirá la operación: es una invocación al contrato Muro, con la función y sus argumentos.</li>
        <li>Revisá los eventos: <span className="mono">hung</span>, <span className="mono">claimed</span>, <span className="mono">sold</span>, <span className="mono">returned</span>, <span className="mono">tipped</span>.</li>
        <li>Compará con lo que muestra la obra en la galería: sale de las mismas lecturas del contrato.</li>
      </ol>
    </main>
  );
}
