/* Healthy Bowl web: hlavicka, odhalovanie, interaktivny kruh, ukazka aplikacie, naklon, video.
   Vsetko degraduje: bez JS ostane cely obsah viditelny (trieda .js sa pridava az tu). */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }

  /* hlavicka: tien po scrolle + mobilne menu */
  var hdr = $(".hdr"), nav = $(".nav"), burger = $(".burger");
  function onScroll() { hdr.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (burger) {
    burger.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });
  }


  /* ukazovatel posunu stranky */
  var pb = doc.createElement("div"); pb.className = "pbar"; pb.setAttribute("aria-hidden", "true"); doc.body.appendChild(pb);
  function prog() { var h = root.scrollHeight - window.innerHeight; pb.style.transform = "scaleX(" + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ")"; }
  window.addEventListener("scroll", prog, { passive: true }); prog();

  /* odhalovanie pri scrolle */
  var rv = $$(".rv");
  if (!("IntersectionObserver" in window) || reduce) {
    rv.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (e) { io.observe(e); });
  }

  /* scroll-spy v menu */
  var links = $$(".nav a[href^='#']");
  if ("IntersectionObserver" in window && links.length) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) spy.observe(s); });
  }

  /* interaktivny kruh skladby misky */
  var ring = $(".ring"), gs = $$(".g");
  if (ring && gs.length) {
    var NS = "http://www.w3.org/2000/svg", R = 70, C = 2 * Math.PI * R, GAP = 3;
    var svg = doc.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 200 200"); svg.setAttribute("aria-hidden", "true");
    var total = gs.reduce(function (s, g) { return s + parseFloat(g.dataset.pc); }, 0), acc = 0, circles = [];
    gs.forEach(function (g, i) {
      var len = Math.max(C * parseFloat(g.dataset.pc) / total - GAP, 1.5);
      var c = doc.createElementNS(NS, "circle");
      c.setAttribute("cx", 100); c.setAttribute("cy", 100); c.setAttribute("r", R);
      c.setAttribute("stroke", g.dataset.c);
      c.setAttribute("stroke-dasharray", reduce ? len + " " + (C - len) : "0 " + C);
      c.setAttribute("stroke-dashoffset", -acc);
      c._len = len; acc += C * parseFloat(g.dataset.pc) / total;
      svg.appendChild(c); circles.push(c);
      function on() { ring.classList.add("has-hl"); circles.forEach(function (x, j) { x.classList.toggle("hl", j === i); }); gs.forEach(function (x, j) { x.classList.toggle("hl", j === i); }); }
      function off() { ring.classList.remove("has-hl"); circles.forEach(function (x) { x.classList.remove("hl"); }); gs.forEach(function (x) { x.classList.remove("hl"); }); }
      g.addEventListener("mouseenter", on); g.addEventListener("mouseleave", off); g.addEventListener("focus", on); g.addEventListener("blur", off);
      g.setAttribute("tabindex", "0");
      c.addEventListener("mouseenter", on); c.addEventListener("mouseleave", off);
    });
    ring.insertBefore(svg, ring.firstChild);
    if (!reduce && "IntersectionObserver" in window) {
      var ro = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; ro.disconnect();
        circles.forEach(function (c, i) { setTimeout(function () { c.setAttribute("stroke-dasharray", c._len + " " + (C - c._len)); }, i * 110); });
      }, { threshold: 0.3 });
      ro.observe(ring);
    } else { circles.forEach(function (c) { c.setAttribute("stroke-dasharray", c._len + " " + (C - c._len)); }); }
  }

  /* ukazka aplikacie: zalozky s automatickym prepinanim */
  var tabs = $$(".tab"), shots = $$(".scr img"), cur = 0, timer = null, paused = false;
  function show(i) {
    cur = i;
    tabs.forEach(function (t, j) { t.setAttribute("aria-selected", j === i ? "true" : "false"); });
    shots.forEach(function (s, j) { s.classList.toggle("on", j === i); });
  }
  if (tabs.length) {
    tabs.forEach(function (t, i) {
      t.setAttribute("role", "tab");
      t.addEventListener("click", function () { paused = true; show(i); });
      t.addEventListener("mouseenter", function () { paused = true; show(i); });
    });
    show(0);
    if (!reduce) timer = setInterval(function () { if (!paused && !doc.hidden) show((cur + 1) % tabs.length); }, 4200);
  }

  /* jemny 3D naklon telefonov podla mysi (iba zariadenia s mysou) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    [".stage", ".devwrap"].forEach(function (sel) {
      var el = $(sel); if (!el) return;
      var t = $(".phone, .dev", el);
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        t.style.setProperty("--ry", (-8 + x * 14) + "deg"); t.style.setProperty("--rx", (4 - y * 10) + "deg");
      });
      el.addEventListener("mouseleave", function () { t.style.removeProperty("--ry"); t.style.removeProperty("--rx"); });
    });
    $$(".f").forEach(function (f) {
      f.addEventListener("mousemove", function (e) {
        var r = f.getBoundingClientRect(); f.style.setProperty("--mx", (e.clientX - r.left) + "px"); f.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* videa: spustia sa az po kliknuti, ostatne sa zastavia */
  $$(".vid").forEach(function (vid) {
    var pb = $(".play", vid), v = $("video", vid);
    if (!pb || !v) return;
    pb.addEventListener("click", function () {
      $$(".vid video").forEach(function (o) { if (o !== v) o.pause(); });
      v.setAttribute("controls", ""); v.preload = "auto"; vid.classList.add("playing");
      var p = v.play(); if (p && p.catch) p.catch(function () { /* prehliadac zablokoval, ovladanie ostava */ });
    });
  });
})();
