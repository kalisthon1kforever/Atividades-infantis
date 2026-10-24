import type { Metadata } from "next";
import { AcessoCliente } from "./acesso-cliente";

export const metadata: Metadata = {
  title: "Acesso Total por R$ 19,90 — Pequenos Passos",
  description: "Oferta do Acesso Total por R$ 19,90, com complementos opcionais no checkout.",
  robots: { index: false, follow: false },
};

export default function AcessoPage() {
  return <AcessoCliente />;
}
