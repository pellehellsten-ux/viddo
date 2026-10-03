(function () {
  "use strict";

  var INTERVAL = 10000; // ms per rubrik
  var FADE_OUT = 300;   // ms utfasning
  var FADE_IN = 400;    // ms infasning

  
  document.documentElement.classList.add("js");

  var root = document.getElementById("company-split");
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll(".split-tab"));
  var panels = Array.prototype.slice.call(root.querySelectorAll(".split-panel"));
  var bar = document.getElementById("company-loader-bar");

  if (!tabs.length || tabs.length !== panels.length || !bar || !bar.animate) return;

  var current = 0;
  var running = true;
  var cycleTimer = null;
  var fadeTimer = null;
  var barAnim = null;

  function markTabs(i) {
    tabs.forEach(function (tab, n) {
      tab.classList.toggle("is-active", n === i);
      tab.setAttribute("aria-selected", String(n === i));
    });
  }

  function swap(i) {
    clearTimeout(fadeTimer);
    if (i === current) return;

    var from = panels[current];
    var to = panels[i];
    current = i;
    markTabs(i);

    from.getAnimations().forEach(function (a) { a.cancel(); });
    var out = from.animate(
      [{ opacity: getComputedStyle(from).opacity }, { opacity: 0 }],
      { duration: FADE_OUT, easing: "ease", fill: "forwards" }
    );

    fadeTimer = setTimeout(function () {
      out.cancel();
      from.classList.remove("is-active");
      to.classList.add("is-active");
      to.getAnimations().forEach(function (a) { a.cancel(); });
      to.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: FADE_IN, easing: "ease", fill: "forwards" }
      );
    }, FADE_OUT);
  }

  function startBar() {
    if (barAnim) barAnim.cancel();
    barAnim = bar.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: INTERVAL, easing: "linear", fill: "forwards" }
    );
  }

  function stopRotation() {
    running = false;
    clearTimeout(cycleTimer);
    if (barAnim) {
      barAnim.cancel(); // baren återgår till scaleX(0)
      barAnim = null;
    }
  }

  function advance() {
    swap((current + 1) % tabs.length);
    if (running) {
      startBar();
      cycleTimer = setTimeout(advance, INTERVAL);
    }
  }

  tabs.forEach(function (tab, n) {
    tab.addEventListener("click", function () {
      stopRotation();
      swap(n);
    });
  });

  markTabs(0);
  startBar();
  cycleTimer = setTimeout(advance, INTERVAL);
})();

/* ---------- kontaktformulär ---------- */
(function () {
  "use strict";

  var form = document.getElementById("kontakt-form");
  if (!form || !window.fetch) return;

  var submitBtn = form.querySelector(".contact-form__submit");
  var status = form.querySelector(".contact-form__status");
  var defaultBtnText = submitBtn ? submitBtn.textContent : "";

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-ok", "is-error");
    if (kind) status.classList.add(kind);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Skickar...";
    }
    setStatus("", null);

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    }).then(function (response) {
      return response.json().then(function (data) {
        return { ok: response.ok && data.success, data: data };
      });
    }).then(function (result) {
      if (result.ok) {
        form.reset();
        setStatus("Tack! Ditt meddelande är skickat – vi hör av oss snart.", "is-ok");
      } else {
        console.error("web3forms error:", result.data);
        setStatus(result.data && result.data.message
          ? "Något gick fel: " + result.data.message
          : "Något gick fel. Försök igen eller mejla oss direkt.", "is-error");
      }
    }).catch(function () {
      setStatus("Något gick fel. Försök igen eller mejla oss direkt.", "is-error");
    }).finally(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultBtnText;
      }
    });
  });
})();
