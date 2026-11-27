import { useId } from "react";

type Props = {
  number?: number;
  size?: number;
  muted?: boolean;
  label?: string;
};

/** El sello: anillo con leyenda y número de catálogo al centro. */
export function Seal({ number, size = 132, muted = false, label = "Hilo · Sello de origen · Mendoza ·" }: Props) {
  const id = useId().replace(/:/g, "");
  const color = muted ? "var(--ink-faint)" : "var(--lacre)";
  const text = `${label} ${label} `;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={number ? `Sello de origen número ${number}` : "Sello de origen"}
      style={{ color, flex: "none" }}
    >
      <defs>
        <path id={`ring-${id}`} d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <text
        fill="currentColor"
        style={{ fontFamily: "var(--mono)", fontSize: 11.2, letterSpacing: 2.2, textTransform: "uppercase" }}
      >
        <textPath href={`#ring-${id}`} startOffset="0">
          {text.toUpperCase()}
        </textPath>
      </text>
      {number !== undefined ? (
        <>
          <text
            x="100"
            y="86"
            textAnchor="middle"
            fill="currentColor"
            style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 2 }}
          >
            N.º
          </text>
          <text
            x="100"
            y="122"
            textAnchor="middle"
            fill="currentColor"
            style={{ fontFamily: "var(--serif)", fontSize: 38, fontStyle: "italic", letterSpacing: -1 }}
          >
            {String(number).padStart(4, "0")}
          </text>
        </>
      ) : (
        <text
          x="100"
          y="114"
          textAnchor="middle"
          fill="currentColor"
          style={{ fontFamily: "var(--serif)", fontSize: 42, fontStyle: "italic", letterSpacing: -1 }}
        >
          Hilo
        </text>
      )}
    </svg>
  );
}
