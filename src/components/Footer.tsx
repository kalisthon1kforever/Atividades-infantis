export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-brand">Pequenos Passos</p>
        <p>
          Material educativo complementar. Não substitui a escola nem
          acompanhamento profissional.
        </p>
        <p>© {new Date().getFullYear()} Pequenos Passos. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
