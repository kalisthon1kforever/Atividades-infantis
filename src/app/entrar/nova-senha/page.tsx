import { getAreaUser } from "@/lib/area";
import Link from "next/link";
import { NovaSenhaForm } from "./nova-senha-form";

export const metadata = { title: "Senha nova — Pequenos Passos" };

export default async function NovaSenhaPage() {
  const user = await getAreaUser();

  return (
    <>
      {user ? (
        <NovaSenhaForm obrigatoria={user.mustChangePassword} />
      ) : (
        <section className="ent-card">
          <h1>Link de senha</h1>
          <p className="ent-lead">
            Abra o mais recente dos links que enviamos para o seu e-mail para criar a senha
            nova. Se o link expirar (eles valem pouco tempo, por segurança), é só pedir outro
            em “Esqueci minha senha”.
          </p>
          <Link href="/entrar" className="ent-link">
            Voltar para /entrar
          </Link>
        </section>
      )}
    </>
  );
}
