import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kit Inicial — Pequenos Passos",
  description: "Oferta especial do Kit Inicial por R$ 37,90. Pagamento único, acesso depois da compra e garantia de 7 dias.",
  robots: { index: false, follow: false },
};

export default function OfertaPage() {
  return (
    <main className="fn-oferta">
      <iframe className="fn-oferta-frame" src="/funil/oferta.html" title="Kit Inicial Pequenos Passos por R$ 37,90" />
    </main>
  );
}
