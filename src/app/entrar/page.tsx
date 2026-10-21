import { EntrarForm } from "./entrar-form";

export const metadata = { title: "Entrar — Pequenos Passos" };

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = sp.next ?? "";
  return <EntrarForm nextPath={nextPath} />;
}
