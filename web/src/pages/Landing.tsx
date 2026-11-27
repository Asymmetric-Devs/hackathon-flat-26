import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Entry } from "../chain";
import { resolve } from "../catalog";
import { Cartela, Dot, Painting, useView } from "../components/Art";
import { Intro } from "../components/Intro";
import { Wordmark } from "../components/Wordmark";
import { Chars } from "../components/Split";
import { Wall } from "../components/Wall";
import { gsap, reduced, ScrollTrigger, scrollToId } from "../fx";
import { demoEntries } from "../live";
import { href } from "../router";
import { useStore } from "../store";
import { ASSET } from "../config";

/* ------------------------------------------------------------------ HERO */
type Slot = { slug: string; x: number; y: number; w: number; r0: number; rt: number; cx?: string; mw: string; ms: string; v: "paste" | "frame" };
const SLOTS: Slot[] = [
  { slug: "candido-curupayti", x: 44, y: 8, w: 30, r0: -1.6, rt: -1.2, cx: "4%", mw: "88%", ms: "end", v: "paste" },
  { slug: "afklint-retablo", x: 79, y: 5, w: 11, r0: 2.4, rt: 2, mw: "46%", ms: "start", v: "frame" },
  { slug: "manet-bar", x: 50, y: 30, w: 24, r0: -2.2, rt: 1.4, cx: "4%", mw: "78%", ms: "center", v: "paste" },
  { slug: "vangogh-terraza", x: 80, y: 34, w: 10, r0: 3, rt: -2.5, mw: "42%", ms: "end", v: "frame" },
  { slug: "pueyrredon-alto", x: 6, y: 50, w: 22, r0: 1.8, rt: -1.6, mw: "92%", ms: "start", v: "paste" },
  { slug: "fader-mantones", x: 30, y: 44, w: 14, r0: -2.8, rt: 2.2, mw: "58%", ms: "center", v: "frame" },
];

function HungPiece({ slot, e }: { slot: Slot; e: Entry }) {
  const { r, l } = useView(e);
  const vars = { ["--x" as string]: `${slot.x}vw`, ["--y" as string]: `${slot.y}vw`, ["--w" as string]: `${slot.w}vw`, ["--rt" as string]: `${slot.rt}deg`, ["--cx" as string]: slot.cx ?? "0", ["--mw" as string]: slot.mw, ["--ms" as string]: slot.ms, ["--cr" as string]: `${-slot.rt * 0.8}deg` };
  return (
    <div className="hung" style={vars} data-r0={slot.r0} data-depth={(slot.w / 14).toFixed(2)}>
      <a href={href.obra(e.work.id)} data-cursor="Ver obra" aria-label={`${r.title}, ${r.artist}. Ver la obra.`}>
        <Painting r={r} variant={slot.v} eager work={e.work.id}><Dot e={e} l={l} /></Painting>
      </a>
      <Cartela e={e} r={r} l={l} compact />
    </div>
  );
}

