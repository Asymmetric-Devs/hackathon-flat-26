/**
 * Marca: una pared de ladrillos con uno pintado de naranja y el chorreado de la pintura.
 * Dice muro y dice calle. Al pasar el mouse, la pintura chorrea un poco más.
 */
export function Mark({ className = "mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" role="img" aria-label="Muro">
      <rect width="48" height="48" rx="12" fill="#121212" />
      <g fill="#fbfaf5">
        <rect x="6" y="7" width="17" height="8.5" rx="1.2" />
        <rect x="25" y="7" width="17" height="8.5" rx="1.2" />
        <rect x="6" y="32.5" width="17" height="8.5" rx="1.2" />
        <rect x="25" y="32.5" width="17" height="8.5" rx="1.2" />
        <rect x="6" y="19.7" width="8" height="8.5" rx="1.2" />
        <rect x="34" y="19.7" width="8" height="8.5" rx="1.2" />
      </g>
      <g fill="var(--ac)">
        <rect x="16" y="19.7" width="16" height="8.5" rx="1.2" />
        <g className="drip a"><rect x="19.2" y="27.4" width="2.8" height="7.8" /><circle cx="20.6" cy="36.5" r="2.2" /></g>
        <g className="drip b"><rect x="27.1" y="27.4" width="2.2" height="3.8" /><circle cx="28.2" cy="32.8" r="1.8" /></g>
      </g>
    </svg>
  );
}
