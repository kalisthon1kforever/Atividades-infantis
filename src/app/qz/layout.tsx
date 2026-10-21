import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Pequenos Passos — Descubra o kit certo",
  description:
    "Responda 6 perguntas rápidas e veja a recomendação do Kit Inicial Pequenos Passos.",
  robots: { index: false, follow: false },
};

export default function QuizLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