function Hero({ entries, source, ready, landed, withIntro }: { entries: Entry[]; source: string; ready: boolean; landed: boolean; withIntro: boolean }) {
  const root = useRef<HTMLElement>(null);
  const bySlug = useMemo(() => {
    const m = new Map<string, Entry>();
    for (const e of entries) m.set(e.work.meta, e);
    for (const d of demoEntries()) if (!m.has(d.work.meta)) m.set(d.work.meta, { ...d, work: { ...d.work, id: -1 } });
    return m;
  }, [entries]);

  // Estado inicial: todo escondido antes del primer pintado, a la espera de la intro.
  useLayoutEffect(() => {
    if (reduced()) return;
    const q = gsap.utils.selector(root.current!);
    gsap.set(q(".ln-in"), { yPercent: 118 });
    gsap.set(q(".hero-copy mark"), { clipPath: "inset(0 100% 0 0)" });
    gsap.set(q(".hero-copy p, .hero-cta"), { opacity: 0, y: 28 });
    gsap.set(q(".hung"), { opacity: 0 });
    gsap.set(q(".hung .dot"), { scale: 0 });
    gsap.set(q(".hung .cartela"), { opacity: 0, y: 18 });
    gsap.set(q(".hung .tape"), { scaleX: 0, transformOrigin: "0 50%" });
    if (withIntro) gsap.set(q(".word"), { opacity: 0 }); // la palabra gigante llega volando desde la intro
      }, []);

  useLayoutEffect(() => { if (landed) gsap.set(root.current!.querySelector(".word"), { opacity: 1 }); }, [landed]);

  // Parallax con el scroll (contenedores, para no pisar las entradas).
  useLayoutEffect(() => {
    if (reduced()) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".word", { yPercent: -16, ease: "none", scrollTrigger: st });
      gsap.to(".hang-stage", { yPercent: -5, ease: "none", scrollTrigger: st });
      gsap.to(".hero-copy", { yPercent: 14, opacity: 0.2, ease: "none", scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  // Coreografía de entrada + parallax con el mouse.
  useLayoutEffect(() => {
    const el = root.current!;
    if (!ready) return;
    if (reduced()) {
      // sin movimiento: todo visible y quieto, sin tocar el layout
      gsap.set(el.querySelectorAll(".hung"), { opacity: 1 });
      return;
    }
    const stage = el.querySelector<HTMLElement>(".hang-stage")!;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const impact = (h: HTMLElement) => {
        gsap.fromTo(h, { scaleY: 0.94, scaleX: 1.025, transformOrigin: "50% 100%" }, { scaleY: 1, scaleX: 1, duration: 0.85, ease: "elastic.out(1,.35)" });
        gsap.fromTo(stage, { x: 0, y: 0 }, { x: gsap.utils.random(-5, 5), y: gsap.utils.random(2, 5), duration: 0.04, repeat: 3, yoyo: true, ease: "none", onComplete: () => { gsap.set(stage, { x: 0, y: 0 }); } });
        gsap.to(h.querySelector(".dot"), { scale: 1, duration: 0.6, ease: "back.out(3)", delay: 0.05 });
        gsap.to(h.querySelectorAll(".tape"), { scaleX: 1, duration: 0.35, ease: "power3.out" });
        gsap.to(h.querySelector(".cartela"), { opacity: 1, y: 0, duration: 0.6, delay: 0.12, ease: "expo.out" });
      };
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(q(".ln-in"), { yPercent: 0, duration: 1, stagger: 0.14 }, 0.1)
        .to(q(".hero-copy mark"), { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "expo.inOut", stagger: 0.16 }, 0.3)
        .to(q(".hero-copy p, .hero-cta"), { opacity: 1, y: 0, duration: 0.85, stagger: 0.12 }, 0.75);
      q<HTMLElement>(".hung").forEach((h, i) => {
        const r0 = Number(h.dataset.r0 ?? 0);
        tl.fromTo(h, { opacity: 0, y: -170, scale: 1.45, rotation: r0 * 3, transformOrigin: "50% 0%" },
          { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.42, ease: "power3.in", onComplete: () => impact(h) }, 0.2 + i * 0.17);
      });
    }, el);
    // Solo la obra bajo el puntero reacciona: se inclina hacia donde se mueve el mouse y se levanta un poco.
    let off = () => {};
    if (matchMedia("(pointer: fine)").matches) {
      const offs: (() => void)[] = [];
      el.querySelectorAll<HTMLElement>(".hung > a").forEach((a) => {
        const move = (ev: PointerEvent) => {
          const b = a.getBoundingClientRect();
          const px = (ev.clientX - b.left) / b.width - 0.5, py = (ev.clientY - b.top) / b.height - 0.5;
          gsap.to(a, { rotateY: px * 12, rotateX: -py * 10, scale: 1.035, transformPerspective: 900, duration: 0.45, ease: "power3.out", overwrite: "auto" });
        };
        const leave = () => gsap.to(a, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.8, ease: "elastic.out(1,.5)", overwrite: "auto" });
        a.addEventListener("pointermove", move); a.addEventListener("pointerleave", leave);
        offs.push(() => { a.removeEventListener("pointermove", move); a.removeEventListener("pointerleave", leave); });
      });
      off = () => offs.forEach((f) => f());
    }
    return () => { off(); ctx.revert(); };
  }, [ready]);

  return (
    <>
      <section className="hero concrete" aria-label="Muro" ref={root}>
        <div className="word" aria-hidden="true"><Wordmark className="hword"  drips={false} title="" /></div>
        <div className="hang-stage">
          {SLOTS.map((s) => { const e = bySlug.get(s.slug); return e ? <HungPiece key={s.slug} slot={s} e={e.work.id < 0 ? { ...e, work: { ...e.work, id: 0 } } : e} /> : null; })}
        </div>
        <div className="hero-copy">
          <h1 aria-label="La obra cobra por día.">
            <span className="ln" aria-hidden="true"><span className="ln-in"><Chars text="La obra" /></span></span>
            <span className="ln" aria-hidden="true"><mark><span className="ln-in"><Chars text="cobra" /></span></mark></span>
            <span className="ln" aria-hidden="true"><mark><span className="ln-in"><Chars text="por día." /></span></mark></span>
          </h1>
          <p>Colgá una obra en tu bar. Pagá el alquiler por día. Cuando llegás al precio, es tuya.</p>
          <div className="hero-cta">
            <a className="btn" href={href.galeria}>Ver la galería</a>
            <a className="btn line" href="#como" onClick={(e) => { e.preventDefault(); scrollToId("como"); }}>Cómo funciona</a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ LA PREGUNTA */
/** Lámina editorial: una obra con su epígrafe, como en un catálogo. */
function Plate({ slug }: { slug: string }) {
  const r = resolve(slug);
  return (
    <figure className="plate" data-reveal>
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
            <h2 className="big" data-scrub aria-label="¿Cuánto cobra una obra por colgar un mes en la pared de un bar?"><Chars text="¿Cuánto cobra una obra por colgar un mes en la pared de un bar?" /></h2>
          </div>
          <Plate slug="vangogh-terraza" />
        </div>
        <div className="q-side">
          <p className="lead" data-up style={{ marginTop: 0 }}>Pinturas, fotos y grabados decoran bodegas, cafés y hoteles de todo el país. La obra trabaja todos los días, pero rara vez hay un precio, un contrato claro o un registro de dónde estuvo.</p>
          <div className="twocol" data-up>
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
            <div className="how-ghost" key={s} aria-hidden="true">0{s + 1}</div>
            <div className="how-obj" aria-hidden="true">
              <div className="how-frame" data-s={s}>
                <Painting r={r} variant="paste" />
              </div>
              <div className="cartela">
                <b>{r.title}</b><i>{r.artist}, {r.year}</i>
                {s === 0 && <div className="row"><span>Precio {price} {ASSET}</span><span>{rate} {ASSET} por día</span></div>}
                {s === 1 && <div className="row"><span>Depósito 30 {ASSET} en garantía</span><span>10 días prepagos</span></div>}
                {s === 2 && (<><div className="row"><span>Día {day} · cobró {credited} {ASSET}</span><span>{Math.round((credited / price) * 100)} %</span></div><div className="bar-p"><span style={{ width: `${(credited / price) * 100}%`, transition: "width .1s linear" }} /></div></>)}
                {s === 3 && <div className="row"><span>Día 110 · pagó {price} {ASSET}</span><span>es suya</span></div>}
              </div>
            </div>
          </div>
          <ol className="how-steps">
            {STEPS.map((st, i) => (
              <li key={i} data-i={i} className={s === i ? "on" : ""} ref={(n) => { items.current[i] = n; }}>
                <span className="step">Paso {i + 1} de 4</span>
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
        <h2 className="big" data-rise style={{ maxWidth: "20ch" }} aria-label="El arte es lo único que en Argentina no se compra en cuotas. Hasta ahora."><Chars text="El arte es lo único que en Argentina no se compra en cuotas." /> <em aria-hidden="true"><Chars text="Hasta ahora." /></em></h2>
        <div className="sim">
          <div className="ctrl" data-up>
            <label><span>Precio de la obra<output>{price} {ASSET}</output></span><input type="range" min={50} max={1000} step={10} value={price} onChange={(e) => setPrice(+e.target.value)} aria-label="Precio de la obra" /></label>
            <label><span>Alquiler por día<output>{rate} {ASSET}</output></span><input type="range" min={1} max={20} step={1} value={rate} onChange={(e) => setRate(+e.target.value)} aria-label="Alquiler por día" /></label>
            <label><span>Días colgada<output>{d}</output></span><input type="range" min={0} max={Math.max(toOwn, 1)} step={1} value={d} onChange={(e) => setDays(+e.target.value)} aria-label="Días colgada" /></label>
            <p style={{ color: "var(--tinta-2)", fontSize: ".92rem", maxWidth: "36ch" }}>Mové los controles. Con estos números, la obra es del espacio al día {toOwn}.</p>
          </div>
          <div className="sim-card" data-up>
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

/* --------------------------------------------------------------------- FOOT */
function Foot() {
  return (
    <footer className="foot">
      <p className="quote" data-scrub aria-label="Antes de existir en el mundo, existió en la imaginación de alguien."><Chars text="Antes de existir en el mundo, existió en la imaginación de alguien." /></p>
      <p className="cite">Texto del sitio de FLAT 2026, junto al Retablo n.º 1 de Hilma af Klint (1915).</p>
      <div className="foot-grid">
        <div><b>Muro</b><br />Hackathon FLAT 2026 · BAF × Stellar<br />Mendoza, 26 al 28 de noviembre</div>
        <div>Obras de dominio público, con fuente en <a className="link" href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">Wikimedia Commons</a>.<br />Los datos de cada obra se contrastan antes de usarse fuera de la demo.</div>
        <div><nav className="foot-links" aria-label="Pie"><a href={href.galeria}>Galería</a><a href={href.publicar}>Publicar una obra</a><a href={href.evidencia}>Evidencia</a></nav></div>
      </div>
      <div className="foot-word" aria-hidden="true"><Wordmark className="fword"  tight title="" /></div>
    </footer>
  );
}

/* ------------------------------------------------------- efectos con el scroll */
function useScrollFx(root: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (reduced()) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      // texto que se "enciende" letra por letra mientras se scrollea
      q<HTMLElement>("[data-scrub]").forEach((h) => {
        const chars = h.querySelectorAll(".ch");
        gsap.set(chars, { opacity: 0.14 });
        gsap.to(chars, { opacity: 1, stagger: 0.06, ease: "none", scrollTrigger: { trigger: h, start: "top 82%", end: "bottom 50%", scrub: true } });
      });
      // titulares que suben desde una máscara
      q<HTMLElement>("[data-rise]").forEach((h) => {
        const chars = h.querySelectorAll(".ch");
        gsap.from(chars, { yPercent: 115, rotate: 5, duration: 0.95, ease: "expo.out", stagger: 0.016, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
      });
      // bloques que entran en cascada
      const ups = q<HTMLElement>("[data-up]");
      gsap.set(ups, { opacity: 0, y: 56 });
      ScrollTrigger.batch(ups, { start: "top 90%", once: true, onEnter: (b) => { gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "expo.out" }); } });
      // lámina que se revela como una cortina
      q<HTMLElement>("[data-reveal]").forEach((f) => {
        const p = f.querySelector(".paste");
        if (!p) return;
        gsap.fromTo(p, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "expo.inOut", clearProps: "clipPath", scrollTrigger: { trigger: f, start: "top 82%", once: true } });
        gsap.fromTo(p.querySelector("img"), { scale: 1.35 }, { scale: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: f, start: "top 82%", once: true } });
      });
      // el cuadro de "cómo se cuelga" gira mientras se avanza
      gsap.fromTo(".how-obj", { rotation: -5 }, { rotation: 4, ease: "none", scrollTrigger: { trigger: ".how-steps", start: "top bottom", end: "bottom top", scrub: true } });
      // el MURO del pie se llena de naranja
      gsap.fromTo(".fword .l:not(.o)", { opacity: 0.12 }, { opacity: 1, ease: "none", stagger: 0.25, scrollTrigger: { trigger: ".foot", start: "top 85%", end: "bottom bottom", scrub: true } });
    }, el);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    const t = setTimeout(refresh, 700);
    return () => { clearTimeout(t); ctx.revert(); };
  }, [root]);
}

/** La intro corre en cada carga de la página (no al volver al inicio dentro de la misma sesión de navegación). */
let introPlayed = false;
const shouldIntro = () => !introPlayed && !reduced();

export default function Landing() {
  const { entries, source } = useStore();
  const [intro, setIntro] = useState(shouldIntro);
  // si se navega fuera antes de terminar la intro, no vuelve a bloquear el scroll al volver
  useEffect(() => () => { introPlayed = true; }, []);
  const [ready, setReady] = useState(!intro);
  const [landed, setLanded] = useState(!intro);
  const root = useRef<HTMLElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onLanded = useCallback(() => setLanded(true), []);
  const onDone = useCallback(() => { introPlayed = true; setIntro(false); }, []);
  useScrollFx(root);
  return (
    <main ref={root}>
      {intro && <Intro onReady={onReady} onLanded={onLanded} onDone={onDone} />}
      <Hero entries={entries} source={source} ready={ready} landed={landed} withIntro={intro} />
      <Question />
      <How />
      <Wall entries={entries} />
      <Sim />
      <Foot />
    </main>
  );
}
