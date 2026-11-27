import Link from "next/link";
import { PieceCard } from "@/components/PieceCard";
import { Seal } from "@/components/Seal";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const steps = [
  {
    n: "I",
    title: "El artesano presenta la pieza",
    text: "Sube una foto, cuenta la técnica y los materiales. Su ficha dice de quién aprendió el oficio y desde cuándo lo trabaja.",
  },
  {
    n: "II",
    title: "La asociación la avala",
    text: "Un fiscalizador de la asociación revisa la pieza y emite el certificado. Solo la asociación puede firmar: queda registrado en Stellar con fecha y número.",
  },
  {
    n: "III",
    title: "Quien compra lo comprueba",
    text: "La pieza lleva una etiqueta con QR. Al escanearla se ve quién la hizo, dónde, y si la foto y la ficha son las que firmó la asociación.",
  },
];

export default async function Home() {
  const [pieces, artisans] = await Promise.all([store.listPieces(), store.listArtisans()]);
  const names = new Map(artisans.map((a) => [a.record.id, a.meta.name]));
  const latest = [...pieces].reverse().slice(0, 6);

  return (
    <>
      <section className="wrap" style={{ paddingBlock: "clamp(3.5rem, 10vw, 8rem) clamp(3rem, 8vw, 6rem)" }}>
        <div
          style={{
            display: "grid",
            gap: "clamp(2rem, 5vw, 4rem)",
            gridTemplateColumns: "minmax(0, 1fr)",
            alignItems: "end",
          }}
          className="hero"
        >
          <div className="stack" style={{ ["--stack" as string]: "1.75rem" }}>
            <p className="label">Primer caso · Plaza de las Artes, Mendoza</p>
            <h1 className="display">
              Cada pieza,
              <br />
              con su <em>origen</em>.
            </h1>
            <p className="lede">
              Hilo certifica artesanías hechas a mano: quién hizo cada pieza, con qué técnica y de quién aprendió
              el oficio. Un certificado firmado por la asociación de artesanos que nadie puede falsificar ni editar
              después.
            </p>
            <div className="btn-row">
              <Link className="btn" href="/piezas">
                Ver piezas certificadas
              </Link>
              <Link className="btn btn-ghost" href="#como-funciona">
                Cómo funciona
              </Link>
            </div>
          </div>
          <div className="hero-seal" aria-hidden="true">
            <Seal size={220} />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Cómo funciona</p>
            <h2 className="title">
              Tres pasos, <em>una firma</em>.
            </h2>
          </div>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.n} className="step">
                <span className="step-n">{step.n}</span>
                <h3 className="subtitle">{step.title}</h3>
                <p className="muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Últimas piezas</p>
            <div className="stack">
              <h2 className="title">Certificadas por la asociación</h2>
              {latest.length === 0 ? (
                <p className="lede">Todavía no hay piezas certificadas. La asociación las emite desde su panel.</p>
              ) : null}
            </div>
          </div>
          {latest.length > 0 ? (
            <div className="grid">
              {latest.map((piece) => (
                <PieceCard key={piece.record.id} piece={piece} artisanName={names.get(piece.meta.artisanId)} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="wrap why">
          <div className="section-head">
            <p className="label">Por qué</p>
            <h2 className="title">
              Lo hecho a mano compite contra <em>copias</em>.
            </h2>
          </div>
          <div className="why-grid">
            <div className="prose">
              <p>
                En las ferias se venden productos industriales como si fueran artesanales. Quien compra no puede
                distinguirlos, y el artesano que trabaja a mano compite contra algo más barato.
              </p>
              <p>
                Las ferias ya tienen quién avale a sus artesanos. Hilo le da a ese aval una forma de viajar con cada
                pieza, y cuenta algo que hoy no queda en ningún lado: de quién se aprendió cada oficio.
              </p>
            </div>
            <dl className="ficha">
              <div className="ficha-row">
                <dt className="label">En cadena</dt>
                <dd>Número, artesano, fecha, maestro y la huella de la foto y la ficha.</dd>
              </div>
              <div className="ficha-row">
                <dt className="label">Fuera de cadena</dt>
                <dd>La foto y los textos. Si alguien los cambia, la huella deja de coincidir y la página lo avisa.</dd>
              </div>
              <div className="ficha-row">
                <dt className="label">Cuentas</dt>
                <dd>Solo la asociación. El comprador escanea y lee, sin registrarse ni instalar nada.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
