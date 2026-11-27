import Link from "next/link";
import { Icon } from "@/components/Icon";
import { LineageTree } from "@/components/LineageTree";
import { Logo } from "@/components/Logo";
import { CountUp, Reveal } from "@/components/Motion";
import { PieceCard } from "@/components/PieceCard";
import { ScanDemo, type DemoSlide } from "@/components/ScanDemo";
import { getDict } from "@/lib/i18n/server";
import { getCounts } from "@/lib/stellar";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const EXAMPLE_PHOTOS = ["/img/torno.jpg", "/img/cucharas.jpg"];

export default async function Home() {
  const [{ t }, pieces, artisans, counts] = await Promise.all([
    getDict(),
    store.listPieces(),
    store.listArtisans(),
    getCounts(),
  ]);
  const h = t.home;
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));
  const places = new Map(artisans.map((a) => [a.record.id, [a.meta.craft, a.meta.city].filter(Boolean).join(" · ")]));
  const latest = [...pieces].reverse().slice(0, 4);
  const lineages = artisans.filter((a) => a.meta.learnedFrom?.artisanId).length;

  const examples: DemoSlide[] = t.demo.examples.map(([title, artisan, place], i) => ({
    title,
    artisan,
    place,
    number: i + 1,
    photoUrl: EXAMPLE_PHOTOS[i],
  }));
  const realSlides: DemoSlide[] = latest
    .filter((p) => !p.record.revokeTxHash)
    .map((p) => ({
      title: p.meta.title,
      artisan: names.get(p.meta.artisanId) ?? "",
      place: places.get(p.meta.artisanId) ?? p.meta.technique,
      number: p.record.id,
      photoUrl: `/api/files/pieces/${p.record.id}`,
    }));
  const illustrative = realSlides.length < 2;
  const slides = illustrative ? examples : realSlides;

  const figures = [counts?.pieces ?? pieces.length, counts?.artisans ?? artisans.length, lineages];
  const lines = h.h1;

  return (
    <>
      <section className="intro">
        <div className="wrap intro-grid">
          <h1 className="display marks">
            {lines.map((line, i) => (
              <span key={line} className="line">
                <span style={{ ["--d" as string]: `${i * 110}ms` }}>{line}</span>
              </span>
            ))}
            <span className="line">
              <span style={{ ["--d" as string]: `${lines.length * 110}ms` }}>
                <em>{h.h1Em}</em>.
              </span>
            </span>
          </h1>
          <div className="intro-side fade-up" style={{ ["--d" as string]: "450ms" }}>
            <p className="lead">{h.lead}</p>
            <div className="btn-row">
              <Link className="btn btn-brand" href="/piezas">
                {h.ctaPieces}
              </Link>
              <Link className="btn btn-secondary" href="#como-funciona">
                {h.ctaHow}
              </Link>
            </div>
            <p className="faint small">{h.cases}</p>
          </div>
        </div>
        <div className="wrap">
          <figure className="band">
            <div className="band-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/torno.jpg" alt={h.bandAlt} />
            </div>
            <div className="cert-card" aria-label={h.certPreview}>
              <div className="cert-card-inner">
                <div className="cert-head">
                  <Logo size={20} />
                  <span className="badge badge-ok">
                    <span className="dot" /> {h.valid}
                  </span>
                </div>
                <div>
                  <p className="faint small">{h.certLabel}</p>
                  <p className="cert-title">{h.certTitle}</p>
                </div>
                <dl className="cert-rows">
                  <div>
                    <dt>{h.certTechnique}</dt>
                    <dd>{h.certTechniqueValue}</dd>
                  </div>
                  <div>
                    <dt>{h.certPhoto}</dt>
                    <dd className="ok">
                      <Icon name="check" size={14} stroke={2.6} /> {h.certMatches}
                    </dd>
                  </div>
                  <div>
                    <dt>{h.certSigned}</dt>
                    <dd>{h.certSignedValue}</dd>
                  </div>
                </dl>
                <p className="faint small">{h.certIllustrative}</p>
              </div>
            </div>
            <figcaption className="credit">Foto: Quino Al, CC0, Wikimedia Commons.</figcaption>
          </figure>
        </div>
      </section>

      <div className="marquee" aria-label={h.craftsLabel}>
        <div className="marquee-track">
          {[...h.crafts, ...h.crafts].map((craft, i) => (
            <span key={`${craft}-${i}`} className="marquee-item" aria-hidden={i >= h.crafts.length}>
              {craft}
            </span>
          ))}
        </div>
      </div>

      <section className="section section-dots">
        <div className="wrap buyer">
          <Reveal className="stack">
            <p className="kicker">{h.buyerKicker}</p>
            <h2 className="h2">{h.buyerTitle}</h2>
            <p className="lead">{h.buyerLead}</p>
            <dl className="facts">
              {h.facts.map(([dt, dd]) => (
                <div key={dt}>
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <ScanDemo slides={slides} illustrative={illustrative} />
        </div>
      </section>

      {figures[0] > 0 ? (
        <section className="tally">
          <div className="wrap tally-row">
            {figures.map((value, i) => (
              <div key={h.tally[i]}>
                <span className="tally-value">
                  <CountUp value={value} />
                </span>
                <span className="tally-label">{h.tally[i]}</span>
              </div>
            ))}
            <p className="faint small tally-note">{counts ? h.tallyLive : h.tallyLocal}</p>
          </div>
        </section>
      ) : null}

      <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">{h.problemKicker}</p>
            <h2 className="h2">{h.problemTitle}</h2>
          </Reveal>
          <div className="diptych">
            <Reveal>
              <figure>
                <div className="frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/cucharas.jpg" alt={h.handAlt} />
                </div>
                <figcaption>
                  <strong>{h.handCaption[0]}</strong> {h.handCaption[1]}
                  <span className="credit">Foto: Gabriela Sellart, CC BY-SA 4.0, Wikimedia Commons.</span>
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={140}>
              <figure>
                <div className="frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/serie.jpg" alt={h.serialAlt} />
                </div>
                <figcaption>
                  <strong>{h.serialCaption[0]}</strong> {h.serialCaption[1]}
                  <span className="credit">Foto: Harald Groven, CC BY-SA 2.0, Wikimedia Commons.</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
          <Reveal className="columns-3">
            {h.problems.map(([title, text]) => (
              <div key={title}>
                <h3 className="h3">{title}</h3>
                <p className="muted">{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="como-funciona" className="section how">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">{h.howKicker}</p>
            <h2 className="h2">{h.howTitle}</h2>
          </Reveal>
          <ol className="steps-plain">
            {h.steps.map(([tag, title, text], i) => (
              <Reveal as="li" key={tag} delay={i * 110}>
                <span className="steps-plain-n">
                  {i + 1}. {tag}
                </span>
                <h3 className="h3">{title}</h3>
                <p className="muted">{text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section night">
        <div className="wrap lineage-split">
          <Reveal className="stack">
            <p className="kicker">{h.lineageKicker}</p>
            <h2 className="h2">{h.lineageTitle}</h2>
            <p className="lead">{h.lineageLead}</p>
            <p className="muted">{h.lineageNote}</p>
          </Reveal>
          <Reveal>
            <LineageTree />
          </Reveal>
        </div>
      </section>

      <section id="por-que" className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">{h.whyKicker}</p>
            <h2 className="h2">{h.whyTitle}</h2>
            <p className="lead">{h.whyLead}</p>
          </Reveal>
          <Reveal className="compare">
            <div className="compare-row compare-head">
              <span />
              <span>
                <span>{h.compareDb}</span>
              </span>
              <span className="is-us">
                <span>{h.compareUs}</span>
              </span>
            </div>
            {h.compare.map(([label, db]) => (
              <div key={label} className="compare-row">
                <span>{label}</span>
                <span className={db ? "yes" : "no"}>
                  <Icon name={db ? "check" : "x"} size={16} /> <span>{db ? h.yes : h.no}</span>
                </span>
                <span className="is-us yes">
                  <Icon name="check" size={16} /> <span>{h.yes}</span>
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {latest.length > 0 ? (
        <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="wrap">
            <div className="section-row">
              <div className="stack" style={{ ["--gap" as string]: "0.75rem" }}>
                <p className="kicker">{h.latestKicker}</p>
                <h2 className="h2">{h.latestTitle}</h2>
              </div>
              <Link className="link" href="/piezas">
                {h.seeAll}
              </Link>
            </div>
            <div className="pieces">
              {latest.map((piece) => (
                <PieceCard key={piece.record.id} piece={piece} artisanName={names.get(piece.meta.artisanId)} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section closing">
        <div className="wrap closing-row">
          <figure className="closing-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/plateria.jpg" alt={h.closingAlt} />
            <figcaption className="credit">{h.closingCredit}</figcaption>
          </figure>
          <Reveal className="stack">
            <p className="kicker">{h.closingKicker}</p>
            <h2 className="h2">{h.closingTitle}</h2>
            <p className="lead">{h.closingLead}</p>
            <div className="btn-row">
              <Link className="btn" href="/panel">
                {h.closingCta}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
