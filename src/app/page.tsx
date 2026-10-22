import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATALOG } from "@/lib/catalog-prices";
import { formatPrice } from "@/lib/catalog-prices";
import { KIT_CATEGORIES } from "@/app/qz/funil-data";
import { HOME_FAQ, HOME_MODULES } from "@/data/home";
import { ActivityMarquee } from "@/components/home/ActivityMarquee";
import { AppShowcase } from "@/components/home/AppShowcase";
import { CheckIcon, ShieldIcon } from "@/components/icons";

const QUIZ_URL = "/qz";

const PAINS = [
  { icon: "📱", title: "Salvou, mas nunca usou", text: "Atividade guardada no celular esperando um momento que não chega." },
  { icon: "⏳", title: "Sem tempo para preparar", text: "Montar material do zero exige uma energia que não sobra no fim do dia." },
  { icon: "🤔", title: "Por onde começar?", text: "Sem organização por habilidade, fica difícil saber o que faz sentido hoje." },
  { icon: "📺", title: "Quer menos telas", text: "Papel, lápis e alguém do lado valem mais que mais um vídeo." },
];

const STEPS = [
  { n: 1, icon: "🧩", title: "Responda o quiz", text: "Seis perguntas rápidas sobre a idade e a rotina do seu filho. Leva 1 minuto." },
  { n: 2, icon: "🎯", title: "Receba o kit ideal", text: "O resultado mostra o módulo certo para começar e libera 10 atividades grátis." },
  { n: 3, icon: "💌", title: "Comece hoje", text: "Comprou, o acesso chega no e-mail. Imprima ou faça pelo app, no seu ritmo." },
];

const kitPrice = CATALOG["kit-inicial"].price;

