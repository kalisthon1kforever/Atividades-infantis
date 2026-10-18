import type { ComponentType, SVGProps } from "react";
import type { FeatureIcon } from "@/data/content";
import { idealTiles, notForWhom } from "@/data/content";
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

export function ForWhom() {
  return (
    <section className="section section-alt" id="para-quem">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Ideal para</span>
          <h2 className="title">
            Esse kit é <span className="hl">feito para você</span>
          </h2>
        </div>
        <ul className="ideal-tiles">
          {idealTiles.map((tile) => {
            const Icon = iconFor[tile.icon];
            return (
              <li className="ideal-tile" key={tile.title}>
                <span className="it-ico">
                  <Icon />
                </span>
                <div>
                  <b>{tile.title}</b>
                  <p>{tile.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="whom-muted">
          <h3>Quando este kit não é a melhor escolha</h3>
          <ul>
            {notForWhom.map((item) => (
              <li key={item}>
                <span className="whom-mark-x" aria-hidden="true">
                  ✕
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
