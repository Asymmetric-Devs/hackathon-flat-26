import { useState } from "react";
import { claim, confirmReturn, stop, Entry } from "../chain";
import { Painting, STATUS_CLASS, STATUS_LABEL, useView } from "../components/Art";
import { DAY_SECS } from "../config";
import { dur, money, short } from "../format";
import { href } from "../router";
import { useStore } from "../store";
import type { Signer } from "../wallet";

function Row({ e, role }: { e: Entry; role: "venue" | "artist" }) {
  const { r, l } = useView(e);
  const { toast, refresh, ensure } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [ask, setAsk] = useState(false);
  const run = async (key: string, ok: string, fn: (s: Signer) => Promise<string>) => {
    setBusy(key);
    try { const h = await fn(await ensure()); toast("ok", ok, h); await refresh(); }
    catch (err) { toast("error", err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };
  const w = e.work;
  return (
    <li className="acct-row">
      <a href={href.obra(w.id)} className="acct-thumb" aria-label={`Ver ${r.title}`}>
        <Painting r={r} work={w.id} />
      </a>
      <div className="acct-info">
        <span className={`state-chip ${STATUS_CLASS[w.status]}`}>{STATUS_LABEL[w.status]}</span>
        <h3>{r.title}</h3>
        <p>{r.artist}{r.year ? `, ${r.year}` : ""}</p>
        {l.hung && <p className="acct-meta">Lleva {dur(l.secsHung, DAY_SECS)} colgada · cobró <b>{money(l.credited, 1)}</b> de {money(w.price, 0)}</p>}
        {w.status === "Returning" && <p className="acct-meta">Esperando que el artista confirme la devolución.</p>}
        <div className="actions">
          {role === "venue" && w.status === "Hung" && !ask && <button className="btn sm" onClick={() => setAsk(true)}>Descolgar</button>}
          {role === "venue" && w.status === "Hung" && ask && (
            <>
              <button className="btn sm" disabled={!!busy} onClick={async () => { await run("stop", "Descolgaste la obra. El alquiler se frenó.", (s) => stop(s, w.id)); setAsk(false); }}>{busy === "stop" ? "Descolgando…" : "Sí, descolgar y devolver"}</button>
              <button className="btn sm line" onClick={() => setAsk(false)}>Cancelar</button>
            </>
          )}
          {role === "artist" && w.status === "Returning" && <button className="btn sm" disabled={!!busy} onClick={() => run("ret", "Confirmaste la devolución. El depósito volvió al espacio.", (s) => confirmReturn(s, w.id))}>Confirmo que la recibí</button>}
          {role === "artist" && w.status === "Hung" && <button className="btn sm line" disabled={!!busy || l.accruedNow === 0n} onClick={() => run("claim", "Se cobró lo devengado.", (s) => claim(s, w.id))}>Cobrar lo devengado</button>}
          <a className="btn sm line" href={href.obra(w.id)}>Abrir</a>
        </div>
      </div>
    </li>
  );
}

export default function Cuenta() {
  const { entries, signer, connect, connecting } = useStore();
  if (!signer) {
    return (
      <main className="page">
        <h1>Mis obras</h1>
        <p className="sub">Conectá una cuenta para ver las obras que publicaste y las que colgaste en tu espacio.</p>
        <div className="actions" style={{ marginTop: 26 }}>
          <button className="btn" disabled={connecting} onClick={() => connect("guest")}>Probar como invitado</button>
          <button className="btn line" disabled={connecting} onClick={() => connect("freighter")}>Conectar Freighter</button>
        </div>
      </main>
    );
  }
  const me = signer.address;
  const hung = entries.filter((e) => e.lease?.venue === me && (e.work.status === "Hung" || e.work.status === "Returning"));
  const mine = entries.filter((e) => e.work.artist === me);
  const owned = entries.filter((e) => e.work.status === "Sold" && e.work.owner === me && e.work.artist !== me);
  return (
    <main className="page">
      <h1>Mis obras</h1>
      <p className="sub">Cuenta {signer.kind === "guest" ? "de invitado" : "Freighter"}: <span className="mono">{short(me)}</span></p>

      <section className="acct-sec" aria-labelledby="a-pared">
        <h2 id="a-pared">Colgadas en mi espacio</h2>
        {hung.length ? <ul className="acct-list">{hung.map((e) => <Row key={e.work.id} e={e} role="venue" />)}</ul>
          : <p className="acct-empty">No tenés obras colgadas. <a className="link" href={href.galeria}>Elegí una en la galería</a>.</p>}
      </section>

      <section className="acct-sec" aria-labelledby="a-mias">
        <h2 id="a-mias">Publicadas por mí</h2>
        {mine.length ? <ul className="acct-list">{mine.map((e) => <Row key={e.work.id} e={e} role="artist" />)}</ul>
          : <p className="acct-empty">Todavía no publicaste ninguna. <a className="link" href={href.publicar}>Publicá tu primera obra</a>.</p>}
      </section>

      {owned.length > 0 && (
        <section className="acct-sec" aria-labelledby="a-compradas">
          <h2 id="a-compradas">Compradas en cuotas</h2>
          <ul className="acct-list">{owned.map((e) => <Row key={e.work.id} e={e} role="venue" />)}</ul>
        </section>
      )}
    </main>
  );
}
