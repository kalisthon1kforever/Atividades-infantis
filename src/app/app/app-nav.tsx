"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/app", label: "Início", icon: "🏠" },
  { href: "/app/biblioteca", label: "Biblioteca", icon: "📚" },
  { href: "/app/trilha-30-dias", label: "Trilha", icon: "🗓️" },
  { href: "/app/conquistas", label: "Conquistas", icon: "⭐" },
  { href: "/app/conta", label: "Conta", icon: "👤" },
];

export function AppNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="app-nav" aria-label="Área da família">
      <ul>
        {ITEMS.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className={active ? "is-on" : ""} aria-current={active ? "page" : undefined}>
                <span className="app-nav-ico" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
