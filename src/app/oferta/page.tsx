import type { Metadata } from "next";
import {
  ANCORA_CADERNOS,
  ANCORA_MERCADO,
  AVISO_COMPLEMENTAR,
  CADERNOS_KIT,
  GARANTIA_DIAS,
  PILARES,
  PRECO_KIT,
  reais,
} from "@/lib/funil/modelo";

export const metadata: Metadata = {
  title: "Kit Completo — Pequenos Passos",
  description:
    "13 cadernos prontos para imprimir e acesso à Área Família. Pagamento único de R$ 37,90, garantia de 7 dias.",
  robots: { index: false, follow: false },
};

export default function OfertaPage() {
  return (
    <main className="fn-root fn-offer">
      <header className="fn-top">
        <p className="fn-brand">Pequenos Passos</p>
        <p className="fn-guarantee">Garantia de {GARANTIA_DIAS} dias, incondicional</p>
      </header>

      <section className="fn-card">
        <p className="fn-kicker">Kit Completo</p>
        <h1>
          13 cadernos prontos para imprimir: letras, números, emoções e rotina em 15 minutos por dia — sem preparar nada do zero.
        </h1>
        <p>
          Cada caderno custaria R$ 15 avulso — seriam {reais(ANCORA_CADERNOS)}. Hoje, o kit completo sai por {reais(PRECO_KIT)}, pagamento único.
          A referência de mercado para um conjunto assim fica em {reais(ANCORA_MERCADO)}.
        </p>
        <ul className="fn-pillars">
          {PILARES.map((pilar) => (
            <li key={pilar.id}>
              <b>
                {pilar.emoji} {pilar.nome}
              </b>
              <span>{pilar.cadernos}</span>
            </li>
          ))}
        </ul>
        <ul className="fn-checks">
          {CADERNOS_KIT.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="fn-card">
        <h2>E não é só PDF. Você entra na Área Família:</h2>
        <ul className="fn-checks">
          <li>Biblioteca organizada por pilar, idade e tempo</li>
          <li>Trilha do dia: a atividade de hoje já aparece na frente</li>
          <li>Favoritos e estrelas: cada “fizemos juntos” vira estrelinha</li>
          <li>Celular ou computador: login e senha provisória chegam por e-mail em minutos</li>
        </ul>
        <p>
          O app é de quem compra. Os 10 contos para dormir do quiz continuam só em PDF, sem login.
          Em qualquer ficha dá para imprimir: o papel não fica atrás do app.
        </p>
        <p className="fn-guarantee">Garantia de {GARANTIA_DIAS} dias, incondicional. Se não fizer sentido, devolvemos o valor.</p>
        <a className="fn-primary fn-block" href="/checkout">
          Quero o kit completo por {reais(PRECO_KIT)}
        </a>
        <p className="fn-guarantee">Garantia de {GARANTIA_DIAS} dias, incondicional</p>
        <p className="fn-fine">{AVISO_COMPLEMENTAR}</p>
      </section>
    </main>
  );
}
