import { Fragment } from "react";

/**
 * Parte un texto en palabras y letras para poder animarlas una por una.
 * Los contenedores deben llevar su propio aria-label: las letras sueltas se ocultan al lector de pantalla.
 */
export function Chars({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="wd" aria-hidden="true">
            {[...w].map((c, j) => <span className="ch" key={j}>{c}</span>)}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
