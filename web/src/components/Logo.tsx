/**
 * Marca de Muro: un afiche pegado con cinta en la pared, con una M adentro.
 * Es el mismo gesto del producto: algo colgado que cobra por estar ahí.
 */
export function Mark({ className = "mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" role="img" aria-label="Muro">
      <g transform="rotate(-6 24 25)">
        <rect x="6" y="7" width="36" height="37" fill="#fbfaf4" stroke="#111" strokeWidth="3.5" />
        <path d="M12 38 V14 H18.4 L24 25 L29.6 14 H36 V38 H30 V25.6 L25.6 34 H22.4 L18 25.6 V38 Z" fill="var(--rosa)" stroke="#111" strokeWidth="2.2" strokeLinejoin="miter" />
        <path d="M13 5.6 L16 2.8 L19 5.4 L22 2.8 L33 3 L33.6 9.4 L22 9.2 L19 11.4 L16 9 L13 11.2 Z" fill="#ffe982" stroke="#111" strokeWidth="1" opacity=".95" transform="translate(-1 0) rotate(3 24 6)" />
      </g>
    </svg>
  );
}
