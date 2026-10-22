export type FunnelEvent =
  | "quiz_view"
  | "quiz_answer"
  | "quiz_feedback_shown"
  | "quiz_capture_view"
  | "quiz_capture_submit"
  | "quiz_capture_skip"
  | "quiz_sample_view"
  | "quiz_result_view"
  | "quiz_offer_click"
  | "quiz_popup_open"
  | "quiz_popup_sample"
  | "quiz_popup_paid"
  | "quiz_popup_close"
  | "quiz_checkout_view"
  | "quiz_checkout_submit"
  | "home_popup_open"
  | "home_popup_close"
  | "home_popup_sample"
  | "home_popup_paid";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: FunnelEvent, props?: Record<string, unknown>) {
  const payload = { event, ...props, ts: Date.now() };
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  console.info("[funil]", event, props || {});
}
