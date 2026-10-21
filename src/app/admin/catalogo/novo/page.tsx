import { ActivityForm } from "../activity-form";

export const metadata = { title: "Nova ficha — Admin" };

export default function NovaFichaPage() {
  return (
    <div className="admin-pad">
      <h1>Nova ficha</h1>
      <p className="admin-lead">
        Conteúdo com as chaves de padrão já suportadas (ache-iguais, ligar-cor, pintar-letra,
        contar, contar-multiplo, labirinto, picotado, tracejado, silaba, wordcards, copiar,
        sequencia, emocoes, emocoes-cards, termometro, rotina-ordem, rotina-cards,
        nomear-figura, estrela-dia, professor-plan).
      </p>
      <section className="admin-card admin-wide">
        <ActivityForm />
      </section>
    </div>
  );
}
