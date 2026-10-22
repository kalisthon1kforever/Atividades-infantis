import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pequenos Passos — Atividades para aprender junto com seu filho",
  description:
    "Atividades prontas para imprimir ou fazer no app, separadas por módulo: atenção, letras, números, coordenação, emoções e rotina. Faça o quiz grátis e receba 10 atividades.",
  openGraph: {
    title: "Pequenos Passos — Atividades para aprender junto com seu filho",
    description:
      "15 minutos por dia aprendendo junto, sem preparar nada do zero. Quiz grátis de 1 minuto e 10 atividades de presente.",
    images: ["/brand/hero-familia.jpg"],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap"
        />
        <script
          src="https://mcp.figma.com/mcp/html-to-design/capture.js"
          async
        />
      </head>
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
