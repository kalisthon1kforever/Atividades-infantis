import Image from "next/image";
import type { GalleryImage } from "@/data/content";
import { reviewImages, reviewsNote } from "@/data/content";

function Row({ images, reverse }: { images: GalleryImage[]; reverse?: boolean }) {
  return (
    <div className="marquee">
      <div
        className={
          reverse ? "marquee-track marquee-rev marquee-review-row" : "marquee-track marquee-review-row"
        }
      >
        {[0, 1].map((copy) =>
          images.map((image) => (
            <div className="review-card" key={`${copy}-${image.src}`}>
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

export function Reviews() {
  return (
    <section className="section section-alt" id="avaliacoes">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Estrutura do espaço de avaliações</span>
          <h2 className="title">
            Como os <span className="hl">depoimentos</span> vão aparecer
          </h2>
          <p className="lead">
            Exemplos ilustrativos preparados para o lançamento — as avaliações
            reais entram no lugar assim que chegarem.
          </p>
        </div>
        <div className="reviews-marquee">
          <Row images={reviewImages.slice(0, 4)} reverse />
          <Row images={reviewImages.slice(4)} />
        </div>
        <p className="demo-caption">{reviewsNote}</p>
      </div>
    </section>
  );
}
