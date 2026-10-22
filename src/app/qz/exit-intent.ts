"use client";

import { useEffect, useRef } from "react";
import { EXIT_POPUP_DAYS, EXIT_POPUP_KEY } from "./funil-data";

export function hasSeenExitPopup() {
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

export function markExitPopup() {
  try {
    localStorage.setItem(EXIT_POPUP_KEY, String(Date.now()));
    document.cookie = `${EXIT_POPUP_KEY}=1; max-age=${EXIT_POPUP_DAYS * 86400}; path=/; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

/** Abre uma vez a cada EXIT_POPUP_DAYS; `?popup=1` força para teste. */
export function useExitIntent(enabled: boolean, onOpen: (reason: string) => void, scope: string) {
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  const lockRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const forced = new URLSearchParams(window.location.search).get("popup") === "1";
    if (!forced && (hasSeenExitPopup() || lockRef.current)) return;

    function open(reason: string) {
      if (lockRef.current) return;
      if (!forced && hasSeenExitPopup()) return;
      lockRef.current = true;
      markExitPopup();
      openRef.current(reason);
    }

    function onMouseLeave(event: MouseEvent) {
      if (event.clientY <= 0) open("mouse");
    }
    function onFrameExit() {
      open("mouse");
    }
    function onPopState() {
      open("voltar");
    }

    let hiddenAt = 0;
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt && Date.now() - hiddenAt > 1500) open("aba");
    }

    let lastY = window.scrollY;
    let lastT = performance.now();
    let deepest = lastY;
    function onScroll() {
      const now = performance.now();
      const y = window.scrollY;
      deepest = Math.max(deepest, y);
      const speed = (lastY - y) / Math.max(1, now - lastT);
      if (window.matchMedia("(pointer: coarse)").matches && deepest > 500 && y < deepest - 300 && speed > 1.6) {
        open("rolagem");
      }
      lastY = y;
      lastT = now;
    }

    window.history.pushState({ pp: scope }, "");
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("pp-exit-intent", onFrameExit);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = forced ? window.setTimeout(() => open("teste"), 1200) : 0;

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("pp-exit-intent", onFrameExit);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled, scope]);
}
