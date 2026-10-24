(function () {
  var step = document.documentElement.getAttribute("data-funil-step") || "";

  function send(action, extra) {
    var payload = Object.assign({ source: "pp-funil", action: action, step: step }, extra || {});
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }
    } catch (err) {}
  }

  function optionLabel(el) {
    if (!el) return "";
    var text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    return text.slice(0, 180);
  }

  function isQuizOption(el) {
    if (!el || el.tagName !== "BUTTON") return false;
    if (el.id === "btn-submit") return false;
    if (el.classList.contains("pay-tab")) return false;
    if (el.getAttribute("aria-label") === "Fechar") return false;
    if (el.closest("[data-purpose='payment-tabs']")) return false;
    return true;
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      var closeBtn = target.closest(
        'button[aria-label="Fechar"], button[aria-label="Fechar modal"], [data-purpose="modal-close-trigger"]'
      );
      if (closeBtn) {
        event.preventDefault();
        send("close-popup");
        return;
      }

      var buyTotal =
        target.closest('[data-purpose="submit-cta-button"]') ||
        target.closest('a[href="#checkout"]');
      if (step === "popup" && buyTotal) {
        event.preventDefault();
        if (window.parent && window.parent !== window) send("checkout-total");
        else window.location.assign("/checkout?produto=acesso-total");
        return;
      }

      var buyTotalBtn = target.closest("button");
      if (step === "popup" && buyTotalBtn && /QUERO O ACESSO TOTAL/i.test(buyTotalBtn.textContent || "")) {
        event.preventDefault();
        if (window.parent && window.parent !== window) send("checkout-total");
        else window.location.assign("/checkout?produto=acesso-total");
        return;
      }

      var offerCta = target.closest('a[href="#comprar"]');
      if (offerCta) {
        event.preventDefault();
        send("checkout");
        return;
      }

      if (target.closest("#btn-submit")) {
        event.preventDefault();
        var emailEl = document.getElementById("checkout-email");
        var nameEl = document.getElementById("checkout-name");
        var methodEl = document.getElementById("checkout-method");
        var comboEl = document.getElementById("combo-checkbox");
        var bumps = [];
        document.querySelectorAll(".bump-checkbox").forEach(function (box) {
          if (box instanceof HTMLInputElement && box.checked && box.getAttribute("data-bump")) {
            bumps.push(box.getAttribute("data-bump"));
          }
        });
        var produto = new URLSearchParams(location.search).get("produto") || "kit-inicial";
        var ultimaEl = document.getElementById("checkout-ultima-hora");
        send("submit-checkout", {
          email: emailEl && "value" in emailEl ? String(emailEl.value || "") : "",
          name: nameEl && "value" in nameEl ? String(nameEl.value || "") : "",
          product: produto,
          bumps: bumps,
          combo: comboEl instanceof HTMLInputElement && comboEl.checked,
          method: methodEl && "value" in methodEl ? String(methodEl.value || "card") : "card",
          ultimaHora: Boolean(ultimaEl && "value" in ultimaEl && ultimaEl.value === "1"),
        });
        return;
      }

      var sampleCta = target.closest('[data-purpose="sample-cta"]');
      if (step === "popup" && sampleCta) {
        event.preventDefault();
        if (window.parent && window.parent !== window) send("popup-sample");
        else window.location.assign("/qz");
        return;
      }

      var option = target.closest("button");
      if (isQuizOption(option) && /^q[1-6]$/.test(step)) {
        window.setTimeout(function () {
          send("next", {
            label: optionLabel(option),
            answer: option.getAttribute("data-answer") || option.getAttribute("data-value") || "",
          });
        }, 220);
      }
    },
    true
  );

  document.addEventListener("mouseleave", function (event) {
    if (event.clientY <= 0) send("exit-intent");
  });

  if (step === "popup" && new URLSearchParams(location.search).get("obrigatorio") === "1") {
    var fecharObrigatorio = document.querySelector("[data-purpose='modal-close-trigger']");
    if (fecharObrigatorio instanceof HTMLElement) fecharObrigatorio.style.display = "none";
  }

  function contentHeight() {
    if (!document.body) return 0;
    var bottom = 0;
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el.tagName === "SCRIPT") return;
      var rect = el.getBoundingClientRect();
      bottom = Math.max(bottom, rect.bottom + window.scrollY);
    });
    return bottom;
  }

  function reportHeight() {
    var h = step === "oferta"
      ? contentHeight()
      : Math.max(
          document.body ? document.body.scrollHeight : 0,
          document.documentElement ? document.documentElement.scrollHeight : 0
        );
    if (h > 0) send("frame-height", { height: h });
  }

  if (document.readyState === "complete") {
    reportHeight();
  } else {
    window.addEventListener("load", reportHeight);
  }
  window.addEventListener("resize", reportHeight);
  Array.prototype.forEach.call(document.images, function (img) {
    img.addEventListener("load", reportHeight);
  });
})();

