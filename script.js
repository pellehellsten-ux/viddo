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
