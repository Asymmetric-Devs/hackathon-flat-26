import { useEffect, useMemo, useRef, useState } from "react";
import { Entry } from "../chain";
import { resolve } from "../catalog";
import { Cartela, Painting, STATUS_LABEL, useView } from "../components/Art";
import { demoEntries, live } from "../live";
import { money, short, when, accountUrl } from "../format";
import { href } from "../router";
import { useStore } from "../store";
import { CONTRACT_ID, DAY_SECS, UNIT, ASSET } from "../config";
import { contractUrl } from "../format";
import evidence from "../evidence.json";

/* ------------------------------------------------------------------ HERO */
type Slot = { slug: string; x: number; y: number; w: number; r0: number; d: number; cx?: string; mw: string; ms: string };
const SLOTS: Slot[] = [
  { slug: "candido-curupayti", x: 44, y: 9, w: 32, r0: -1.6, d: 0.5, mw: "88%", ms: "end" },
  { slug: "afklint-retablo", x: 83.5, y: 8.5, w: 12, r0: 2.4, d: 0.15, cx: "-95%", mw: "46%", ms: "start" },
  { slug: "manet-bar", x: 51, y: 31, w: 23, r0: -2.2, d: 0.85, mw: "78%", ms: "center" },
  { slug: "vangogh-terraza", x: 84.5, y: 34.5, w: 10.5, r0: 3, d: 1.1, cx: "-110%", mw: "42%", ms: "end" },
  { slug: "pueyrredon-alto", x: 7, y: 43, w: 20, r0: 1.8, d: 1.35, mw: "92%", ms: "start" },
  { slug: "fader-mantones", x: 33.5, y: 38, w: 12.5, r0: -2.8, d: 1.6, mw: "58%", ms: "center" },
];

function HungPiece({ slot, e, go }: { slot: Slot; e: Entry; go: boolean }) {
  const { r, l } = useView(e);
  return (
    <div className={`hung${go ? " in" : ""}`}
      style={{ ["--x" as string]: `${slot.x}vw`, ["--y" as string]: `${slot.y}vw`, ["--w" as string]: `${slot.w}vw`, ["--r0" as string]: `${slot.r0}deg`, ["--d" as string]: `${slot.d}s`, ["--cx" as string]: slot.cx ?? "0", ["--mw" as string]: slot.mw, ["--ms" as string]: slot.ms }}>
      <svg className="wire" viewBox="0 0 100 90" preserveAspectRatio="none" aria-hidden="true"><path d="M2 88 L50 6 L98 88" vectorEffect="non-scaling-stroke" /><circle cx="50" cy="6" r="3.2" /></svg>
      <a href={href.obra(e.work.id)} className="frame" aria-label={`${r.title}, ${r.artist}. Ver la obra.`}>
        <span className="mat" style={{ display: "block" }}><img src={r.img} alt="" width={1000} height={Math.round(1000 * r.ratio)} loading="eager" decoding="async" /></span>
      </a>
      <Cartela e={e} r={r} l={l} compact />
    </div>
  );
}

