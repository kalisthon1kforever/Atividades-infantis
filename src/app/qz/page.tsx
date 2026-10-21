"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Answers,
  diagnosisParagraphs,
  EXIT_POPUP_DAYS,
  EXIT_POPUP_KEY,
  feedbackFor,
  FunnelStep,
  inferAnswerKey,
  QuizStep,
  SOCIAL_PROOF,
  startCategory,
} from "./funil-data";
import { AcessoLiberado } from "./AcessoLiberado";
import { AmostraGratis } from "./AmostraGratis";
import { track } from "./track";

const QUIZ_ORDER = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

const SCREEN_SRC: Record<Exclude<FunnelStep, "captura" | "amostra" | "acesso"> | "popup", string> = {
  q1: "/funil/q1.html",
  q2: "/funil/q2.html",
  q3: "/funil/q3.html",
  q4: "/funil/q4.html",
  q5: "/funil/q5.html",
  q6: "/funil/q6.html",
  oferta: "/funil/oferta.html",
  checkout: "/funil/checkout.html",
  popup: "/funil/popup.html",
};

type FunnelMessage = {
  source?: string;
  action?: string;
  step?: string;
  label?: string;
  answer?: string;
  email?: string;
  name?: string;
  product?: string;
  bumps?: string[];
  combo?: boolean;
  method?: string;
  height?: number;
};

type FeedbackState = { body: string; extra?: string };

