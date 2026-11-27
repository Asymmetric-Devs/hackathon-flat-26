/** Isotipo de Oficio: una "o" con un nudo de costura. */
export function LogoMark({ size = 30, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <circle cx="15" cy="17" r="9.2" fill="none" stroke="currentColor" strokeWidth="4.4" />
      <rect x="21.2" y="3.6" width="7.2" height="7.2" rx="1.2" transform="rotate(45 24.8 7.2)" fill="var(--brand, #d2522a)" />
    </svg>
  );
}

/** Logotipo: los puntos de las íes son nudos de costura. */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="brand">
      <LogoMark size={size} />
      <span className="wordmark" aria-label="oficio">
        of<span className="knot">ı</span>c<span className="knot">ı</span>o
      </span>
    </span>
  );
}