function Hero({ entries, source }: { entries: Entry[]; source: string }) {
  const ref = useRef<HTMLElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 250); return () => clearTimeout(t); }, []);
  const bySlug = useMemo(() => {
    const m = new Map<string, Entry>();
    for (const e of entries) m.set(e.work.meta, e);
    for (const d of demoEntries()) if (!m.has(d.work.meta)) m.set(d.work.meta, { ...d, work: { ...d.work, id: -1 } });
    return m;
  }, [entries]);
  const onMove = (ev: React.PointerEvent) => {
    const el = ref.current; if (!el) return; const b = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${ev.clientX - b.left}px`); el.style.setProperty("--my", `${ev.clientY - b.top}px`);
  };
  return (
    <section className="hero" ref={ref} onPointerMove={onMove} aria-label="Muro">
      <div className="word" aria-hidden="true">Muro</div>
      <div className="hang-stage">
        {SLOTS.map((s) => { const e = bySlug.get(s.slug); return e ? <HungPiece key={s.slug} slot={s} e={e.work.id < 0 ? { ...e, work: { ...e.work, id: 0 } } : e} go={go} /> : null; })}
      </div>
      <div className="glow" aria-hidden="true" /><div className="light-mask" aria-hidden="true" />
      <div className="hero-copy">
        <h1>Una obra colgada en un bar <em>cobra por día</em>. Si se enamoran, es suya.</h1>
        <p>Muro le paga a cada obra un alquiler diario mientras cuelga de la pared de un bar, una bodega o un hotel. Cada día pagado cuenta como cuota de su precio.</p>
        <div className="hero-cta">
          <a className="btn" href={href.galeria}>Entrar a la galería</a>
          <a className="btn line" href="#como" onClick={(e) => { e.preventDefault(); document.getElementById("como")?.scrollIntoView({ behavior: "smooth" }); }}>Cómo se cuelga</a>
        </div>
      </div>
      <div className="hero-foot">
        <span className="ital">“Antes de existir en el mundo, existió en la imaginación de alguien.”</span>
        <span className="simtag">{source === "chain" ? "Cifras en vivo desde Stellar Testnet" : "Cifras de ejemplo (sin conexión a la red)"} · obras de dominio público</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ LA PREGUNTA */
/** Lámina editorial: una obra con su epígrafe, como en un catálogo. */
function Plate({ slug }: { slug: string }) {
  const r = resolve(slug);
  return (
    <figure className="plate">
      <Painting r={r} />
      <figcaption><b>{r.title}</b>, {r.artist}, {r.year}.<br /><span className="ital">{r.epigraph}</span></figcaption>
    </figure>
  );
}
function Question() {
  return (
    <section className="sec wall" id="pregunta">
      <div className="wrap question">
        <div className="q-head">
          <div>
            <p className="kicker">Para artistas visuales y los lugares que cuelgan su obra</p>
            <h2 className="big">¿Cuánto cobra una obra por colgar un mes en la pared de un bar?</h2>
          </div>
          <Plate slug="vangogh-terraza" />
        </div>
        <div className="q-side">
          <p className="lead" style={{ marginTop: 0 }}>Pinturas, fotos y grabados decoran bodegas, cafés y hoteles de todo el país. La obra trabaja todos los días, pero rara vez hay un precio, un contrato claro o un registro de dónde estuvo.</p>
          <div className="twocol">
            <p>Muro le pone número a esa pared. El artista fija el precio de la obra y cuánto cobra por día. El espacio deja un depósito y paga los días por adelantado.</p>
            <p>Lo que se cobra se acredita al precio. Y cada pago, que costó dinero real, es una exposición que nadie puede inventar.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- CÓMO SE CUELGA */
const STEPS = [
  { t: "El artista publica la obra", p: "Fija tres números: el precio de venta, cuánto cobra por día colgada y qué depósito debe dejar el espacio. La obra queda en el taller, disponible." },
  { t: "Un espacio la cuelga", p: "El bar o la bodega deja el depósito en garantía y paga unos días por adelantado. El contrato retiene ese dinero. Nadie lo puede tocar, salvo según las reglas." },
  { t: "Cada día es una cuota", p: "El alquiler se devenga con el reloj. El artista cobra lo que corre y todo lo cobrado se descuenta del precio. Sin intermediarios, sin plataforma que se quede un porcentaje." },
  { t: "Se queda o vuelve", p: "Si se enamoraron, la obra pasa a ser del espacio cuando la suma de cuotas llega al precio, o antes pagando la diferencia. Si no, la devuelve, el artista confirma que la recibió y el depósito vuelve. Si no la devuelve, el depósito es del artista." },
];
function How() {
  const [s, setS] = useState(0);
  const [tick, setTick] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) setS(Number((en.target as HTMLElement).dataset.i)); }), { rootMargin: "-45% 0px -45% 0px" });
    items.current.forEach((n) => n && io.observe(n));
    return () => io.disconnect();
  }, []);
  useEffect(() => { if (s !== 2) { setTick(0); return; } const t = setInterval(() => setTick((x) => (x >= 100 ? 100 : x + 1)), 70); return () => clearInterval(t); }, [s]);
  const r = resolve("fader-mantones");
  const price = 220, rate = 2, day = Math.round(tick * 1.1);
  const credited = Math.min(price, day * rate);
  return (
    <section className="sec deep" id="como">
      <div className="wrap">
        <p className="kicker">Cómo se cuelga</p>
        <div className="how">
          <div className="how-stage">
            <div className="how-obj" aria-hidden="true">
              <svg className="wires" viewBox="0 0 100 34" preserveAspectRatio="none" style={{ opacity: s >= 1 ? 1 : 0 }}><path d="M12 34 L50 2 L88 34" vectorEffect="non-scaling-stroke" /></svg>
              <span className="nail" style={{ opacity: s >= 1 ? 1 : 0, transform: s >= 1 ? "none" : "translateY(-12px)" }} />
              <div className="how-frame" data-s={s}>
                <Painting r={r} />
              </div>
              <div className="cartela">
                <b>{r.title}</b><i>{r.artist}, {r.year}</i>
                {s === 0 && <div className="row"><span>Precio {price} {ASSET}</span><span>{rate} {ASSET} por día</span></div>}
                {s === 1 && <div className="row"><span>Depósito 30 {ASSET} en garantía</span><span>10 días prepagos</span></div>}
                {s === 2 && (<><div className="row"><span>Día {day} · cobró {credited} {ASSET}</span><span>{Math.round((credited / price) * 100)} %</span></div><div className="bar"><span style={{ width: `${(credited / price) * 100}%`, transition: "width .1s linear" }} /></div></>)}
                {s === 3 && <div className="row"><span>Día 110 · pagó {price} {ASSET}</span><span>es suya</span></div>}
              </div>
            </div>
          </div>
          <ol className="how-steps">
            {STEPS.map((st, i) => (
              <li key={i} data-i={i} className={s === i ? "on" : ""} ref={(n) => { items.current[i] = n; }}>
                <span className="num">{i + 1} de 4</span>
                <h3>{st.t}</h3>
                <p>{st.p}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- OBRA EN CUOTAS */
function Sim() {
  const [price, setPrice] = useState(300);
  const [rate, setRate] = useState(3);
  const [days, setDays] = useState(40);
  const toOwn = Math.ceil(price / rate);
  const d = Math.min(days, toOwn);
  const earned = Math.min(price, d * rate);
  const left = price - earned;
  const p = (earned / price) * 100;
  return (
    <section className="sec light" id="cuotas">
      <div className="wrap">
        <p className="kicker">Obra en cuotas</p>
        <h2 className="big" style={{ maxWidth: "20ch" }}>El arte es lo único que en Argentina no se compra en cuotas. <em>Hasta ahora.</em></h2>
        <div className="sim">
          <div className="ctrl">
            <label><span>Precio de la obra<output>{price} {ASSET}</output></span><input type="range" min={50} max={1000} step={10} value={price} onChange={(e) => setPrice(+e.target.value)} aria-label="Precio de la obra" /></label>
            <label><span>Alquiler por día<output>{rate} {ASSET}</output></span><input type="range" min={1} max={20} step={1} value={rate} onChange={(e) => setRate(+e.target.value)} aria-label="Alquiler por día" /></label>
            <label><span>Días colgada<output>{d}</output></span><input type="range" min={0} max={Math.max(toOwn, 1)} step={1} value={d} onChange={(e) => setDays(+e.target.value)} aria-label="Días colgada" /></label>
            <p style={{ color: "var(--tinta-2)", fontSize: ".92rem", maxWidth: "36ch" }}>Mové los controles. Con estos números, la obra es del espacio al día {toOwn}.</p>
          </div>
          <div className="sim-card">
            <h4>{d >= toOwn ? "La obra ya es del espacio." : `Al día ${d}, la obra ya cobró ${earned} ${ASSET} de ${price}.`}</h4>
            <div className="track" aria-hidden="true">
              <div className="fill" style={{ width: `${p}%` }}>{p > 14 ? `${Math.round(p)} %` : ""}</div>
              {[25, 50, 75].map((t) => <i key={t} className="tick" style={{ left: `${t}%` }} />)}
            </div>
            <div className="scale"><span>Día 0</span><span>Día {toOwn}: es suya</span></div>
            <div className="outs">
              <div className="out"><small>Si la devuelve hoy</small><strong>{earned} {ASSET}</strong><p>cobrados por la artista, y la obra sigue siendo suya. El depósito vuelve al espacio.</p></div>
              <div className="out"><small>Si se la queda</small><strong>{left} {ASSET}</strong><p>es lo que falta pagar. {left === 0 ? "No falta nada." : `O ${Math.ceil(left / rate)} días más de alquiler.`}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- CURRÍCULUM */
const DEMO_HISTORY: { venue: string; start: number; end: number; paid: number; outcome: "Returned" | "Bought" | "Seized" }[] = [
  { venue: "GDEMO…A1B2", start: 1717200000, end: 1719800000, paid: 60, outcome: "Returned" },
  { venue: "GDEMO…C3D4", start: 1720000000, end: 1723600000, paid: 84, outcome: "Returned" },
];
function Curriculum({ entries, source }: { entries: Entry[]; source: string }) {
  const withHistory = entries.filter((e) => e.history.length || e.work.status === "Hung");
  const list = withHistory.length ? withHistory : entries;
  const [slug, setSlug] = useState<string | null>(null);
  const cur = list.find((e) => e.work.meta === slug) ?? list[0];
  const { now } = useStore();
  if (!cur) return null;
  const r = resolve(cur.work.meta);
  const l = live(cur, now);
  const real = cur.history.length > 0 || (cur.lease != null);
  return (
    <section className="sec wall" id="curriculum">
      <div className="wrap">
        <p className="kicker">El currículum de la obra</p>
        <h2 className="big" style={{ maxWidth: "20ch" }}>Cada pago es una exposición que <em>costó plata de verdad</em>.</h2>
        <p className="lead">Un artista emergente casi nunca puede probar dónde estuvo su obra. En Muro el historial se arma solo, es público y no lo puede editar ni el artista ni el espacio.</p>
        <div className="cv">
          <div>
            <div className="cv-pick" role="group" aria-label="Elegir obra">
              {list.map((e) => { const rr = resolve(e.work.meta); return <button key={e.work.id} className="chip" aria-pressed={cur.work.id === e.work.id} onClick={() => setSlug(e.work.meta)}>{rr.title.length > 22 ? rr.title.slice(0, 21) + "…" : rr.title}</button>; })}
            </div>
            <a href={href.obra(cur.work.id)} className="frame" style={{ maxWidth: 380 }} aria-label={`Ver ${r.title}`}><span className="mat" style={{ display: "block" }}><img src={r.img} alt={`${r.title}, ${r.artist}`} width={1000} height={Math.round(1000 * r.ratio)} loading="lazy" /></span></a>
            <div className="cartela" style={{ marginTop: 18 }}><b>{r.title}</b><i>{r.artist}, {r.year}</i><i>Estado: {STATUS_LABEL[cur.work.status]}</i></div>
          </div>
          <ol className="line-t" aria-label={`Exposiciones de ${r.title}`}>
            {l.hung && cur.lease && (
              <li className="live"><h4>Colgada ahora</h4>
                <p><span className="tag">{money(l.credited, 1)} cobrados</span>desde el {when(cur.lease.start, true)} · espacio <a className="link mono" href={accountUrl(cur.lease.venue)} target="_blank" rel="noreferrer">{short(cur.lease.venue)}</a></p></li>
            )}
            {cur.history.slice().reverse().map((h, i) => (
              <li key={i}><h4>{h.outcome === "Bought" ? "Vendida al espacio" : h.outcome === "Seized" ? "No fue devuelta" : "Expuesta y devuelta"}</h4>
                <p><span className={`tag ${h.outcome === "Seized" ? "bad" : "ok"}`}>{money(h.paid, 1)}</span>{when(h.start)} → {when(h.end)} · <a className="link mono" href={accountUrl(h.venue)} target="_blank" rel="noreferrer">{short(h.venue)}</a></p></li>
            ))}
            {!real && source !== "chain" && DEMO_HISTORY.map((h, i) => (
              <li key={i}><h4>Expuesta y devuelta</h4><p><span className="tag ok">{h.paid} {ASSET}</span>{when(h.start)} → {when(h.end)} · {h.venue} <span className="simtag">(ejemplo)</span></p></li>
            ))}
            {cur.history.length === 0 && !l.hung && source === "chain" && <li><h4>Todavía sin exposiciones</h4><p>La primera que se pague va a quedar acá, con fecha y monto.</p></li>}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ EVIDENCIA */
function Evidence() {
  const rows = evidence.rows as { label: string; hash: string }[];
  return (
    <section className="sec light" id="evidencia">
      <div className="wrap">
        <p className="kicker">Lo que ya pasó en Stellar</p>
        <h2 className="big" style={{ maxWidth: "18ch" }}>La transacción es la evidencia.</h2>
        <p className="lead">Contrato desplegado en Testnet, con obras publicadas, una colgada cobrando en vivo, una devuelta y una propina. Cada paso tiene su hash verificable.</p>
        <div className="tbl-wrap" style={{ color: "var(--tinta)" }}>
          <table className="tbl" style={{ color: "var(--tinta)" }}>
            <thead><tr><th>Qué pasó</th><th>Hash</th></tr></thead>
            <tbody>
              <tr><td>Contrato Muro (instancia de demo)</td><td>{CONTRACT_ID && CONTRACT_ID !== "PENDIENTE" ? <a className="mono" style={{ color: "var(--ultramar)" }} href={contractUrl(CONTRACT_ID)} target="_blank" rel="noreferrer">{short(CONTRACT_ID)}</a> : "pendiente"}</td></tr>
              {rows.map((r) => (<tr key={r.hash}><td>{r.label}</td><td><a className="mono" style={{ color: "var(--ultramar)" }} href={`https://stellar.expert/explorer/testnet/tx/${r.hash}`} target="_blank" rel="noreferrer">{r.hash.slice(0, 10)}…</a></td></tr>))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 26, color: "var(--tinta-2)", maxWidth: "58ch", fontSize: ".95rem" }}>En esta demo 1 día dura {DAY_SECS >= 86400 ? "24 horas" : `${DAY_SECS} segundos`} para que el contador se vea correr. El mismo contrato se despliega con días de 24 horas.</p>
        <p style={{ marginTop: 18 }}><a className="btn" href={href.evidencia}>Ver toda la evidencia</a></p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- FOOT */
function Foot() {
  return (
    <footer className="foot">
      <p className="quote">Antes de existir en el mundo, existió en la imaginación de alguien.</p>
      <p className="cite">Texto del sitio de FLAT 2026, junto al Retablo n.º 1 de Hilma af Klint (1915).</p>
      <div className="foot-grid">
        <div><b>Muro</b><br />Hackathon FLAT 2026 · BAF × Stellar<br />Mendoza, 26 al 28 de noviembre</div>
        <div>Obras de dominio público, con fuente en <a className="link" href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">Wikimedia Commons</a>.<br />Los datos de cada obra se contrastan antes de usarse fuera de la demo.</div>
        <div><a className="link" href={href.galeria}>Galería</a><br /><a className="link" href={href.publicar}>Publicar una obra</a><br /><a className="link" href={href.evidencia}>Evidencia</a></div>
      </div>
      <div className="foot-word" aria-hidden="true">Muro</div>
    </footer>
  );
}

export default function Landing() {
  const { entries, source } = useStore();
  return (<main><Hero entries={entries} source={source} /><Question /><How /><Sim /><Curriculum entries={entries} source={source} /><Evidence /><Foot /></main>);
}
export { UNIT };