export default function Home() {
  return (
    <main id="conteudo" className="hm">
      <div className="hm-strip">
        <span>✨ Quiz gratuito de 1 minuto</span>
        <span>🎁 10 atividades grátis no resultado</span>
        <span>🛡️ 7 dias de garantia</span>
      </div>

      <header className="hm-header">
        <div className="hm-wrap hm-header-inner">
          <Link href="/" className="hm-logo" aria-label="Pequenos Passos">
            <Image src="/brand/logo.png" alt="Pequenos Passos" width={1536} height={1024} priority sizes="120px" />
          </Link>
          <nav className="hm-nav" aria-label="Seções">
            <a href="#atividades">Atividades</a>
            <a href="#app">App</a>
            <a href="#oferta">Oferta</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <div className="hm-header-cta">
            <Link href="/entrar" className="hm-link-soft">
              Já comprei
            </Link>
            <Link href={QUIZ_URL} className="hm-btn hm-btn-sm">
              Fazer o quiz
            </Link>
          </div>
        </div>
      </header>

      <section className="hm-hero">
        <div className="hm-wrap hm-hero-grid">
          <div className="hm-hero-copy">
            <span className="hm-badge">
              <span className="hm-dot" aria-hidden="true" /> Para crianças de 3 a 8 anos
            </span>
            <h1>
              15 minutos por dia <span className="hm-hl-green">aprendendo junto</span> com o seu filho,{" "}
              <span className="hm-hl-coral">sem preparar nada do zero</span>
            </h1>
            <p className="hm-lead">
              Atividades prontas para imprimir ou fazer no app, separadas por módulo: atenção, letras, números,
              coordenação, emoções e rotina. Você escolhe, senta junto e comemora.
            </p>
            <div className="hm-cta-row">
              <Link href={QUIZ_URL} className="hm-btn hm-btn-lg">
                Descobrir o kit ideal do meu filho
              </Link>
              <Link href={QUIZ_URL} className="hm-btn hm-btn-ghost">
                Quero 10 atividades grátis
              </Link>
            </div>
            <ul className="hm-trust">
              <li>⏱️ 1 minuto de quiz</li>
              <li>🖨️ Imprima ou use no app</li>
              <li>💌 Acesso por e-mail na hora</li>
            </ul>
          </div>
          <div className="hm-hero-art">
            <div className="hm-hero-frame">
              <Image
                src="/brand/hero-familia.jpg"
                alt="Mãe e filho fazendo juntos uma atividade impressa de formas e letras na mesa de casa"
                width={1280}
                height={720}
                priority
                sizes="(max-width: 960px) 100vw, 620px"
              />
            </div>
            <span className="hm-float hm-float-a">⭐ +1 estrelinha hoje</span>
            <span className="hm-float hm-float-b">⏱️ 5 minutinhos</span>
            <span className="hm-float hm-float-c">🎉 Fizemos juntos!</span>
          </div>
        </div>
      </section>

      <section className="hm-section" id="atividades">
        <div className="hm-wrap hm-head">
          <span className="hm-kicker">Dentro do kit</span>
          <h2>
            Atividades de verdade, <span className="hm-hl-green">separadas por módulo</span>
          </h2>
          <p>Cada cartão é uma ficha do catálogo, com o tempo e a idade sugeridos. Passe o mouse para pausar.</p>
        </div>
        <ActivityMarquee />
      </section>

      <section className="hm-section hm-section-soft">
        <div className="hm-wrap">
          <div className="hm-head">
            <span className="hm-kicker">Você também vive isso?</span>
            <h2>
              A vontade de ensinar existe. <span className="hm-hl-coral">O que falta é tempo e organização.</span>
            </h2>
          </div>
          <div className="hm-pains">
            {PAINS.map((pain) => (
              <article key={pain.title} className="hm-pain">
                <span aria-hidden="true">{pain.icon}</span>
                <h3>{pain.title}</h3>
                <p>{pain.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-section" id="modulos">
        <div className="hm-wrap">
          <div className="hm-head">
            <span className="hm-kicker">6 módulos</span>
            <h2>
              Escolha pela habilidade e <span className="hm-hl-green">pule o “o que fazer hoje?”</span>
            </h2>
          </div>
          <div className="hm-modules">
            {HOME_MODULES.map((module) => (
              <article
                key={module.key}
                className="hm-module"
                style={{ "--tone": module.tone, "--soft": module.soft } as CSSProperties}
              >
                <span className="hm-module-icon" aria-hidden="true">
                  {module.icon}
                </span>
                <span className="hm-module-num">Módulo {module.number}</span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-section hm-section-app" id="app">
        <div className="hm-wrap">
          <div className="hm-head">
            <span className="hm-kicker">Nosso app</span>
            <h2>
              Tudo na palma da mão, <span className="hm-hl-green">com estrelinhas para comemorar</span>
            </h2>
            <p>
              Quem compra entra na área da família pelo celular ou computador. Toque nos itens para ver cada
              tela.
            </p>
          </div>
          <AppShowcase />
        </div>
      </section>

      <section className="hm-section">
        <div className="hm-wrap">
          <div className="hm-head">
            <span className="hm-kicker">Como funciona</span>
            <h2>
              Do quiz à primeira atividade <span className="hm-hl-green">em poucos minutos</span>
            </h2>
          </div>
          <ol className="hm-steps">
            {STEPS.map((step) => (
              <li key={step.n} className="hm-step">
                <span className="hm-step-n">{step.n}</span>
                <span className="hm-step-icon" aria-hidden="true">
                  {step.icon}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hm-section hm-section-soft" id="oferta">
        <div className="hm-wrap">
          <div className="hm-offer">
            <div className="hm-offer-info">
              <span className="hm-kicker">Kit Inicial</span>
              <h2>Pequenos Passos — Kit Inicial</h2>
              <p>Atividades educativas para imprimir e usar em casa, organizadas para facilitar a escolha do dia.</p>
              <ul className="hm-checks">
                {KIT_CATEGORIES.map((item) => (
                  <li key={item}>
                    <span className="hm-tick">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
                <li>
                  <span className="hm-tick">
                    <CheckIcon />
                  </span>
                  Acesso à área da família pelo app ou navegador
                </li>
              </ul>
            </div>
            <div className="hm-price-card">
              <span className="hm-price-tag">Oferta especial</span>
              <p className="hm-price-old">De R$ 97,00</p>
              <p className="hm-price">{formatPrice(kitPrice)}</p>
              <p className="hm-price-note">Pagamento único · PIX, cartão ou boleto</p>
              <Link href={QUIZ_URL} className="hm-btn hm-btn-lg hm-btn-block">
                Fazer o quiz e garantir meu kit
              </Link>
              <p className="hm-price-hint">O quiz mostra por onde começar e libera 10 atividades grátis antes de você decidir.</p>
              <div className="hm-guarantee">
                <ShieldIcon />
                <p>
                  <b>7 dias de garantia.</b> Se não combinar com a rotina de vocês, devolvemos o valor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hm-section" id="duvidas">
        <div className="hm-wrap hm-narrow">
          <div className="hm-head">
            <span className="hm-kicker">Dúvidas</span>
            <h2>Perguntas frequentes</h2>
          </div>
          <div className="hm-faq">
            {HOME_FAQ.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-final">
        <div className="hm-wrap hm-final-inner">
          <h2>O próximo momento juntos pode começar hoje.</h2>
          <p>Responda o quiz, receba 10 atividades grátis e veja qual módulo combina com o seu filho.</p>
          <Link href={QUIZ_URL} className="hm-btn hm-btn-lg hm-btn-light">
            Começar o quiz grátis
          </Link>
        </div>
      </section>

      <footer className="hm-footer">
        <div className="hm-wrap">
          <Image src="/brand/logo.png" alt="Pequenos Passos" width={1536} height={1024} sizes="96px" className="hm-footer-logo" />
          <p>Material educativo complementar. Não substitui a escola nem acompanhamento profissional.</p>
          <p>
            <Link href="/entrar">Área da família</Link> · © {new Date().getFullYear()} Pequenos Passos
          </p>
        </div>
      </footer>
    </main>
  );
}
