import Link from "next/link";
import { getAreaUser, touchProfile } from "@/lib/area";
import { AppNav } from "./app-nav";

export const metadata = {
  title: "Área da família — Pequenos Passos",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAreaUser();

  // "bate o último acesso" para o painel admin (ativos nos últimos 7 dias)
  if (user) {
    await touchProfile(user.id, user.name);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link href="/app" className="app-brand">
          <span className="ent-brand-1">Pequenos</span>
          <span className="ent-brand-2">Passos</span>
        </Link>
        {user ? (
          <Link href="/app/conta" className="app-header-user" aria-label="Abrir conta">
            <span className="app-header-avatar" aria-hidden="true">👤</span>
            <span>
              Olá, <strong>{user.name || "família"}</strong>
            </span>
          </Link>
        ) : null}
      </header>
      <main id="conteudo" className="app-main">
        {children}
      </main>
      <AppNav />
    </div>
  );
}
