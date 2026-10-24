const PROVAS = [
  { src: "/home/feedback/camila.jpg", alt: "Conversa da Camila sobre a rotina mais tranquila e o quadro de rotina na hora de dormir", w: 720, h: 1370 },
  { src: "/home/feedback/juliana.jpg", alt: "Conversa da Juliana sobre o Sistema Monetário e o filho separando as moedas", w: 720, h: 1279 },
  { src: "/home/feedback/mariana.jpg", alt: "Conversa da Mariana sobre atividades simples e o filho mais paciente", w: 720, h: 1370 },
  { src: "/home/feedback/marcelo.jpg", alt: "Conversa do Marcelo sobre emoções e escolhas, com a criança mostrando a figurinha Feliz", w: 720, h: 1279 },
  { src: "/home/feedback/carolina.jpg", alt: "Conversa da Carolina sobre o quadro Minha rotina do dia", w: 720, h: 1279 },
  { src: "/home/feedback/fernanda.jpg", alt: "Conversa da Fernanda sobre a atividade de letras e o nome Pedro", w: 720, h: 1279 },
];

export function FeedbackMarquee() {
  const cards = PROVAS.map((item) => (
    <figure key={item.src} className="hm-proof">
      <img src={item.src} alt={item.alt} width={item.w} height={item.h} />
    </figure>
  ));

  return (
    <div className="hm-marquee" aria-label="Conversas de famílias sobre as atividades">
      <div className="hm-marquee-track hm-marquee-proof">
        <div className="hm-marquee-group">{cards}</div>
        <div className="hm-marquee-group" aria-hidden="true">
          {PROVAS.map((item) => (
            <figure key={`${item.src}-copia`} className="hm-proof">
              <img src={item.src} alt="" width={item.w} height={item.h} />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
