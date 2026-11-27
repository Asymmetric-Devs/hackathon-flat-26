import { useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import { buyNow, claim, confirmReturn, hang, seize, stop, tip, topUp } from "../chain";
import { Entry } from "../chain";
import { Meter, STATUS_CLASS, STATUS_LABEL, useView } from "../components/Art";
import { ArtStage } from "../components/Explorer";
import { ASSET, DAY_SECS, INSTANCE, IS_DEMO_CLOCK, UNIT } from "../config";
import { accountUrl, dur, money, short, toStroops, when } from "../format";
import { href } from "../router";
import { useStore } from "../store";
import type { Signer } from "../wallet";

export default function Obra({ id }: { id: number }) {
  const { entries, loading } = useStore();
  const e = entries.find((x) => x.work.id === id);
  if (!e) return <main className="page"><div className="skeleton" style={{ height: 420, maxWidth: 720 }} />{!loading && <p className="sub" style={{ marginTop: 20 }}>No encontramos esa obra. <a className="link" href={href.galeria}>Volver a la galería</a></p>}</main>;
  return <Detail e={e} />;
}

function Detail({ e }: { e: Entry }) {
  const { r, l } = useView(e);
  const { signer, ensure, refresh, toast, now } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [days, setDays] = useState(10);
  const [tipAmt, setTipAmt] = useState(2);
  const [confirmStop, setConfirmStop] = useState(false);
  const w = e.work;
  const me = signer?.address;
  const isArtist = me === w.artist;
  const isVenue = !!e.lease && me === e.lease.venue;
  const graceSecs = INSTANCE.graceDays * DAY_SECS;
  const plaqueUrl = `${location.origin}${location.pathname}#/cartela/${w.id}`;
  const qr = useMemo(() => { const q = qrcode(0, "M"); q.addData(plaqueUrl); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }, [plaqueUrl]);

  const run = async (key: string, ok: string, fn: (s: Signer) => Promise<string>) => {
    setBusy(key);
    try { const h = await fn(await ensure()); toast("ok", ok, h); await refresh(); }
    catch (err) { toast("error", err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  const total = w.deposit + w.rate * BigInt(days);
  const buyCost = w.price - l.credited;
  const runout = e.lease && l.runsOutIn != null ? now + l.runsOutIn : null;
  const canSeizeHung = !!e.lease && w.status === "Hung" && l.runsOutIn !== null && l.runsOutIn <= -graceSecs;
  const canSeizeRet = !!e.lease && w.status === "Returning" && now >= Number(e.lease.ended_at) + graceSecs;

  return (
    <main className="page">
      <p style={{ marginBottom: 26 }}><a className="link" href={href.galeria}>← La galería</a></p>
      <div className="obra">
        <ArtStage r={r} />
        <div className="obra-side">
          <span className={`state-chip ${STATUS_CLASS[w.status]}`}>{STATUS_LABEL[w.status]}</span>
          <h1>{r.title}</h1>
          <p className="who"><b>{r.artist}</b>{r.year ? `, ${r.year}` : ""}{r.medium ? ` · ${r.medium}` : ""}</p>
          {r.epigraph && <p className="epi">{r.epigraph}</p>}
          {r.collection && <p style={{ fontSize: ".85rem", color: "var(--tinta-2)" }}>Original en {r.collection}. {r.demo ? "Obra de dominio público usada como ejemplo." : ""}</p>}

          {(l.hung || w.status === "Sold") && <Meter e={e} l={l} />}
          {l.hung && e.lease && <p style={{ fontSize: ".92rem", color: "var(--tinta-2)" }}>Colgada hace {dur(l.secsHung, DAY_SECS)} en <a className="link mono" href={accountUrl(e.lease.venue)} target="_blank" rel="noreferrer">{short(e.lease.venue)}</a>.{runout ? ` El prepago alcanza hasta el ${when(runout, true).replace(/\.$/, "")}.` : ""}{IS_DEMO_CLOCK ? " (En esta demo 1 día dura 1 minuto.)" : ""}</p>}
          {w.status === "Sold" && <p style={{ fontSize: ".92rem", color: "var(--tinta-2)" }}>Hoy es de <a className="link mono" href={accountUrl(w.owner)} target="_blank" rel="noreferrer">{short(w.owner)}</a>. La compra quedó pagada en cuotas de alquiler.</p>}

          <div className="facts">
            <div><small>Precio</small><b>{money(w.price, 0)}</b></div>
            <div><small>Alquiler por día</small><b>{money(w.rate, 1)}</b></div>
            <div><small>Depósito</small><b>{money(w.deposit, 0)}</b></div>
          </div>

          {w.status === "Available" && !isArtist && (
            <section className="panel" aria-labelledby="h-colgar">
              <h3 id="h-colgar">Colgar esta obra en tu espacio</h3>
              <label className="field">Días prepagos
                <input type="number" min={1} max={365} value={days} onChange={(ev) => setDays(Math.max(1, Math.min(365, Number(ev.target.value) || 1)))} />
              </label>
              <p className="hint">Dejás {money(w.deposit, 0)} de depósito más {money(w.rate * BigInt(days), 0)} de alquiler por adelantado: <b>{money(total, 0)}</b> en total. El depósito vuelve cuando el artista confirma que la recibió.</p>
              <div className="actions"><button className="btn" disabled={!!busy} onClick={() => run("hang", "La obra quedó colgada. El contador ya está corriendo.", (s) => hang(s, w.id, days))}>{busy === "hang" ? "Colgando…" : "Colgar la obra"}</button></div>
            </section>
          )}
          {w.status === "Available" && isArtist && <p className="notice" style={{ marginTop: 22 }}>Tu obra está disponible. Cuando un espacio la cuelgue, vas a empezar a cobrar por día.</p>}

          {l.hung && isVenue && (
            <section className="panel strong" aria-labelledby="h-obra">
              <h3 id="h-obra">Tu pared</h3>
              <p className="hint">Esta obra está colgada en tu espacio y el alquiler corre. Lo devengado hasta ahora: <b>{money(l.accruedNow, 2)}</b>.</p>
              {!confirmStop ? (
                <div className="actions">
                  <button className="btn" disabled={!!busy} onClick={() => setConfirmStop(true)}>Descolgar la obra</button>
                  <button className="btn line" disabled={!!busy} onClick={() => run("buy", "La obra es tuya. El depósito volvió a tu cuenta.", (s) => buyNow(s, w.id))}>Quedármela por {money(buyCost > 0n ? buyCost : 0n, 0)}</button>
                </div>
              ) : (
                <div className="confirm" role="alertdialog" aria-label="Confirmar descolgar la obra">
                  <p><b>¿Descolgar y devolver la obra?</b> Se frena el alquiler y se le paga al artista lo devengado. Lo que sobre del prepago vuelve a tu cuenta. El depósito ({money(w.deposit, 0)}) vuelve cuando el artista confirme que la recibió.</p>
                  <div className="actions">
                    <button className="btn" disabled={!!busy} onClick={async () => { await run("stop", "Descolgaste la obra. El alquiler se frenó: ahora hay que devolverla.", (s) => stop(s, w.id)); setConfirmStop(false); }}>{busy === "stop" ? "Descolgando…" : "Sí, descolgar"}</button>
                    <button className="btn line" disabled={!!busy} onClick={() => setConfirmStop(false)}>Cancelar</button>
                  </div>
                </div>
              )}
              <div className="actions sub-actions">
                <label className="field inline">Sumar días de prepago<input type="number" min={1} max={365} value={days} onChange={(ev) => setDays(Math.max(1, Math.min(365, Number(ev.target.value) || 1)))} /></label>
                <button className="btn sm line" disabled={!!busy} onClick={() => run("topup", `Sumaste ${days} días de prepago.`, (s) => topUp(s, w.id, days))}>Sumar {days} días</button>
                <button className="btn sm line" disabled={!!busy || l.accruedNow === 0n} onClick={() => run("claim", "Se cobró lo devengado y se acreditó al precio.", (s) => claim(s, w.id))}>Liquidar lo devengado</button>
              </div>
            </section>
          )}

          {l.hung && !isVenue && (
            <section className="panel" aria-labelledby="h-obra">
              <h3 id="h-obra">{isArtist ? "Tu obra" : "Colgada en otro espacio"}</h3>
              <p className="hint">Lo devengado hasta ahora: <b>{money(l.accruedNow, 2)}</b>. Cualquiera puede ejecutar el cobro: el dinero siempre va al artista. {isArtist ? "" : "Solo el espacio que la colgó puede descolgarla"}{e.lease && !isArtist ? <> (<span className="mono">{short(e.lease.venue)}</span>)</> : null}{isArtist ? "" : "."}</p>
              <div className="actions">
                <button className="btn sm" disabled={!!busy || l.accruedNow === 0n} onClick={() => run("claim", "Se cobró lo devengado y se acreditó al precio.", (s) => claim(s, w.id))}>{busy === "claim" ? "Cobrando…" : "Cobrar lo devengado"}</button>
                {canSeizeHung && isArtist && <button className="btn sm" disabled={!!busy} onClick={() => run("seize", "Se ejecutó el depósito a tu favor.", (s) => seize(s, w.id))}>Ejecutar el depósito</button>}
              </div>
              {!signer && <p className="hint">Si colgaste esta obra, conectate (arriba a la derecha) con la misma cuenta para poder descolgarla.</p>}
            </section>
          )}

          {w.status === "Returning" && (
            <section className="panel">
              <h3>Esperando la devolución</h3>
              <p className="hint">El espacio frenó el alquiler. Cuando el artista la tenga en la mano, confirma y el depósito vuelve. Si pasan {INSTANCE.graceDays} días de gracia sin devolverla, el depósito es del artista.</p>
              <div className="actions">
                {isArtist && <button className="btn sm" disabled={!!busy} onClick={() => run("ret", "Confirmaste la devolución. El depósito volvió al espacio.", (s) => confirmReturn(s, w.id))}>Confirmo que la recibí</button>}
                {isArtist && canSeizeRet && <button className="btn sm line" disabled={!!busy} onClick={() => run("seize", "Se ejecutó el depósito a tu favor.", (s) => seize(s, w.id))}>Ejecutar el depósito</button>}
              </div>
            </section>
          )}

          <section className="panel" aria-labelledby="h-tip">
            <h3 id="h-tip">Dejarle una propina al artista</h3>
            <div className="actions" role="group" aria-label="Monto">{[1, 2, 5, 10].map((n) => <button key={n} className="chip" style={tipAmt === n ? undefined : { boxShadow: "inset 0 0 0 1px var(--tinta-2)" }} aria-pressed={tipAmt === n} onClick={() => setTipAmt(n)}>{n} {ASSET}</button>)}</div>
            <div className="actions"><button className="btn sm" disabled={!!busy} onClick={() => run("tip", `Le dejaste ${tipAmt} ${ASSET} a ${r.artist}.`, (s) => tip(s, w.id, toStroops(tipAmt)))}>{busy === "tip" ? "Enviando…" : `Enviar ${tipAmt} ${ASSET}`}</button></div>
            <p className="hint">Propinas recibidas por esta obra: {money(e.tips, 1)}.</p>
          </section>
        </div>
      </div>

      <div className="obra" style={{ marginTop: "clamp(60px, 8vw, 120px)" }}>
        <section className="cv-light" aria-labelledby="h-cv">
          <h2 id="h-cv" className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-.025em", marginBottom: 26 }}>El currículum de la obra</h2>
          <ol className="line-t">
            {l.hung && e.lease && <li className="live"><h4>Colgada ahora</h4><p><span className="tag">{money(l.credited, 1)} cobrados</span>desde el {when(e.lease.start, true)} · <a className="link mono" href={accountUrl(e.lease.venue)} target="_blank" rel="noreferrer">{short(e.lease.venue)}</a></p></li>}
            {e.history.slice().reverse().map((h, i) => (
              <li key={i}><h4>{h.outcome === "Bought" ? "Vendida al espacio" : h.outcome === "Seized" ? "No fue devuelta" : "Expuesta y devuelta"}</h4>
                <p><span className={`tag ${h.outcome === "Seized" ? "bad" : "ok"}`}>{money(h.paid, 1)}</span>{when(h.start, true)} → {when(h.end, true)} · <a className="link mono" href={accountUrl(h.venue)} target="_blank" rel="noreferrer">{short(h.venue)}</a></p></li>
            ))}
            {e.history.length === 0 && !l.hung && <li><h4>Todavía sin exposiciones</h4><p>La primera que se pague va a quedar acá, con fecha, monto y espacio. No se puede editar ni borrar.</p></li>}
          </ol>
        </section>
        <section aria-labelledby="h-qr">
          <h2 id="h-qr" className="serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-.025em", marginBottom: 20 }}>La cartela de la pared</h2>
          <div className="qr">
            <div dangerouslySetInnerHTML={{ __html: qr }} aria-label="Código QR de la cartela" role="img" />
            <p className="hint" style={{ fontSize: ".92rem", color: "var(--tinta-2)" }}>Imprimí este código y pegalo junto a la obra. Quien lo escanee ve cuánto lleva cobrado y puede dejarle una propina al artista, sin instalar nada. <a className="link" href={href.cartela(w.id)}>Abrir la cartela</a></p>
          </div>
        </section>
      </div>
    </main>
  );
}
export { UNIT };
