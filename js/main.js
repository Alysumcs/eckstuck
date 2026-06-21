/* =========================================================
   ECKSTÜCK v2 — interactions (GSAP + ScrollTrigger)
   ========================================================= */
(function () {
  const hasGSAP = typeof window.gsap !== "undefined";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!hasGSAP) document.documentElement.classList.add("no-gsap");

  /* Mobile nav */
  const burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", () => document.body.classList.toggle("menu-open"));
    document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  }

  /* Nav bg + progress */
  const nav = document.querySelector(".nav");
  const prog = document.querySelector(".progress");
  const onScroll = () => {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
    if (prog) { const h = document.documentElement; prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%"; }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Custom cursor */
  const cursor = document.querySelector(".cursor");
  if (cursor && window.matchMedia("(hover:hover)").matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; });
    const loop = () => { cx += (x - cx) * .18; cy += (y - cy) * .18; cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
    document.querySelectorAll("a,button,.dish,.gallery figure").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("big"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("big"));
    });
  }

  /* Rotating dish stage (works without GSAP too) */
  const stage = document.getElementById("stage");
  if (stage) {
    const dishes = stage.querySelectorAll(".stage__dish");
    let i = 0;
    if (dishes.length > 1 && !reduce) {
      setInterval(() => {
        dishes[i].classList.remove("is-active");
        i = (i + 1) % dishes.length;
        dishes[i].classList.add("is-active");
      }, 2800);
    }
    // no mouse interaction on the stage / spinning badge (by request)
  }

  /* Menu intro dish: auto-cycle through all dish images (crossfade) */
  const menuDish = document.getElementById("menuDish");
  if (menuDish && menuDish.dataset.images && !reduce) {
    const imgs = menuDish.dataset.images.split(",").map(s => s.trim()).filter(Boolean);
    // preload
    imgs.forEach(s => { const i = new Image(); i.src = s; });
    let k = 0;
    setInterval(() => {
      k = (k + 1) % imgs.length;
      menuDish.classList.add("swap");
      setTimeout(() => { menuDish.onload = () => menuDish.classList.remove("swap"); menuDish.src = imgs[k]; }, 320);
    }, 2200);
  }

  /* Intro */
  const intro = document.querySelector(".intro");
  const startReveals = () => document.body.classList.add("loaded");

  const runHeroIn = (delay) => {
    if (!hasGSAP) return;
    const lines = document.querySelectorAll(".hero h1 .line > span");
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, { yPercent: 0, duration: 1.05, ease: "power4.out", stagger: .09, delay });
    gsap.from("[data-hero-fade]", { y: 26, opacity: 0, duration: .9, ease: "power3.out", stagger: .1, delay: delay + .35 });
    gsap.from(".stage", { scale: .82, opacity: 0, duration: 1.2, ease: "power3.out", delay: delay + .1 });
  };

  if (intro && hasGSAP && !reduce) {
    const count = intro.querySelector(".intro__count");
    const obj = { v: 0 };
    gsap.timeline()
      .to(obj, { v: 100, duration: 1.3, ease: "power2.inOut", onUpdate: () => { if (count) count.textContent = Math.round(obj.v); } })
      .add(() => { startReveals(); runHeroIn(0.05); })
      .to(intro, { yPercent: -100, duration: .9, ease: "power4.inOut" }, "+=0.1")
      .set(intro, { display: "none" });
  } else {
    if (intro) intro.style.display = "none";
    startReveals();
    runHeroIn(0.2);
  }

  if (!hasGSAP) {
    const io = new IntersectionObserver((ents) => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
    document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Reveals */
  gsap.utils.toArray("[data-reveal]").forEach(el => {
    const d = parseFloat(el.dataset.delay || 0) * .1;
    gsap.fromTo(el, { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: d, scrollTrigger: { trigger: el, start: "top 86%" } });
  });

  /* Floating cutout parallax + slow rotate on scroll */
  gsap.utils.toArray("[data-float]").forEach(img => {
    gsap.to(img, { rotation: 14, yPercent: -10, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 1 } });
  });

  /* Scroll-driven full rotation (legacy single dish, if present) */
  gsap.utils.toArray("[data-rotate]").forEach(img => {
    gsap.to(img, { rotation: 230, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 1.2 } });
  });

  /* Orbit: dishes revolve around a circle on scroll, images stay upright */
  const ring = document.querySelector("[data-orbit]");
  if (ring) {
    const stage = ring.closest(".orbit") || ring;
    const imgs = ring.querySelectorAll(".orbit__upright img");
    const st = { trigger: stage, start: "top bottom", end: "bottom top", scrub: 1 };
    gsap.to(ring, { rotation: 300, ease: "none", scrollTrigger: st });
    gsap.to(imgs, { rotation: -300, ease: "none", scrollTrigger: st });
  }

  /* Owner: zoom toward the Leberkäse on scroll (legacy, if present) */
  gsap.utils.toArray("[data-zoom]").forEach(img => {
    gsap.fromTo(img, { scale: 1 }, { scale: 1.55, ease: "none", scrollTrigger: { trigger: img.closest("section") || img, start: "top 65%", end: "bottom top", scrub: 1 } });
  });

  /* Full-bleed pinned food zoom transition (Über üs) */
  const fz = document.querySelector(".foodzoom");
  if (fz) {
    const img = fz.querySelector(".foodzoom__img");
    const cap = fz.querySelector(".foodzoom__cap");
    const kick = fz.querySelector(".foodzoom__kicker");
    gsap.set([img], { scale: .55 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: fz, start: "top top", end: "+=160%", scrub: true, pin: true } });
    tl.to(img, { scale: 7, ease: "power1.in" })
      .to([cap, kick], { opacity: 0, ease: "none" }, 0)
      .fromTo(cap, { y: 30 }, { y: -20, ease: "none" }, 0);
  }

  /* Dish cards subtle float idle */
  gsap.utils.toArray(".dish__img").forEach((img, k) => {
    gsap.to(img, { y: -10, duration: 2.4 + k * .3, ease: "sine.inOut", repeat: -1, yoyo: true });
  });

  /* Marquee */
  const track = document.querySelector(".marquee__track");
  if (track) {
    track.innerHTML += track.innerHTML;
    const loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 24, ease: "none" });
    ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top", onUpdate: s => loop.timeScale(s.direction) });
  }

  /* Counters */
  gsap.utils.toArray(".stat .num").forEach(el => {
    const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "", o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(o, { v: target, duration: 1.7, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("de-CH") + suffix; } }) });
  });

  /* CTA floating dishes parallax */
  gsap.utils.toArray(".cta-dish").forEach((d, k) => {
    gsap.to(d, { yPercent: k ? -22 : 22, rotation: k ? 24 : -22, ease: "none", scrollTrigger: { trigger: ".cta-band", start: "top bottom", end: "bottom top", scrub: 1 } });
  });

  ScrollTrigger.refresh();
})();
