"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AVISO_COMPLEMENTAR,
  frasesDoResultado,
  nomeCrianca,
  nomeDoPerfil,
  PERGUNTAS,
  PRECO_KIT,
  pilarDe,
  QUIZ_STEPS,
  reais,
  recomendarPilar,
  REVELA,
  STORAGE_KEY,
  type QuizStep,
  type Respostas,
} from "@/lib/funil/modelo";
import { CONTOS_BRINDE } from "@/lib/funil/contos";
import { HomeExitPopup } from "@/components/home/HomeExitPopup";
import { track } from "./track";

type Step = QuizStep | "gate" | "resultado";

type Salvo = {
  step: Step;
  respostas: Respostas;
  email: string;
  childName: string;
  token: string;
  emailSent: boolean | null;
};

const VAZIO: Salvo = {
  step: "q1",
  respostas: {},
  email: "",
  childName: "",
  token: "",
  emailSent: null,
};

function lerSalvo(): Salvo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return VAZIO;
    const parsed = JSON.parse(raw) as Salvo;
    if (!parsed || typeof parsed !== "object") return VAZIO;
    return { ...VAZIO, ...parsed, respostas: parsed.respostas || {} };
  } catch {
    return VAZIO;
  }
}

export function FunilCliente() {
  const [pronto, setPronto] = useState(false);
  const [step, setStep] = useState<Step>("q1");
  const [respostas, setRespostas] = useState<Respostas>({});
  const [escolha, setEscolha] = useState("");
  const [celebra, setCelebra] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [token, setToken] = useState("");
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const salvo = lerSalvo();
    setStep(salvo.step);
    setRespostas(salvo.respostas);
    setEmail(salvo.email);
    setChildName(salvo.childName);
    setToken(salvo.token);
    setEmailSent(salvo.emailSent);
    setEscolha(QUIZ_STEPS.includes(salvo.step as QuizStep) ? salvo.respostas[salvo.step as QuizStep]?.key || "" : "");
    setPronto(true);
    track("quiz_view", { step: salvo.step });
  }, []);

  useEffect(() => {
    if (!pronto) return;
    const payload: Salvo = { step, respostas, email, childName, token, emailSent };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [pronto, step, respostas, email, childName, token, emailSent]);

  function ir(next: Step) {
    setCelebra(null);
    setErro("");
    setStep(next);
    if (QUIZ_STEPS.includes(next as QuizStep)) {
      setEscolha(respostas[next as QuizStep]?.key || "");
    }
    window.scrollTo(0, 0);
    if (next === "gate") track("quiz_capture_view");
    if (next === "resultado") track("quiz_result_view");
  }

  function voltar() {
    const index = QUIZ_STEPS.indexOf(step as QuizStep);
    if (index > 0) ir(QUIZ_STEPS[index - 1]);
    else if (step === "gate") ir("q6");
    else if (step === "resultado") ir("gate");
  }

  function continuar() {
    if (!QUIZ_STEPS.includes(step as QuizStep)) return;
    const atual = step as QuizStep;
    const opcao = PERGUNTAS[atual].opcoes.find((item) => item.key === escolha);
    if (!opcao) return;
    const nextRespostas: Respostas = { ...respostas, [atual]: { key: opcao.key, label: opcao.label } };
    setRespostas(nextRespostas);
    track("quiz_answer", { step: atual, key: opcao.key });
    const index = QUIZ_STEPS.indexOf(atual);
    const destino: Step = index < QUIZ_STEPS.length - 1 ? QUIZ_STEPS[index + 1] : "gate";
    const frase =
      atual === "q4" && opcao.key === "nao-funcionou"
        ? "Boa. Material sem método não vira rotina — a ficha vem com a ordem do dia."
        : PERGUNTAS[atual].celebra;
    setCelebra(frase);
    window.setTimeout(() => ir(destino), 900);
  }

  async function enviarEmail(event: FormEvent) {
    event.preventDefault();
    const mail = email.trim().toLowerCase();
    if (!mail.includes("@")) {
      setErro("Escreva um e-mail para receber o PDF.");
      return;
    }
    setEnviando(true);
    setErro("");
    const pilar = recomendarPilar(respostas);
    try {
      const response = await fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mail,
          channel: "email",
          pillar: pilar,
          age: respostas.q1?.key || "",
          childName,
          answers: respostas,
          timestamp: new Date().toISOString(),
        }),
      });
      const json = (await response.json()) as { token?: string; emailSent?: boolean };
      if (!response.ok || !json.token) {
        setErro("Não consegui separar o PDF agora. Tente de novo em instantes.");
        return;
      }
      setEmail(mail);
      setToken(json.token);
      setEmailSent(Boolean(json.emailSent));
      track("quiz_capture_submit", { emailSent: Boolean(json.emailSent), pillar: pilar });
      ir("resultado");
    } catch {
      setErro("Sem conexão agora. O kit completo continua ali embaixo.");
    } finally {
      setEnviando(false);
    }
  }

  async function salvarCrianca(valor: string) {
    setChildName(valor);
    if (!email || !token) return;
    const pilar = recomendarPilar(respostas);
    await fetch("/api/quiz-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        updateOnly: true,
        pillar: pilar,
        age: respostas.q1?.key || "",
        childName: valor.trim(),
        answers: respostas,
      }),
    }).catch(() => undefined);
  }

  if (!pronto) {
    return (
      <div className="fn-root">
        <p className="fn-wait">Abrindo o quiz…</p>
      </div>
    );
  }

  const respondidas = QUIZ_STEPS.filter((item) => respostas[item]?.key).length;
  const pilar = recomendarPilar(respostas);
  const pilarInfo = pilarDe(pilar);
  const crianca = nomeCrianca(childName);

  return (
    <div className="fn-root">
      <header className="fn-top">
        <p className="fn-brand">Pequenos Passos</p>
        {QUIZ_STEPS.includes(step as QuizStep) ? (
          <div className="fn-stars" aria-label={`${respondidas} de 6 estrelas`}>
            {QUIZ_STEPS.map((item, index) => (
              <span key={item} className={index < respondidas ? "is-on" : ""} aria-hidden="true">
                ★
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {celebra ? (
        <section className="fn-card fn-celebra" aria-live="polite">
          <p>{celebra}</p>
        </section>
      ) : null}

      {QUIZ_STEPS.includes(step as QuizStep) && !celebra ? (
        <section className="fn-card">
          <p className="fn-kicker">Pergunta {QUIZ_STEPS.indexOf(step as QuizStep) + 1} de 6</p>
          <h1>{PERGUNTAS[step as QuizStep].titulo}</h1>
          <div className="fn-options" role="radiogroup" aria-label={PERGUNTAS[step as QuizStep].titulo}>
            {PERGUNTAS[step as QuizStep].opcoes.map((opcao) => (
              <button
                key={opcao.key}
                type="button"
                role="radio"
                aria-checked={escolha === opcao.key}
                className={escolha === opcao.key ? "is-on" : ""}
                onClick={() => setEscolha(opcao.key)}
              >
                {opcao.label}
              </button>
            ))}
          </div>
          {respondidas > 0 && REVELA[respondidas - 1] ? (
            <p className="fn-reveal">
              <b>{REVELA[respondidas - 1].titulo}.</b> {REVELA[respondidas - 1].texto}
            </p>
          ) : null}
          <div className="fn-actions">
            <button type="button" className="fn-back" onClick={voltar} disabled={step === "q1"}>
              Voltar
            </button>
            <button type="button" className="fn-primary" onClick={continuar} disabled={!escolha}>
              Continuar
            </button>
          </div>
        </section>
      ) : null}

      {step === "gate" && !celebra ? (
        <section className="fn-card">
          <h1>Os 10 contos para dormir já estão separados — para onde enviamos?</h1>
          <p className="fn-lead">É um PDF para ler na hora de dormir. Um conto por noite. Sem login e sem app.</p>
          <form onSubmit={enviarEmail}>
            <label>
              E-mail
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                required
              />
            </label>
            {erro ? <p className="fn-erro">{erro}</p> : null}
            <button className="fn-primary fn-block" type="submit" disabled={enviando}>
              {enviando ? "Separando o PDF…" : "Receber os 10 contos"}
            </button>
          </form>
          <p className="fn-fine">Sem spam. Só o material e novidades da rotina. Cancele quando quiser.</p>
          <a
            className="fn-skip"
            href="/oferta"
            onClick={() => track("quiz_capture_skip")}
          >
            Ver o kit completo sem o brinde
          </a>
          <button type="button" className="fn-back" onClick={voltar}>
            Voltar
          </button>
        </section>
      ) : null}

      {step === "resultado" && token ? (
        <section className="fn-card">
          <p className="fn-medal" aria-hidden="true">🐝</p>
          <p className="fn-kicker">Perfil {nomeDoPerfil(respostas, pilar)} de {crianca}</p>
          <h1>Perfil da Rotina de {crianca} está pronto 🐝</h1>
          <label className="fn-optional">
            Nome da criança (opcional)
            <input
              value={childName}
              onChange={(event) => setChildName(event.target.value)}
              onBlur={(event) => void salvarCrianca(event.target.value)}
              placeholder="Como vocês chamam em casa"
            />
          </label>
          <article className="fn-pilar">
            <p>{pilarInfo.emoji} Pilar recomendado</p>
            <h2>{pilarInfo.nome}</h2>
            <p>{pilarInfo.cadernos}</p>
          </article>
          {frasesDoResultado(respostas).map((linha) => (
            <p key={linha}>{linha}</p>
          ))}
          <p>
            Separei 10 contos para dormir, um para cada noite. Escolha pelo que {crianca} viveu hoje e leiam juntos.
          </p>
          <ol className="fn-list">
            {CONTOS_BRINDE.map((conto) => (
              <li key={conto.n}>
                <b>{conto.emoji} {conto.n}. {conto.titulo}</b>
                <span>{conto.quando}</span>
              </li>
            ))}
          </ol>
          {emailSent === false ? (
            <p className="fn-fine">O PDF está nesta tela. O e-mail para {email} ainda não saiu.</p>
          ) : (
            <p className="fn-fine">O mesmo PDF também foi para {email}.</p>
          )}
          <a className="fn-primary fn-block" href={`/api/funil/brinde?t=${encodeURIComponent(token)}`}>
            Baixar os 10 contos para dormir
          </a>
          <a
            className="fn-primary fn-block"
            href={`/acesso?email=${encodeURIComponent(email)}`}
            onClick={() => track("quiz_popup_paid", { from: "resultado" })}
          >
            Quero o Acesso Total por R$ 19,90
          </a>
          <a className="fn-skip" href="/oferta" onClick={() => track("quiz_offer_click", { from: "resultado" })}>
            Ver o kit completo
          </a>
          <HomeExitPopup email={email} />
          <p className="fn-fine">{AVISO_COMPLEMENTAR}</p>
        </section>
      ) : null}

      {step === "resultado" && !token ? (
        <section className="fn-card">
          <h1>Os 10 contos ficam no e-mail</h1>
          <p>Sem cadastro, o PDF não abre. A compra do kit continua livre.</p>
          <button type="button" className="fn-primary" onClick={() => ir("gate")}>
            Informar o e-mail
          </button>
          <a className="fn-skip" href="/oferta">Ver o kit completo</a>
        </section>
      ) : null}

      <p className="fn-price-note">
        <a href="/oferta">Kit completo {reais(PRECO_KIT)}</a> · a compra não pede o e-mail do brinde
      </p>
    </div>
  );
}
