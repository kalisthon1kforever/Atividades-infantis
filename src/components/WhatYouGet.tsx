import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import type { Deliverable } from "@/data/content";
import { deliverables, wordCards } from "@/data/content";
import { WordCard } from "./WordCard";
import {
  CardsIcon,
  BookIcon,
  ChecklistIcon,
  PagesIcon,
  PdfIcon,
  StarIcon,
} from "./icons";

const iconFor: Record<Deliverable["icon"], ComponentType<SVGProps<SVGSVGElement>>> = {
  pages: PagesIcon,
  activities: BookIcon,
  cards: CardsIcon,
  guide: BookIcon,
  checklist: ChecklistIcon,
  pdf: PdfIcon,
};

export function WhatYouGet() {
  return (
    <section className="section" id="recebe">
      <div className="container">
        <div className="section-head">
          <span className="kicker">O conteúdo completo</span>
          <h2 className="title">
            Tudo o que <span className="hl">você recebe</span>
          </h2>
          <p className="lead">
            Um único arquivo em PDF com material completo e apoio para o adulto
            conduzir cada atividade.
          </p>
        </div>
        <div className="receive-card">
          <Image
            className="receive-photo"
            src="/images/pequenos-passos-poster.jpg"
            alt="Poster do kit Pequenos Passos com os cinco módulos e os cartões de palavras"
            width={849}
            height={1200}
            loading="lazy"
          />
          <div>
            <h3>Pequenos Passos — Alfabetização em Casa</h3>
            <ul className="dlist">
              {deliverables.map((item) => {
                const Icon = iconFor[item.icon];
                return (
                  <li key={item.title}>
                    <span className="dico">
                      <Icon />
                    </span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <p className="preview-note">
          Mostra dos 20 cartões de palavras que acompanham o kit
        </p>
        <div className="marquee" aria-label="Cartões de palavras do kit">
          <div className="marquee-track">
            {[0, 1].map((copy) =>
              wordCards.map((card) => (
                <WordCard key={`${copy}-${card.word}`} card={card} />
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
