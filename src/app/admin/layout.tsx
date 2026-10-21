import Link from "next/link";
import { redirect } from "next/navigation";
import { getAreaUser } from "@/lib/area";

export const metadata = { title: "Admin — Pequenos Passos" };

const NAV = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/funil", label: "Funil" },
  { href: "/admin/pessoas", label: "Pessoas" },
  { href: "/admin/compras", label: "Compras" },
  { href: "/admin/catalogo", label: "Catálogo" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAreaUser();
  if (!user) redirect("/entrar");
  if (user.role !== "admin") redirect("/app");

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-brand">
          <span>Pequenos</span>
          <b>Passos</b>
          <small>CRM</small>
        </div>
        <nav className="admin-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <Link href="/app" className="admin-nav-soft">
            área da família ↗
          </Link>
        </nav>
      </header>
      <main id="conteudo" className="admin-main">
        {children}
      </main>
    </div>
  );
}
