const VITRINES = [
  { src: "/home/vitrines/alfabetizacao.jpg", alt: "Capa de Alfabetização em casa ao lado da atividade da letra A" },
  { src: "/home/vitrines/cores.jpg", alt: "Capa de Cores ao lado da atividade de ligar e pintar" },
  { src: "/home/vitrines/pareamento.jpg", alt: "Capa de Pareamento visual ao lado da atividade de ligar os pares" },
  { src: "/home/vitrines/dinheiro.jpg", alt: "Capa de Sistema Monetário ao lado da atividade das moedas" },
  { src: "/home/vitrines/rotinas.jpg", alt: "Capa de Cartões do dia a dia ao lado da atividade da rotina" },
  { src: "/home/vitrines/formas.jpg", alt: "Capa de Formas geométricas ao lado da atividade de ligar e pintar" },
  { src: "/home/vitrines/formas-caderno.jpg", alt: "Capa de Formas geométricas ao lado da atividade de contar as formas" },
  { src: "/home/vitrines/colorir.jpg", alt: "Capa de Desenhos de colorir ao lado da página do leão e do dinossauro" },
  { src: "/home/vitrines/cores-workbook.jpg", alt: "Capa de Cores ao lado da atividade de identificar e pintar" },
];

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="hm-shot">
      <img src={src} alt={alt} width={1400} height={700} />
    </figure>
  );
}

function Row({ items, reverse }: { items: typeof VITRINES; reverse?: boolean }) {
  return (
    <div className="hm-marquee">
      <div className={reverse ? "hm-marquee-track hm-marquee-rev hm-marquee-vitrine" : "hm-marquee-track hm-marquee-vitrine"}>
        <div className="hm-marquee-group">
          {items.map((item) => (
            <Shot key={item.src} {...item} />
          ))}
        </div>
        <div className="hm-marquee-group" aria-hidden="true">
          {items.map((item) => (
            <Shot key={`${item.src}-copia`} src={item.src} alt="" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivityMarquee() {
  const segunda = [...VITRINES.slice(4), ...VITRINES.slice(0, 4)];
  return (
    <div className="hm-marquees" aria-label="Capas e atividades de exemplo">
      <Row items={VITRINES} />
      <Row items={segunda} reverse />
    </div>
  );
}
