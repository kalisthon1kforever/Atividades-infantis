import Link from "next/link";

export default function EntrarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ent-root">
      <header className="ent-header">
        <Link href="/" className="ent-brand">
          <span className="ent-brand-1">Pequenos</span>
          <span className="ent-brand-2">Passos</span>
        </Link>
        <p className="ent-tagline">Aprender juntos, 5 a 10 minutos por vez.</p>
      </header>
      <main id="conteudo" className="ent-main">
        {children}
      </main>
      <footer className="ent-footer">
        <p>Com carinho, Família Pequenos Passos</p>
      </footer>
    </div>
  );
}
