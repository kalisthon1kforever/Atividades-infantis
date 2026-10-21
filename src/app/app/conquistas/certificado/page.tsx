import Link from "next/link";
import { getAreaUser, getChildren, getProfile, saoPauloDate } from "@/lib/area";
import { PrintStartButton } from "@/components/print-start-button";

export const metadata = { title: "Certificado — Pequenos Passos" };

function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function CertificadoPage() {
  const user = await getAreaUser();
  if (!user) return null;
  const [children, profile] = await Promise.all([getChildren(user.id), getProfile(user.id)]);
  const childName = children[0]?.name || profile?.name || "Seu pequeno";
  const today = formatDateBr(saoPauloDate());

  return (
    <div className="print-wrap">
      <div className="print-toolbar no-print">
        <p>O certificado sai com o nome da criança e a data de hoje. Folha A4, horizontal se der. 🎓</p>
        <PrintStartButton />
        <Link href="/app/conquistas" className="btn btn-ghost">← Conquistas</Link>
      </div>

      <article className="certificate">
        <p className="cert-kicker">Pequenos Passos</p>
        <h1>Certificado de Aprendizagem Juntos</h1>
        <p className="cert-line">Certificamos com grande carinho que</p>
        <p className="cert-name">{childName}</p>
        <p className="cert-line">
          aprendeu junto com quem cuida, em momentinhos de 5 a 10 minutos,
          no ritmo que coube naquele dia — com risada, descoberta e constância.
        </p>
        <p className="cert-date">________, ________ de ________ · {today}</p>
        <div className="cert-feet">
          <p className="cert-sign">
            <span />
            <small>Assinado por quem cuida</small>
          </p>
          <p className="cert-seal">💛⭐💛</p>
        </div>
        <p className="cert-foot">
          Pequenos Passos · aprender juntos, um passo por dia · sem ranking e sem pressa
        </p>
      </article>
    </div>
  );
}
