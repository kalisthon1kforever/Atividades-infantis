import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pequenos Passos — Alfabetização em Casa | 100 atividades imprimíveis",
  description:
    "100 atividades prontas para imprimir para transformar 15 minutos do dia em um momento de aprendizagem com seu filho. Letras, palavras, números e atenção, no ritmo da criança.",
  openGraph: {
    title: "Pequenos Passos — Alfabetização em Casa",
    description:
      "100 atividades imprimíveis para praticar letras, palavras, números e atenção com seu filho, em casa e sem telas.",
    images: ["/hero-familia.png"],
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
