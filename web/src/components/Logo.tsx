/**
 * Marca: un afiche pegado en la pared, con la esquina despegada, dos renglones de texto
 * y un puntito de precio. Mosaico del color de acento, símbolo oscuro.
 */
export function Mark({ className = "mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role="img" aria-label="Muro">
      <rect width="32" height="32" rx="8" fill="var(--ac)" />
      <g transform="rotate(-5 16 17)">
        <path d="M9 6.5h10.2l5.3 5.3V26.5H9z" fill="#121212" />
        <path d="M19.2 6.5v5.3h5.3z" fill="#fbfaf5" />
        <rect x="11.6" y="14.6" width="10.2" height="1.9" rx=".95" fill="#fbfaf5" />
        <rect x="11.6" y="18.4" width="6.4" height="1.9" rx=".95" fill="#fbfaf5" opacity=".55" />
        <circle cx="20.6" cy="23" r="1.9" fill="var(--ac)" />
      </g>
    </svg>
  );
}
