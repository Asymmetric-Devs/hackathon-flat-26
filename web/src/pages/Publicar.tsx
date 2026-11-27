import { useMemo, useState } from "react";
import { count, publish } from "../chain";
import { Cartela, Painting } from "../components/Art";
import { CATALOG, resolve } from "../catalog";
import { ASSET } from "../config";
import { toStroops } from "../format";
import { live } from "../live";
import { navigate, href } from "../router";
import { useStore } from "../store";
import type { Entry } from "../chain";

type F = { cat: string; title: string; artist: string; year: string; medium: string; img: string; price: number; rate: number; deposit: number };

export default function Publicar() {
  const { ensure, refresh, toast, now } = useStore();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<F>({ cat: "", title: "", artist: "", year: "", medium: "", img: "", price: 200, rate: 2, deposit: 30 });
  const set = (k: keyof F, v: string | number) => setF((x) => ({ ...x, [k]: v }));
  const pick = (slug: string) => {
    const p = CATALOG.find((c) => c.slug === slug);
    setF((x) => (p ? { ...x, cat: slug, title: p.title, artist: p.artist, year: p.year, medium: p.medium, img: "" } : { ...x, cat: "", title: "", artist: "", year: "", medium: "" }));
  };
  const imgOk = !f.img || /^https:\/\/[^\s"'<>]+$/i.test(f.img);
  const valid = !!f.title.trim() && !!f.artist.trim() && f.price > 0 && f.rate > 0 && f.deposit > 0 && imgOk;
  const days = f.rate > 0 ? Math.ceil(f.price / f.rate) : 0;

  const meta = useMemo(() => f.cat || JSON.stringify({ title: f.title.trim(), artist: f.artist.trim(), year: f.year.trim(), medium: f.medium.trim(), img: f.img.trim() }), [f]);
  const preview = useMemo(() => {
    const r = resolve(meta);
    const safe = (n: number) => BigInt(Math.max(0, Math.round((Number.isFinite(n) ? n : 0) * 1e7)));
    const e: Entry = { work: { id: -1, artist: "", owner: "", price: safe(f.price), rate: safe(f.rate), deposit: safe(f.deposit), meta, status: "Available" }, lease: null, history: [], tips: 0n };
    const rr = f.cat ? r : { ...r, title: f.title.trim() || "Título de tu obra", artist: f.artist.trim() || "Tu nombre" };
    return { r: rr, e };
  }, [f, meta]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    try {
      const signer = await ensure();
      if (new TextEncoder().encode(meta).length > 512) throw new Error("Los datos de la obra son demasiado largos: acortá el título, la técnica o la dirección de la imagen.");
      const h = await publish(signer, toStroops(f.price), toStroops(f.rate), toStroops(f.deposit), meta);
      toast("ok", "Tu obra quedó publicada y disponible para colgar.", h);
      await refresh();
      navigate(href.obra((await count()) - 1));
    } catch (err) { toast("error", err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };

  return (
    <main className="page">
      <h1>Publicar una obra</h1>
      <p className="sub">Cargá la obra y fijá tres números. No sale de tus manos hasta que un espacio la cuelgue.</p>
      <div className="pub">
        <form className="pub-form" onSubmit={submit}>
          <fieldset className="pub-step">
            <legend><span className="n">1</span>La obra</legend>
            <label className="field">¿Probar con una obra de ejemplo?
              <select value={f.cat} onChange={(e) => pick(e.target.value)}>
                <option value="">No, cargo una propia</option>
                {CATALOG.map((c) => <option key={c.slug} value={c.slug}>{c.artist}, {c.title}</option>)}
              </select>
            </label>
            <div className="row2">
              <label className="field">Título<input required value={f.title} onChange={(e) => set("title", e.target.value)} readOnly={!!f.cat} placeholder="Ej.: Tarde de feria" /></label>
              <label className="field">Artista<input required value={f.artist} onChange={(e) => set("artist", e.target.value)} readOnly={!!f.cat} placeholder="Tu nombre" /></label>
            </div>
            <div className="row2">
              <label className="field">Año<input value={f.year} onChange={(e) => set("year", e.target.value)} readOnly={!!f.cat} placeholder="2026" /></label>
              <label className="field">Técnica<input value={f.medium} onChange={(e) => set("medium", e.target.value)} readOnly={!!f.cat} placeholder="Óleo sobre tela" /></label>
            </div>
            {!f.cat && (
              <label className="field">Dirección de la imagen (https)
                <input type="url" placeholder="https://…" value={f.img} onChange={(e) => set("img", e.target.value)} aria-invalid={!imgOk} />
                {!imgOk && <small className="bad">Tiene que empezar con https://</small>}
              </label>
            )}
          </fieldset>

          <fieldset className="pub-step">
            <legend><span className="n">2</span>Los números</legend>
            <div className="row3">
              <label className="field">Precio de venta ({ASSET})<input type="number" min={1} step="any" value={f.price} onChange={(e) => set("price", +e.target.value)} /></label>
              <label className="field">Alquiler por día ({ASSET})<input type="number" min={0.1} step="any" value={f.rate} onChange={(e) => set("rate", +e.target.value)} /></label>
              <label className="field">Depósito ({ASSET})<input type="number" min={0.1} step="any" value={f.deposit} onChange={(e) => set("deposit", +e.target.value)} /></label>
            </div>
            <p className="pub-sum">Con estos números la obra es del espacio a los <b>{days || "…"} días</b> de alquiler. El depósito lo retiene el contrato y vuelve cuando confirmás que la recibiste.</p>
          </fieldset>

          <div className="actions"><button className="btn" type="submit" disabled={busy || !valid}>{busy ? "Publicando…" : "Publicar la obra"}</button></div>
        </form>

        <aside className="pub-preview" aria-label="Vista previa">
          <p className="pub-cap">Así se va a ver</p>
          <div className="pub-art">
            <Painting r={preview.r} eager />
            <Cartela e={preview.e} r={preview.r} l={live(preview.e, now)} compact />
          </div>
        </aside>
      </div>
    </main>
  );
}
