import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import type { FeatureIcon } from "@/data/content";
import { features } from "@/data/content";
import {
  CardsIcon,
  BookIcon,
  ChecklistIcon,
  ClockIcon,
  PagesIcon,
  PdfIcon,
  StarIcon,
} from "./icons";

const iconFor: Record<FeatureIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  pages: PagesIcon,
  activities: BookIcon,
  cards: CardsIcon,
  guide: BookIcon,
  checklist: ChecklistIcon,
  pdf: PdfIcon,
  clock: ClockIcon,
  star: StarIcon,
};

export function Solution() {
  return (
    <section className="section" id="beneficios">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Benefícios</span>
          <h2 className="title">
            O que muda quando você tem{" "}
            <span className="hl">as atividades certas</span>
          </h2>
          <p className="lead">
            O kit não acrescenta tarefas: ele organiza o que já existe para que
            o momento de aprendizada aconteça sem esforço.
          </p>
        </div>
        <div className="benefits-grid">
          <ul className="feats">
            {features.map((feature) => {
              const Icon = iconFor[feature.icon];
              return (
                <li className="feat" key={feature.title}>
                  <span className="sico">
                    <Icon />
                  </span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Image
            className="benefits-photo"
            src="/images/aprender-amor.jpg"
            alt="Pais e filha fazendo atividades juntas na mesa de casa"
            width={1200}
            height={1200}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
