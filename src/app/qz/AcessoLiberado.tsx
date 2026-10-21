import { ACESSO_TOTAL_ITEMS } from "./funil-data";

type Props = {
  name: string;
  email: string;
  password: string;
  emailSent: boolean;
};

export function AcessoLiberado({ name, email, password, emailSent }: Props) {
  const hello = name.trim() ? name.trim() : "família";
  return (
    <div className="qz-acesso">
      <div className="qz-acesso-hero">
        <p className="qz-amostra-kicker">Festa liberada</p>
        <h1>Parabéns, {hello}! 🎉</h1>
        <p>
          Você acaba de adquirir e garantir que seu filho aprenda junto com você.
          Os dados de acesso do app já {emailSent ? "foram enviados para o seu e-mail" : "estão aqui embaixo"}.
        </p>
      </div>
      <div className="qz-acesso-card">
        <p className="qz-amostra-tag">Dados de acesso</p>
        <p>
          E-mail: <strong>{email}</strong>
        </p>
        <p>
          Senha temporária: <strong>{password}</strong>
        </p>
        <p className="qz-acesso-hint">
          Esta senha é temporária e você pode alterar no primeiro acesso.
        </p>
      </div>
      <ul className="qz-acesso-list">
        {ACESSO_TOTAL_ITEMS.map((item) => (
          <li key={item}>✅ {item}</li>
        ))}
      </ul>
    </div>
  );
}
