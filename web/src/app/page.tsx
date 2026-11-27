import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { LineageTree } from "@/components/LineageTree";
import { Logo } from "@/components/Logo";
import { CountUp, Reveal } from "@/components/Motion";
import { PieceCard } from "@/components/PieceCard";
import { ScanDemo, type DemoSlide } from "@/components/ScanDemo";
import { getCounts } from "@/lib/stellar";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const EXAMPLES: DemoSlide[] = [
  {
    title: "Cuenco de gres esmaltado",
    artisan: "Taller de cerámica",
    place: "Torno · Mendoza",
    number: 1,
    photoUrl: "/img/torno.jpg",
  },
  {
    title: "Juego de cucharas talladas",
    artisan: "Taller de madera",
    place: "Tallado · Corrientes",
    number: 2,
    photoUrl: "/img/cucharas.jpg",
  },
]

const CRAFTS = [
  "Cerámica",
  "Tallado en madera",
  "Platería",
  "Marroquinería",
  "Tejido",
  "Cestería",
  "Orfebrería",
  "Vidrio soplado",
  "Talabartería",
  "Cuchillería",
  "Encuadernación",
  "Luthería",
];

const STEPS: { icon: IconName; tag: string; title: string; text: string }[] = [
  {
    icon: "hand",
    tag: "Artesano",
    title: "Presenta la pieza",
    text: "Foto, técnica y materiales. Su ficha dice de quién aprendió el oficio y desde cuándo lo trabaja.",
  },
  {
    icon: "stamp",
    tag: "Asociación",
    title: "La avala y la certifica",
    text: "La entidad que fiscaliza a los artesanos revisa la pieza y emite el certificado desde su panel.",
  },
  {
    icon: "chain",
    tag: "Stellar",
    title: "La firma queda en cadena",
    text: "Número, artesano, maestro y la huella de la foto y la ficha. Nadie puede cambiarlo después.",
  },
  {
    icon: "scan",
    tag: "Comprador",
    title: "Escanea y comprueba",
    text: "Sin registrarse ni instalar nada. La página recalcula la huella y dice si coincide con lo firmado.",
  },
];

const COMPARE: { label: string; db: boolean; us: boolean }[] = [
  { label: "Muestra quién hizo la pieza", db: true, us: true },
  { label: "El comprador no necesita cuenta ni app", db: true, us: true },
  { label: "Nadie puede editar el certificado después", db: false, us: true },
  { label: "La firma es de la asociación, no de quien administra el sistema", db: false, us: true },
  { label: "Si la plataforma cierra, el certificado sigue verificable", db: false, us: true },
  { label: "Avisa si alguien cambió la foto o la ficha", db: false, us: true },
];

