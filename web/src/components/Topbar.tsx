"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Logo } from "./Logo";
import { LangSwitch, ThemeSwitch } from "./Prefs";

/** Barra ancha arriba; al bajar se vuelve una píldora flotante. */
export function Topbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/piezas", label: t.nav.pieces },
    { href: "/artesanos", label: t.nav.artisans },
    { href: "/#como-funciona", label: t.nav.how },
    { href: "/#por-que", label: t.nav.why },
  ];

  return (
    <header className={floating ? "topbar is-floating" : "topbar"}>
      <div className="topbar-inner">
        <Link href="/" aria-label={t.nav.home}>
          <Logo />
        </Link>
        <nav className="nav-links" aria-label={t.nav.main}>
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
        <div className="topbar-end">
          <LangSwitch />
          <ThemeSwitch />
          <Link href="/panel" className="btn btn-sm">
            {t.nav.panel}
          </Link>
        </div>
      </div>
    </header>
  );
}
