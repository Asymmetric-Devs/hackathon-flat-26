import { useState } from "react";
import { applyCustom, savedColor } from "../theme";

/** Ruedita de color: elegís un color y pasa a ser el principal de todo el sitio (se recuerda en el navegador). */
export function ColorWheel() {
  const [mine, setMine] = useState<string | null>(savedColor);
  const pick = (v: string) => { setMine(v); applyCustom(v); };
  const reset = () => { setMine(null); applyCustom(null); };
  return (
    <>
      <label className="cw" title="Cambiar el color principal">
        <span className="sr">Cambiar el color principal</span>
        <input type="color" value={mine ?? "#e8d282"} onChange={(e) => pick(e.target.value)} />
      </label>
      {mine && <button className="cw-reset" type="button" onClick={reset}>Volver al color original</button>}
    </>
  );
}
