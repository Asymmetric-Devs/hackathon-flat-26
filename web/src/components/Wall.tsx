import { useLayoutEffect, useMemo, useRef } from "react";
import { Entry } from "../chain";
import { gsap, reduced } from "../fx";
import { money } from "../format";
import { live } from "../live";
import { href } from "../router";
import { useStore } from "../store";
import { Cartela, Dot, Painting, useView } from "./Art";

function Item({ e, i }: { e: Entry; i: number }) {
  const { r, l } = useView(e);
  return (
    <a className="hw-item" href={href.obra(e.work.id)} data-cursor="Ver obra" aria-label={`${r.title}, ${r.artist}. Ver la obra.`}>
      <span className="hw-idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
      <div className="hw-art" style={{ ["--rt" as string]: `${(i % 2 ? 1 : -1) * (1 + (i % 3) * 0.6)}deg` }}>
        <Painting r={r} variant={i % 3 === 1 ? "frame" : "paste"} work={e.work.id}><Dot e={e} l={l} /></Painting>
      </div>
      <Cartela e={e} r={r} l={l} compact />
    </a>
  );
}

/**
 * "La pared": una tira horizontal con todas las obras que se recorre con el scroll (la sección se
 * clava en pantalla). En el celular es una tira que se desliza con el dedo. Muestra, en vivo, cuánto
 * se les pagó a los artistas en esta demo.
 */
export function Wall({ entries }: { entries: Entry[] }) {
  const { now } = useStore();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const list = useMemo(() => entries.slice(0, 6), [entries]);

  const total = useMemo(() => entries.reduce((sum, e) => {
    if (e.work.status === "Sold") return sum + e.work.price;
    return sum + live(e, now).credited + e.history.reduce((a, h) => a + h.paid, 0n);
  }, 0n), [entries, now]);

  useLayoutEffect(() => {
    if (reduced()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const t = track.current!, sec = root.current!;
      const dist = () => Math.max(0, t.scrollWidth - window.innerWidth + 80);
      const run = () => Math.round(dist() * 0.6); // se recorre más rápido que el ancho real: menos scroll
      const tw = gsap.to(t, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + run(), pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1 } });
      sec.querySelectorAll<HTMLElement>(".hw-art").forEach((el, i) => {
        gsap.fromTo(el, { yPercent: -7, rotation: i % 2 ? 3 : -3 }, { yPercent: 7, rotation: i % 2 ? -2 : 2, ease: "none", scrollTrigger: { trigger: el, containerAnimation: tw, start: "left right", end: "right left", scrub: true } });
      });
      sec.querySelectorAll<HTMLElement>(".hw-idx").forEach((el) => {
        gsap.fromTo(el, { xPercent: 25 }, { xPercent: -25, ease: "none", scrollTrigger: { trigger: el, containerAnimation: tw, start: "left right", end: "right left", scrub: true } });
      });
      gsap.fromTo(sec.querySelector(".hw-bar i"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + run(), scrub: true } });
    });
    return () => mm.revert();
  }, [list.length]);

  return (
    <section className="sec wall hwall" id="pared" ref={root} aria-label="La pared: todas las obras">
      <div className="hw-pin">
        <div className="hw-track" ref={track}>
          <div className="hw-intro">
            <p className="kicker">La pared, en vivo</p>
            <h2 className="big" aria-label="Así se ve un muro que paga">Así se ve un muro que <em>paga.</em></h2>
            <p className="lead">Todas las obras publicadas en el contrato. <span className="hide-m">Seguí con el scroll</span><span className="show-m">Deslizá hacia el costado</span>: cada una muestra lo que ya cobró.</p>
            <div className="hw-total"><b className="num">{money(total, 1)}</b><span>pagados a artistas en Stellar Testnet (demo)</span></div>
            <span className="hw-hint" aria-hidden="true"><span className="hide-m">Seguí bajando →</span><span className="show-m">Deslizá →</span></span>
          </div>
          {list.map((e, i) => <Item key={e.work.id} e={e} i={i} />)}
          <div className="hw-end">
            <h3 className="big">¿Tenés una pared?</h3>
            <p className="lead">Colgá una obra o publicá la tuya. Se cobra por día.</p>
            <div className="hero-cta"><a className="btn" href={href.galeria}>Ver la galería</a><a className="btn line" href={href.publicar}>Publicar una obra</a></div>
          </div>
        </div>
        <div className="hw-bar" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
