import { useState } from "react";
import { publish } from "../chain";
import { CATALOG } from "../catalog";
import { ASSET } from "../config";
import { toStroops } from "../format";
import { href } from "../router";
import { useStore } from "../store";

export default function Publicar() {
  const { signer, connect, refresh, toast, entries } = useStore();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ cat: "", title: "", artist: "", year: "", medium: "", img: "", price: 200, rate: 2, deposit: 30 });
  const set = (k: string, v: string | number) => setF((x) => ({ ...x, [k]: v }));
  const pick = (slug: string) => {
    const p = CATALOG.find((c) => c.slug === slug);
    setF((x) => p ? { ...x, cat: slug, title: p.title, artist: p.artist, year: p.year, medium: p.medium, img: "" } : { ...x, cat: "" });
  };
  const valid = f.title.trim() && f.artist.trim() && f.price > 0 && f.rate > 0 && f.deposit >= 0 && (f.cat || !f.img || /^https:\/\//.test(f.img));
  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!signer) { connect("guest"); return; }
    setBusy(true);
    try {
      const meta = f.cat || JSON.stringify({ title: f.title.trim(), artist: f.artist.trim(), year: f.year.trim(), medium: f.medium.trim(), img: f.img.trim() });
      const h = await publish(signer, toStroops(f.price), toStroops(f.rate), toStroops(f.deposit), meta);
      toast("ok", "Tu obra quedó publicada y disponible para colgar.", h);
      await refresh();
      location.hash = href.obra(entries.length);
    } catch (err) { toast("error", err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };
  return (
    <main className="page">
      <h1>Publicar una obra</h1>
      <p className="sub">Tres números y listo: cuánto vale, cuánto cobra por día colgada y qué depósito debe dejar el espacio. La obra no sale de tus manos hasta que alguien la cuelgue.</p>
      <form className="panel" style={{ maxWidth: 640, marginTop: 36 }} onSubmit={submit}>
        <label className="field">Probar con una obra de dominio público
          <select value={f.cat} onChange={(e) => pick(e.target.value)}>
            <option value="">Cargar una obra propia</option>
            {CATALOG.map((c) => <option key={c.slug} value={c.slug}>{c.artist}, {c.title}</option>)}
          </select>
        </label>
        <div className="row2">
          <label className="field">Título<input required value={f.title} onChange={(e) => set("title", e.target.value)} readOnly={!!f.cat} /></label>
          <label className="field">Artista<input required value={f.artist} onChange={(e) => set("artist", e.target.value)} readOnly={!!f.cat} /></label>
        </div>
        <div className="row2">
          <label className="field">Año<input value={f.year} onChange={(e) => set("year", e.target.value)} readOnly={!!f.cat} /></label>
          <label className="field">Técnica<input value={f.medium} onChange={(e) => set("medium", e.target.value)} readOnly={!!f.cat} /></label>
        </div>
        {!f.cat && <label className="field">Dirección (https) de la imagen<input type="url" placeholder="https://…" value={f.img} onChange={(e) => set("img", e.target.value)} /></label>}
        <div className="row2">
          <label className="field">Precio de venta ({ASSET})<input type="number" min={1} step="any" value={f.price} onChange={(e) => set("price", +e.target.value)} /></label>
          <label className="field">Alquiler por día ({ASSET})<input type="number" min={0.1} step="any" value={f.rate} onChange={(e) => set("rate", +e.target.value)} /></label>
        </div>
        <label className="field">Depósito en garantía ({ASSET})<input type="number" min={0} step="any" value={f.deposit} onChange={(e) => set("deposit", +e.target.value)} /></label>
        <p className="hint">Con estos números, la obra es del espacio a los {f.rate > 0 ? Math.ceil(f.price / f.rate) : "…"} días de alquiler. El depósito lo retiene el contrato y vuelve cuando confirmás que la recibiste.</p>
        <div className="actions"><button className="btn" type="submit" disabled={busy || !valid}>{busy ? "Publicando…" : signer ? "Publicar la obra" : "Conectar como invitado y publicar"}</button></div>
      </form>
    </main>
  );
}
