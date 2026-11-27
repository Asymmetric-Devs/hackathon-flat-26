/**
 * Loguito: tres hileras de ladrillos, uno pintado de naranja que chorrea. Sin recuadro:
 * los ladrillos toman el color del texto y el pintado el del acento.
 */
export function Mark({ className = "mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 58 48" role="img" aria-label="Muro" overflow="visible">
      <g fill="currentColor">
        <rect x="0" y="1" width="17" height="10" rx="1.6" /><rect x="20" y="1" width="17" height="10" rx="1.6" /><rect x="40" y="1" width="18" height="10" rx="1.6" />
        <rect x="0" y="14" width="7" height="10" rx="1.6" /><rect x="40" y="14" width="18" height="10" rx="1.6" />
        <rect x="0" y="27" width="17" height="10" rx="1.6" /><rect x="20" y="27" width="17" height="10" rx="1.6" /><rect x="40" y="27" width="18" height="10" rx="1.6" />
      </g>
      <g className="paint">
        <rect x="10" y="14" width="27" height="10.5" rx="1.8" fill="var(--ac)" transform="rotate(-3 23 19)" />
        <g className="drip a" fill="var(--ac)"><rect x="15" y="22" width="3.6" height="14" rx="1.8" /><circle cx="16.8" cy="38" r="2.9" /></g>
        <g className="drip b" fill="var(--ac)"><rect x="27.5" y="22" width="3" height="7" rx="1.5" /><circle cx="29" cy="30.6" r="2.4" /></g>
      </g>
    </svg>
  );
}
