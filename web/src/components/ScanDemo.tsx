"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export type DemoSlide = {
  title: string;
  artisan: string;
  place: string;
  number: number;
  /** Foto real de una pieza certificada; si falta, se dibuja una ilustración. */
  photoUrl?: string;
  art?: "textile" | "ceramic" | "silver";
  palette?: [string, string, string, string];
};

const STEPS = ["Foto registrada al certificar", "Ficha sin cambios", "Firmado por la asociación"];

/** El celular que escanea: recorre piezas y tilda cada verificación en orden. */
export function ScanDemo({ slides, illustrative }: { slides: DemoSlide[]; illustrative: boolean }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState(0); // 0 escaneando · 1..3 tildes · 4 verificado
  const slide = slides[index % slides.length];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = window.setTimeout(() => setPhase(4), 0);
      return () => clearTimeout(t);
    }
    const timers = [0, 900, 1350, 1800, 2350].map((ms, i) => window.setTimeout(() => setPhase(i), ms));
    const next = window.setTimeout(() => {
      if (!document.hidden) setIndex((n) => (n + 1) % slides.length);
    }, 6800);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(next);
    };
  }, [index, slides.length]);

  const [t1, t2, t3, t4] = slide.palette ?? ["#8a3a22", "#d6b07a", "#2f4234", "#efe3cc"];

  return (
    <div className="demo">
      <div className="phone">
        <div className="screen" aria-live="polite">
          <div className="screen-bar" aria-hidden="true">
            <span>9:41</span>
            <span>5G</span>
          </div>
          <div className="screen-url">oficio.app/p/{slide.number}</div>
          <div className="screen-body">
            <div className="screen-photo">
              {slide.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div
                  className={slide.art ?? "textile"}
                  style={{ ["--t1" as string]: t1, ["--t2" as string]: t2, ["--t3" as string]: t3, ["--t4" as string]: t4 }}
                />
              )}
              {phase === 0 ? <span key={index} className="scanline" /> : null}
            </div>
            <div>
              <p className="screen-title">{slide.title}</p>
              <p className="screen-sub">
                {slide.artisan} · {slide.place}
              </p>
            </div>
            <ul className="checks">
              {STEPS.map((label, i) => (
                <li key={label} className={phase > i ? "is-done" : ""}>
                  <span className="check-icon">
                    <Icon name="check" size={11} stroke={3} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <div className={phase >= 4 ? "verified is-on" : "verified"}>
              <Icon name="check" size={18} stroke={2.6} />
              <span>
                Hecho a mano, verificado
                <small>Certificado vigente en Stellar</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-dots" role="tablist" aria-label="Elegir pieza">
        {slides.map((s, i) => (
          <button
            key={`${s.number}-${i}`}
            role="tab"
            aria-selected={i === index % slides.length}
            aria-label={s.title}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      {illustrative ? <p className="demo-note">Ejemplos ilustrativos</p> : null}
    </div>
  );
}
