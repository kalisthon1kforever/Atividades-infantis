import Image from "next/image";
import type { GalleryImage } from "@/data/content";
import { galleryRowA, galleryRowB } from "@/data/content";
import { offerConfig } from "@/config/offer";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { WhatYouGet } from "@/components/WhatYouGet";
import { Reviews } from "@/components/Reviews";
import { Modules } from "@/components/Modules";
import { ForWhom } from "@/components/ForWhom";
import { Offer } from "@/components/Offer";
import { HowItWorks } from "@/components/HowItWorks";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";

function GalleryRow({ images, reverse }: { images: GalleryImage[]; reverse?: boolean }) {
  return (
    <div className="marquee">
      <div className={reverse ? "marquee-track marquee-rev" : "marquee-track"}>
        {[0, 1].map((copy) =>
          images.map((image) => (
            <div className="photo-card" key={`${copy}-${image.src}`}>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function Guarantee() {
  return (
    <section className="section" id="garantia">
      <div className="container">
        <div className="guarantee-card">
          <div className="seal" aria-hidden="true">
            <b>{offerConfig.guaranteeDays}</b>
            <small>dias</small>
          </div>
          <div className="guarantee-body">
            <h2>
              <span className="hl">{offerConfig.guaranteeDays} dias</span> de
              garantia
            </h2>
            <p>
              Risco zero para você: teste o material no ritmo da sua família por
              até {offerConfig.guaranteeDays} dias após a compra. Se achar que
              não combina com a rotina de casa, basta pedir o reembolso —
              devolvemos o valor integralmente, sem perguntas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main id="conteudo">
      <div className="strip">
        <div className="container strip-inner">
          <span>Material 100% digital em PDF</span>
          <i className="sep" aria-hidden="true" />
          <span>Entrega imediata após o pagamento</span>
          <i className="sep" aria-hidden="true" />
          <span>Garantia incondicional de {offerConfig.guaranteeDays} dias</span>
        </div>
      </div>
      <Hero />
      <section className="section" id="previa">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Prévia</span>
            <h2 className="title">
              Dê uma olhada <span className="hl">dentro do kit</span>
            </h2>
            <p className="lead">
              Arte oficial que acompanha o arquivo em PDF: atividades, cartões,
              guias e materiais de apoio.
            </p>
          </div>
          <div className="photo-marquee">
            <GalleryRow images={galleryRowA} />
            <GalleryRow images={galleryRowB} reverse />
          </div>
        </div>
      </section>
      <Problem />
      <Solution />
      <ForWhom />
      <WhatYouGet />
      <Reviews />
      <Modules />
      <Offer />
      <Guarantee />
      <HowItWorks />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
