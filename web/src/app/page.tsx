import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { LineageTree } from "@/components/LineageTree";
import { CountUp, Reveal } from "@/components/Motion";
import { PieceCard } from "@/components/PieceCard";
import { ScanDemo, type DemoSlide } from "@/components/ScanDemo";
import { getCounts } from "@/lib/stellar";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const EXAMPLES: DemoSlide[] = [
  {
    title: "Poncho de telar criollo",
    artisan: "Rosa B.",
    place: "Telar · Corrientes",
    number: 112,
    art: "textile",
    palette: ["#8a3a22", "#d6b07a", "#2f4234", "#efe3cc"],
  },
  {
    title: "Vasija de barro cocido",
    artisan: "Miguel A.",
    place: "Alfarería · Mendoza",
    number: 87,
    art: "ceramic",
    palette: ["#b5673f", "#7a3d22", "#e9c9a6", "#2b2620"],
  },
  {
    title: "Mate de alpaca cincelado",
    artisan: "Lucía O.",
    place: "Platería criolla · Corrientes",
    number: 143,
    art: "silver",
    palette: ["#d9d6cf", "#a8a39a", "#3c3a36", "#1f1d1a"],
  },
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
      <section className="cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cover-img" src="/img/tejedoras.jpg" alt="Dos tejedoras trabajando en sus telares" />
        <div className="cover-shade" />
        <div className="wrap cover-body">
          <p className="cover-kicker">Certificados de origen para artesanías</p>
          <h1 className="display">Lo hecho a mano, ahora se puede comprobar.</h1>
          <p className="cover-lead">
            Cada pieza lleva un certificado firmado por la asociación que avala a sus artesanos. Quien compra escanea el
            QR y ve quién la hizo, con qué técnica y de quién aprendió el oficio.
          </p>
          <div className="btn-row">
            <Link className="btn btn-brand" href="/piezas">
              Ver piezas certificadas
            </Link>
            <Link className="btn btn-light" href="#como-funciona">
              Cómo funciona
            </Link>
          </div>
        </div>
        <p className="credit cover-credit">
          Tejedoras en la Fiesta Nacional del Poncho, Catamarca. Foto: GtPLzcat89, CC0, Wikimedia Commons.
        </p>
      </section>

      <section className="section">
        <div className="wrap buyer">
          <div className="stack" style={{ ["--gap" as string]: "1.5rem" }}>
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
          </div>
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
          <div className="section-head">
            <p className="kicker">El problema</p>
            <h2 className="h2">En la feria, las dos cosas se venden una al lado de la otra.</h2>
          </div>
          <div className="diptych">
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/qom.jpg" alt="Cestería y cerámica artesanal de la Cooperativa de Artesanas Qom" />
              <figcaption>
                <strong>Hecho a mano.</strong> Cestería y cerámica de la Cooperativa de Artesanas Qom.
                <span className="credit">Foto: Ashazam, CC BY-SA 4.0, Wikimedia Commons.</span>
              </figcaption>
            </figure>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/feria-serie.jpg" alt="Puesto de feria con peluches y productos industriales" />
              <figcaption>
                <strong>Hecho en serie.</strong> Productos industriales en un puesto de feria de Tilcara, Jujuy.
                <span className="credit">Foto: Eugenialodi, CC BY-SA 4.0, Wikimedia Commons.</span>
              </figcaption>
            </figure>
          </div>
          <div className="columns-3">
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
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section how">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Cómo funciona</p>
            <h2 className="h2">Del taller a quien compra, con una firma en el medio.</h2>
          </div>
          <ol className="steps-plain">
            {STEPS.map((step, i) => (
              <li key={step.tag}>
                <span className="steps-plain-n">
                  {i + 1}. {step.tag}
                </span>
                <h3 className="h3">{step.title}</h3>
                <p className="muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section night">
        <div className="wrap lineage-split">
          <div className="stack" style={{ ["--gap" as string]: "1.5rem" }}>
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
          </div>
          <Reveal>
            <LineageTree />
          </Reveal>
        </div>
      </section>

      <section id="por-que" className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Por qué Stellar</p>
            <h2 className="h2">Una base de datos con QR mostraría lo mismo. No probaría lo mismo.</h2>
            <p className="lead">
              El problema no es de pagos, es de confianza. Lo que importa es que nadie, ni siquiera quien administra
              Oficio, pueda cambiar un certificado después de firmado.
            </p>
          </div>
          <div className="compare">
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
          </div>
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
            <img src="/img/poncho.jpg" alt="Poncho tejido a mano exhibido en un museo" />
            <figcaption className="credit">
              Poncho del Bicentenario, Museo de la Fiesta Nacional del Poncho. CC BY-SA 4.0, Wikimedia Commons.
            </figcaption>
          </figure>
          <div className="stack" style={{ ["--gap" as string]: "1.25rem" }}>
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
          </div>
        </div>
      </section>
    </>
  );
}
