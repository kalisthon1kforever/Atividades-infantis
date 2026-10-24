import type { Metadata } from "next";
import { FunilCliente } from "./FunilCliente";

export const metadata: Metadata = {
  title: "Quiz Pequenos Passos — perfil da rotina",
  description: "Seis perguntas e um PDF com 10 contos para dormir. O app abre só para quem compra o kit.",
  robots: { index: false, follow: false },
};

export default function QuizFunnelPage() {
  return <FunilCliente />;
}
