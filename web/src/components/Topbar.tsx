"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { href: "/piezas", label: "Piezas" },
  { href: "/artesanos", label: "Artesanos" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#por-que", label: "Por qué Stellar" },
];

/** Barra ancha arriba; al bajar se vuelve una píldora flotante. */
export function Topbar() {
  const pathname = usePathname();
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={["topbar", floating && "is-floating", pathname === "/" && "on-cover"].filter(Boolean).join(" ")}>
      <div className="topbar-inner">
        <Link href="/" aria-label="Oficio, inicio">
          <Logo />
        </Link>
        <nav className="nav-links" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={!link.href.includes("#") && pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/panel" className="btn btn-sm">
          Asociación
        </Link>
      </div>
    </header>
  );
}
