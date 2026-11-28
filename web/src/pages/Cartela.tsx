import { useState } from "react";
import { tip } from "../chain";
import { Painting, useView } from "../components/Art";
import { Meter } from "../components/Art";
import { ASSET, DAY_SECS } from "../config";
import { dur, short, toStroops } from "../format";
import { href } from "../router";
import { useStore } from "../store";

/** Lo que se ve al escanear el QR de la pared: la cartela viva de la obra y una propina en un toque. */
export default function Cartela({ id }: { id: number }) {
  const { entries, ensure, refresh, toast } = useStore();
  const e = entries.find((x) => x.work.id === id);
  const [busy, setBusy] = useState(false);
  const [amt, setAmt] = useState(2);
  if (!e) return <main className="plaque"><div className="plaque-card"><div className="skeleton" style={{ height: 200 }} /><p style={{ marginTop: 16 }}><a className="link" href={href.galeria}>Ir a la galería</a></p></div></main>;
  return <Plaque e={e} id={id} busy={busy} setBusy={setBusy} amt={amt} setAmt={setAmt} ensure={ensure} refresh={refresh} toast={toast} />;
}

function Plaque({ e, id, busy, setBusy, amt, setAmt, ensure, refresh, toast }: any) {
  const { r, l } = useView(e);
  const give = async () => {
    setBusy(true);
    try {
      const s = await ensure();
      const h = await tip(s, id, toStroops(amt));
      toast("ok", `Le dejaste ${amt} ${ASSET} a ${r.artist}. Llegó directo, sin intermediarios.`, h);
      await refresh();
    } catch (err) { toast("error", err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };
  return (
    <main className="plaque">
      <article className="plaque-card">
        <div className="pc-art"><Painting r={r} eager /></div>
        <div className="pc-info">
        <h1>{r.title}</h1>
        <p style={{ marginTop: 8, color: "var(--tinta-2)" }}>{r.artist}{r.year ? `, ${r.year}` : ""}{r.medium ? ` · ${r.medium}` : ""}</p>
        {r.epigraph && <p className="epi" style={{ fontSize: "1.05rem", margin: "18px 0 0" }}>{r.epigraph}</p>}
        {l.hung && e.lease ? (
          <>
            <Meter e={e} l={l} />
            <p style={{ fontSize: ".9rem", color: "var(--tinta-2)" }}>Lleva {dur(l.secsHung, DAY_SECS)} colgada en {short(e.lease.venue)}. Cada día pagado cuenta como cuota de su precio.</p>
          </>
        ) : e.work.status === "Sold" ? <p style={{ marginTop: 18 }}>Esta obra ya fue comprada por su espacio.</p> : <p style={{ marginTop: 18, color: "var(--tinta-2)" }}>Esta obra no está colgada en este momento.</p>}
        <div style={{ marginTop: 26 }}>
          <div className="actions" style={{ marginBottom: 12 }} role="group" aria-label="Monto de la propina">
            {[1, 2, 5, 10].map((n) => <button key={n} className="chip" aria-pressed={amt === n} onClick={() => setAmt(n)} style={amt === n ? undefined : { boxShadow: "inset 0 0 0 1px var(--tinta-2)" }}>{n} {ASSET}</button>)}
          </div>
          <button className="btn" onClick={give} disabled={busy}>{busy ? "Enviando…" : `Dejarle ${amt} ${ASSET} a ${r.artist.split(" ")[0]}`}</button>
          <p style={{ fontSize: ".8rem", color: "var(--tinta-2)", marginTop: 12 }}>La primera vez se crea una cuenta de invitado de Testnet en tu navegador, sin instalar nada y sin dinero real.</p>
        </div>
        <p style={{ marginTop: 22, fontSize: ".85rem" }}><a className="link" href={href.obra(id)}>Ver la obra completa y su currículum</a></p>
        </div>
      </article>
    </main>
  );
}