export default async function Home() {
  const [pieces, artisans, counts] = await Promise.all([store.listPieces(), store.listArtisans(), getCounts()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));
  const places = new Map(artisans.map((a) => [a.record.id, [a.meta.craft, a.meta.city].filter(Boolean).join(" · ")]));
  const latest = [...pieces].reverse().slice(0, 4);
  const lineages = artisans.filter((a) => a.meta.learnedFrom?.artisanId).length;

  const realSlides: DemoSlide[] = latest
    .filter((p) => !p.record.revokeTxHash)
    .map((p) => ({
      title: p.meta.title,
      artisan: names.get(p.meta.artisanId) ?? "",
      place: places.get(p.meta.artisanId) ?? p.meta.technique,
      number: p.record.id,
      photoUrl: `/api/files/pieces/${p.record.id}`,
    }));
  const slides = realSlides.length >= 2 ? realSlides : EXAMPLES;

  const figures = [
    { value: counts?.pieces ?? pieces.length, label: "Piezas certificadas", foot: "Certificados emitidos" },
    { value: counts?.artisans ?? artisans.length, label: "Artesanos registrados", foot: "Con ficha firmada" },
    { value: lineages, label: "Vínculos maestro-aprendiz", foot: "La línea del oficio, en cadena" },
  ];

  return (
    <>
      <section className="intro">
        <div className="wrap intro-grid">
          <h1 className="display marks">
            <span className="line">
              <span style={{ ["--d" as string]: "0ms" }}>Lo hecho a</span>
            </span>
            <span className="line">
              <span style={{ ["--d" as string]: "110ms" }}>mano, ahora</span>
            </span>
            <span className="line">
              <span style={{ ["--d" as string]: "220ms" }}>se puede</span>
            </span>
            <span className="line">
              <span style={{ ["--d" as string]: "330ms" }}>
                <em>comprobar</em>.
              </span>
            </span>
          </h1>
          <div className="intro-side fade-up" style={{ ["--d" as string]: "450ms" }}>
            <p className="lead">
              Oficio emite un certificado por cada artesanía, firmado en Stellar por la asociación que avala a sus
              artesanos. Quien compra escanea el QR y ve quién la hizo, cómo, y de quién aprendió el oficio.
            </p>
            <div className="btn-row">
              <Link className="btn btn-brand" href="/piezas">
                Ver piezas certificadas
              </Link>
              <Link className="btn btn-secondary" href="#como-funciona">
                Cómo funciona
              </Link>
            </div>
            <p className="faint small">Primer caso: Plaza de las Artes, Mendoza · Piloto con artesanos de Corrientes</p>
          </div>
        </div>
        <div className="wrap">
          <figure className="band">
            <div className="band-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/torno.jpg" alt="Manos de un ceramista dando forma a una pieza en el torno" />
            </div>
            <div className="cert-card" aria-label="Vista previa de un certificado">
              <div className="cert-card-inner">
              <div className="cert-head">
                <Logo size={20} />
                <span className="badge badge-ok">
                  <span className="dot" /> Vigente
                </span>
              </div>
              <div>
                <p className="faint small">Certificado de origen · N.º 0001</p>
                <p className="cert-title">Cuenco de gres esmaltado</p>
              </div>
              <dl className="cert-rows">
                <div>
                  <dt>Técnica</dt>
                  <dd>Torno y esmalte a mano</dd>
                </div>
                <div>
                  <dt>Huella de la foto</dt>
                  <dd className="ok">
                    <Icon name="check" size={14} stroke={2.6} /> Coincide
                  </dd>
                </div>
                <div>
                  <dt>Firmado por</dt>
                  <dd>Asociación de artesanos</dd>
                </div>
              </dl>
                <p className="faint small">Vista previa ilustrativa</p>
              </div>
            </div>
            <figcaption className="credit">Foto: Quino Al, CC0, Wikimedia Commons.</figcaption>
          </figure>
        </div>
      </section>

      <div className="marquee" aria-label="Oficios">
        <div className="marquee-track">
          {[...CRAFTS, ...CRAFTS].map((craft, i) => (
            <span key={`${craft}-${i}`} className="marquee-item" aria-hidden={i >= CRAFTS.length}>
              {craft}
            </span>
          ))}
        </div>
      </div>

      <section className="section section-dots">
        <div className="wrap buyer">
          <Reveal className="stack">
            <p className="kicker">Del lado de quien compra</p>
            <h2 className="h2">Escanea la etiqueta. En diez segundos sabe qué tiene en la mano.</h2>
            <p className="lead">
              No hace falta registrarse ni instalar nada. La página compara la foto y la ficha con lo que la asociación
              firmó en Stellar al certificar, y lo dice claro: coincide, no coincide o fue revocado.
            </p>
            <dl className="facts">
              <div>
                <dt>Quién la hizo</dt>
                <dd>Nombre, oficio y puesto del artesano.</dd>
              </div>
              <div>
                <dt>Cómo se hizo</dt>
                <dd>Técnica, materiales y la historia de la pieza.</dd>
              </div>
              <div>
                <dt>De dónde viene el oficio</dt>
                <dd>De quién aprendió, y de quién aprendió su maestro.</dd>
              </div>
              <div>
                <dt>Si es auténtica</dt>
                <dd>La firma de la asociación, verificada en vivo.</dd>
              </div>
            </dl>
          </Reveal>
          <ScanDemo slides={slides} illustrative={slides === EXAMPLES} />
        </div>
      </section>

      {figures[0].value > 0 ? (
        <section className="tally">
          <div className="wrap tally-row">
            {figures.map((f) => (
              <div key={f.label}>
                <span className="tally-value">
                  <CountUp value={f.value} />
                </span>
                <span className="tally-label">{f.label}</span>
              </div>
            ))}
            <p className="faint small tally-note">
              {counts ? "Leído en vivo del contrato en Stellar testnet." : "Datos del registro de la asociación."}
            </p>
          </div>
        </section>
      ) : null}

      <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">El problema</p>
            <h2 className="h2">En la feria, las dos cosas se venden una al lado de la otra.</h2>
          </Reveal>
          <div className="diptych">
            <Reveal>
            <figure>
              <div className="frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/cucharas.jpg" alt="Cucharas y espátulas de madera talladas a mano" />
              </div>
              <figcaption>
                <strong>Hecho a mano.</strong> Utensilios de madera tallados uno por uno.
                <span className="credit">Foto: Gabriela Sellart, CC BY-SA 4.0, Wikimedia Commons.</span>
              </figcaption>
            </figure>
            </Reveal>
            <Reveal delay={140}>
            <figure>
              <div className="frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/serie.jpg" alt="Estantes de un local de recuerdos con figuras fabricadas en serie" />
              </div>
              <figcaption>
                <strong>Hecho en serie.</strong> Recuerdos fabricados por miles, idénticos entre sí.
                <span className="credit">Foto: Harald Groven, CC BY-SA 2.0, Wikimedia Commons.</span>
              </figcaption>
            </figure>
            </Reveal>
          </div>
          <Reveal className="columns-3">
            <div>
              <h3 className="h3">Quien compra no puede distinguirlas.</h3>
              <p className="muted">
                Sobre todo el turista, que no conoce el oficio. “Artesanal” es una palabra que cualquiera puede poner
                en una etiqueta.
              </p>
            </div>
            <div>
              <h3 className="h3">El artesano compite contra algo más barato.</h3>
              <p className="muted">Y no tiene una forma de demostrar que su trabajo es suyo y hecho a mano.</p>
            </div>
            <div>
              <h3 className="h3">El oficio se transmite sin dejar rastro.</h3>
              <p className="muted">De quién se aprende cada técnica no queda escrito en ningún lado.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="como-funciona" className="section how">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">Cómo funciona</p>
            <h2 className="h2">Del taller a quien compra, con una firma en el medio.</h2>
          </Reveal>
          <ol className="steps-plain">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.tag} delay={i * 110}>
                <span className="steps-plain-n">
                  {i + 1}. {step.tag}
                </span>
                <h3 className="h3">{step.title}</h3>
                <p className="muted">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section night">
        <div className="wrap lineage-split">
          <Reveal className="stack">
            <p className="kicker">La línea del oficio</p>
            <h2 className="h2">Cada pieza viene de alguien que aprendió de alguien.</h2>
            <p className="lead">
              Al registrar a un artesano, la asociación firma también de quién aprendió. Con el tiempo queda escrito el
              árbol de cada oficio de la región: una memoria que hoy se transmite de palabra y se pierde.
            </p>
            <p className="muted">
              El vínculo maestro-aprendiz queda en el contrato. Si el maestro no está registrado, su nombre queda igual
              en la ficha. Quien compra ve la línea completa en la página de la pieza.
            </p>
          </Reveal>
          <Reveal>
            <LineageTree />
          </Reveal>
        </div>
      </section>

      <section id="por-que" className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">Por qué Stellar</p>
            <h2 className="h2">Una base de datos con QR mostraría lo mismo. No probaría lo mismo.</h2>
            <p className="lead">
              El problema no es de pagos, es de confianza. Lo que importa es que nadie, ni siquiera quien administra
              Oficio, pueda cambiar un certificado después de firmado.
            </p>
          </Reveal>
          <Reveal className="compare">
            <div className="compare-row compare-head">
              <span />
              <span>
                <span>Base de datos con QR</span>
              </span>
              <span className="is-us">
                <span>Oficio en Stellar</span>
              </span>
            </div>
            {COMPARE.map((row) => (
              <div key={row.label} className="compare-row">
                <span>{row.label}</span>
                <span className={row.db ? "yes" : "no"}>
                  <Icon name={row.db ? "check" : "x"} size={16} /> <span>{row.db ? "Sí" : "No"}</span>
                </span>
                <span className="is-us yes">
                  <Icon name="check" size={16} /> <span>Sí</span>
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
                <p className="kicker">Recién certificadas</p>
                <h2 className="h2">Piezas con origen verificado</h2>
              </div>
              <Link className="link" href="/piezas">
                Ver todas
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
            <img src="/img/plateria.jpg" alt="Banco de trabajo de un platero con herramientas" />
            <figcaption className="credit">
              Banco de trabajo de platería. Foto: Thomas Farley, CC0, Wikimedia Commons.
            </figcaption>
          </figure>
          <Reveal className="stack">
            <p className="kicker">Para asociaciones y ferias</p>
            <h2 className="h2">Su fiscalización, visible en cada pieza que se vende.</h2>
            <p className="lead">
              La asociación entra con una contraseña, registra a sus artesanos y emite certificados. Sin wallets ni
              instalaciones: la firma en Stellar la hace la plataforma con la cuenta de la asociación.
            </p>
            <div className="btn-row">
              <Link className="btn" href="/panel">
                Entrar al panel
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