function hasSeenExitPopup() {
  try {
    const raw = localStorage.getItem(EXIT_POPUP_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < EXIT_POPUP_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markExitPopup() {
  try {
    const now = String(Date.now());
    localStorage.setItem(EXIT_POPUP_KEY, now);
    document.cookie = `${EXIT_POPUP_KEY}=1; max-age=${EXIT_POPUP_DAYS * 86400}; path=/; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export default function QuizFunnelPage() {
  const [step, setStep] = useState<FunnelStep>("q1");
  const [popupOpen, setPopupOpen] = useState(false);
  const [frameHeight, setFrameHeight] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [access, setAccess] = useState<{
    email: string;
    password: string;
    emailSent: boolean;
  } | null>(null);
  const answersRef = useRef<Answers>({});
  const leadRef = useRef({ name: "", email: "" });
  const productRef = useRef<"kit-inicial" | "acesso-total">("kit-inicial");
  const popupLockRef = useRef(false);
  const feedbackTimer = useRef<number | null>(null);

  const diagnosis = useMemo(() => diagnosisParagraphs(answers), [answers]);
  const category = useMemo(() => startCategory(answers.q4?.key), [answers.q4]);

  const goTo = useCallback((next: FunnelStep) => {
    setStep(next);
    setFrameHeight(null);
    window.scrollTo(0, 0);
  }, []);

  const persistAnswers = useCallback((next: Answers) => {
    answersRef.current = next;
    setAnswers(next);
  }, []);

  useEffect(() => {
    track("quiz_view", { step });
    if (step === "captura") track("quiz_capture_view");
    if (step === "amostra") track("quiz_sample_view");
    if (step === "oferta") track("quiz_result_view");
    if (step === "checkout") track("quiz_checkout_view");
  }, [step]);

  useEffect(() => {
    function onMessage(event: MessageEvent<FunnelMessage>) {
      const data = event.data;
      if (!data || data.source !== "pp-funil") return;

      if (data.action === "next" && data.step && /^q[1-6]$/.test(data.step)) {
        const quizStep = data.step as QuizStep;
        const key = inferAnswerKey(quizStep, data.label || "", data.answer);
        const nextAnswers: Answers = {
          ...answersRef.current,
          [quizStep]: { key, label: data.label || key },
        };
        persistAnswers(nextAnswers);
        track("quiz_answer", { step: quizStep, key, label: data.label });

        const copy = feedbackFor(quizStep, key);
        setFeedback(copy);
        track("quiz_feedback_shown", { step: quizStep, key });

        if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
        const words = `${copy.body} ${copy.extra || ""}`.trim().split(/\s+/).length;
        const wait = Math.min(7000, Math.max(4200, 2800 + words * 110));
        feedbackTimer.current = window.setTimeout(() => {
          setFeedback(null);
          const index = QUIZ_ORDER.indexOf(quizStep);
          if (index >= 0 && index < QUIZ_ORDER.length - 1) {
            goTo(QUIZ_ORDER[index + 1]);
            return;
          }
          goTo("captura");
        }, wait);
        return;
      }

      if (data.action === "checkout") {
        setPopupOpen(false);
        productRef.current = "kit-inicial";
        track("quiz_offer_click", { from: step });
        goTo("checkout");
        return;
      }

      if (data.action === "checkout-total") {
        setPopupOpen(false);
        productRef.current = "acesso-total";
        track("quiz_popup_paid");
        goTo("checkout");
        return;
      }

      if (data.action === "popup-sample") {
        setPopupOpen(false);
        track("quiz_popup_sample");
        goTo("captura");
        return;
      }

      if (data.action === "close-popup") {
        setPopupOpen(false);
        track("quiz_popup_close");
        return;
      }

      if (data.action === "frame-height" && typeof data.height === "number" && data.height > 0) {
        setFrameHeight(Math.ceil(data.height));
        return;
      }

      if (data.action === "submit-checkout") {
        track("quiz_checkout_submit");
        const mail = (data.email || leadRef.current.email).trim();
        const fullName = (data.name || leadRef.current.name).trim();
        if (!mail || !fullName) {
          window.alert("Preencha nome e e-mail para seguir ao pagamento.");
          return;
        }
        const product = data.product === "acesso-total" ? "acesso-total" : productRef.current;
        void (async () => {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: mail,
              name: fullName,
              product,
              bumps: data.bumps || [],
              combo: Boolean(data.combo),
              method: data.method || "card",
            }),
          });
          const json = (await res.json()) as { initPoint?: string; message?: string };
          if (!res.ok || !json.initPoint) {
            window.alert(json.message || "Não foi possível abrir o pagamento.");
            return;
          }
          window.location.assign(json.initPoint);
        })();
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [goTo, persistAnswers, step]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    };
  }, []);

  useEffect(() => {
    if (step !== "oferta" && step !== "checkout") return;
    if (hasSeenExitPopup() || popupLockRef.current) return;

    function maybeOpenPopup() {
      if (popupLockRef.current || hasSeenExitPopup()) return;
      popupLockRef.current = true;
      markExitPopup();
      setPopupOpen(true);
      track("quiz_popup_open", { step });
    }

    function onMouseLeave(event: MouseEvent) {
      if (event.clientY <= 0) maybeOpenPopup();
    }

    function onPopState() {
      maybeOpenPopup();
    }

    window.history.pushState({ funil: step }, "");
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("popstate", onPopState);
    };
  }, [step]);

  async function submitLead(event: FormEvent) {
    event.preventDefault();
    const mail = email.trim();
    if (!name.trim() || !mail) return;
    setSending(true);
    leadRef.current = { name: name.trim(), email: mail };
    const sampleUrl = `${window.location.origin}/qz/amostra?nome=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(mail)}`;
    try {
      const response = await fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          channel: "email",
          email: mail,
          sampleUrl,
          answers: answersRef.current,
          timestamp: new Date().toISOString(),
        }),
      });
      const json = (await response.json()) as { emailSent?: boolean };
      setEmailSent(Boolean(json.emailSent));
      track("quiz_capture_submit", { channel: "email", emailSent: Boolean(json.emailSent) });
    } catch {
      track("quiz_capture_submit", { channel: "email", error: true });
    } finally {
      setSending(false);
      goTo("amostra");
    }
  }

  const showFrame = step !== "captura" && step !== "amostra" && step !== "acesso";

  return (
    <div className="qz-root">
      {step === "oferta" ? (
        <div className="qz-result-overlay" aria-live="polite">
          <div className="qz-result-card">
            <p className="qz-result-kicker">Com base nas suas respostas</p>
            {diagnosis.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="qz-result-cat">
              Comece por: <strong>{category.title}</strong>
            </p>
            <p className="qz-result-proof">{SOCIAL_PROOF}</p>
          </div>
        </div>
      ) : null}

      {showFrame ? (
        <iframe
          key={step}
          className="qz-frame"
          src={
          step === "checkout"
            ? `/funil/checkout.html?produto=${productRef.current}`
            : SCREEN_SRC[step]
        }
          title="Funil quiz Pequenos Passos"
          style={
            frameHeight
              ? { height: frameHeight, minHeight: step === "oferta" ? 0 : undefined }
              : undefined
          }
        />
      ) : null}

      {step === "oferta" ? (
        <p className="qz-result-proof-bar">{SOCIAL_PROOF}</p>
      ) : null}

      {feedback ? (
        <div className="qz-feedback" role="status">
          <div className="qz-feedback-card">
            <p>{feedback.body}</p>
            {feedback.extra ? <p className="qz-feedback-extra">{feedback.extra}</p> : null}
          </div>
        </div>
      ) : null}

      {step === "amostra" ? (
        <AmostraGratis
          name={name}
          email={email}
          emailSent={emailSent}
          showContinue
          onContinue={() => goTo("oferta")}
        />
      ) : null}

      {step === "acesso" && access ? (
        <AcessoLiberado
          name={name}
          email={access.email}
          password={access.password}
          emailSent={access.emailSent}
        />
      ) : null}

      {step === "captura" ? (
        <div className="qz-capture">
          <div className="qz-capture-card">
            <h1>Seu resultado está pronto! 🎉</h1>
            <p className="qz-capture-sub">
              Para qual e-mail enviamos a sua demonstração gratuita + 10 atividades de amostra para testar hoje?
            </p>
            <form onSubmit={submitLead}>
              <label>
                Nome
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você gostaria de ser chamado(a)"
                  required
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                />
              </label>
              <button className="qz-capture-cta" type="submit" disabled={sending}>
                {sending ? "Enviando..." : "Receber demonstração no e-mail"}
              </button>
            </form>
            <button
              type="button"
              className="qz-capture-skip"
              onClick={() => {
                track("quiz_capture_skip");
                goTo("oferta");
              }}
            >
              Prefiro pular e ver só o resultado
            </button>
          </div>
        </div>
      ) : null}

      {popupOpen ? (
        <div className="qz-popup-layer" role="dialog" aria-modal="true">
          <iframe
            className="qz-popup-frame"
            src={SCREEN_SRC.popup}
            title="Oferta de saída Pequenos Passos"
          />
        </div>
      ) : null}
    </div>
  );
}
