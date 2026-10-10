/* Domaine de la Poterie — scripts d'amélioration progressive.
   Le contenu du site ne dépend jamais de ce fichier. */

/* ============ CONFIGURATION CENTRALE ============ */
const SITE_CONFIG = {
  name: "Domaine de la Poterie",
  phone: "+33 6 99 21 89 41",
  email: "", // À CONFIRMER — ex. "contact@domaine-de-la-poterie.fr"
  airbnbUrl: "https://fr.airbnb.ca/rooms/24281059",
  address: "1370 Route de Pont-l’Évêque, 14800 Tourgéville, France"
};

/* Points d’envoi des formulaires (Formspree, Brevo, Netlify, PHP…).
   Laisser vide tant qu’aucun service n’est branché. */
const CONTACT_ENDPOINT = "";
const BOOKING_ENDPOINT = ""; // demande de réservation (peut être identique à CONTACT_ENDPOINT)

(function () {
  "use strict";
  const doc = document.documentElement;
  doc.classList.remove("no-js");
  doc.classList.add("js");
  const EN = (doc.lang || "").toLowerCase().indexOf("en") === 0;
  const t = (fr, en) => EN ? en : fr;
  const LOCALE = EN ? "en-GB" : "fr-FR";
  document.querySelectorAll("[data-set-lang]").forEach(a => a.addEventListener("click", () => { try { localStorage.setItem("ddlp-lang", a.dataset.setLang); } catch (e) {} }));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hydratation de la configuration ---------- */
  document.querySelectorAll("[data-config='phone']").forEach(el => {
    el.textContent = SITE_CONFIG.phone;
    if (el.tagName === "A") el.href = "tel:" + SITE_CONFIG.phone.replace(/\s/g, "");
  });
  if (SITE_CONFIG.email) {
    document.querySelectorAll("[data-config='email']").forEach(el => {
      const a = document.createElement("a");
      a.href = "mailto:" + SITE_CONFIG.email;
      a.textContent = SITE_CONFIG.email;
      el.replaceWith(a);
    });
  }

  /* ---------- Header : transparent sur le hero, ivoire au défilement ---------- */
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const mobileCta = document.querySelector(".mobile-cta");
  const finalCta = document.querySelector(".final-cta, .page-end");
  function onScroll() {
    const y = window.scrollY;
    if (header && document.body.classList.contains("has-hero")) {
      header.classList.toggle("is-scrolled", y > 24);
    }
    if (mobileCta) {
      let hide = hero ? y < hero.offsetHeight * 0.6 : y < 200;
      if (finalCta) {
        const r = finalCta.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) hide = true;
      }
      mobileCta.classList.toggle("is-hidden", hide);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Menu mobile (volet à droite) ---------- */
  const burger = document.querySelector(".burger");
  const drawer = document.getElementById("menu-mobile");
  const overlay = document.querySelector(".drawer-overlay");
  let lastFocus = null;
  function focusables(root) {
    return Array.from(root.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])"));
  }
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    doc.classList.add("drawer-open");
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    setTimeout(() => { const f = focusables(drawer)[0]; if (f) f.focus(); }, 50);
  }
  function closeDrawer() {
    if (!drawer) return;
    doc.classList.remove("drawer-open");
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    if (lastFocus) lastFocus.focus();
  }
  if (burger && drawer) {
    drawer.setAttribute("inert", "");
    burger.addEventListener("click", openDrawer);
    drawer.querySelector(".drawer__close").addEventListener("click", closeDrawer);
    overlay && overlay.addEventListener("click", closeDrawer);
    drawer.addEventListener("keydown", e => {
      if (e.key === "Escape") closeDrawer();
      if (e.key === "Tab") {
        const f = focusables(drawer); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 1120 && doc.classList.contains("drawer-open")) closeDrawer(); });
  }

  /* ---------- Apparition douce ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-visible"));
  }

  /* ---------- Galerie : filtres ---------- */
  const filterBar = document.querySelector(".filters");
  if (filterBar) {
    const items = Array.from(document.querySelectorAll(".gallery li"));
    const sections = Array.from(document.querySelectorAll(".gallery-section"));
    filterBar.addEventListener("click", e => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      const f = btn.dataset.filter;
      filterBar.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
      sections.forEach(s => { s.hidden = !(f === "all" || s.dataset.cat === f); });
      const live = document.getElementById("gallery-live");
      if (live) {
        const n = items.filter(li => !li.closest(".gallery-section").hidden).length;
        live.textContent = n + t(" photos affichées", " photos shown");
      }
    });
  }

  /* ---------- Lightbox ---------- */
  const links = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (links.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", t("Photo agrandie", "Enlarged photo"));
    lb.innerHTML =
      '<img class="lightbox__img" alt="">' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="' + t("Photo précédente", "Previous photo") + '">←</button>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="' + t("Photo suivante", "Next photo") + '">→</button>' +
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="' + t("Fermer", "Close") + '">×</button>' +
      '<p class="lightbox__caption" aria-live="polite"></p>';
    document.body.appendChild(lb);
    const img = lb.querySelector(".lightbox__img");
    const cap = lb.querySelector(".lightbox__caption");
    let list = [], idx = 0, opener = null;
    function visible() { return links.filter(a => !a.closest("[hidden]")); }
    function show(i) {
      idx = (i + list.length) % list.length;
      const a = list[idx];
      const set = a.getAttribute("data-srcset");
      if (set) { img.srcset = set; img.sizes = "100vw"; } else { img.removeAttribute("srcset"); }
      img.src = a.getAttribute("href");
      img.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
      cap.textContent = (idx + 1) + " / " + list.length + " · " + img.alt;
    }
    function open(a) {
      list = visible(); opener = a;
      show(list.indexOf(a));
      lb.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
      lb.querySelector(".lightbox__close").focus();
    }
    function close() {
      lb.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      img.removeAttribute("src");
      if (opener) opener.focus();
    }
    links.forEach(a => a.addEventListener("click", e => { e.preventDefault(); open(a); }));
    lb.querySelector(".lightbox__prev").addEventListener("click", e => { e.stopPropagation(); show(idx - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", e => { e.stopPropagation(); show(idx + 1); });
    lb.querySelector(".lightbox__close").addEventListener("click", close);
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "Tab") {
        const f = Array.from(lb.querySelectorAll("button")); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Formulaires (contact et demande de réservation) ---------- */
  const messages = {
    valueMissing: t("Ce champ est obligatoire.", "This field is required."),
    typeMismatch: t("Merci d’indiquer une adresse e-mail valide.", "Please enter a valid email address."),
    rangeUnderflow: t("Valeur trop basse.", "Value too low."),
    rangeOverflow: t("La maison accueille 15 voyageurs au plus.", "The house sleeps 15 guests at most."),
    badInput: t("Merci de vérifier ce champ.", "Please check this field.")
  };
  function fmtDate(v) { return v ? new Date(v + "T12:00").toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" }) : ""; }
  function setupForm(form, endpoint, okText) {
    form.setAttribute("novalidate", "");
    const status = form.querySelector(".form-status");
    const submit = form.querySelector("[type='submit']");
    const extra = form._extraCheck || (() => "");
    function setError(field, msg) {
      const err = document.getElementById(field.id + "-error");
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    }
    function validate(field) {
      const v = field.validity;
      let msg = "";
      if (!v.valid) {
        if (field.type === "checkbox" && v.valueMissing) msg = t("Merci de cocher cette case pour envoyer votre demande.", "Please tick this box to send your request.");
        else for (const k in messages) if (v[k]) { msg = messages[k]; break; }
        if (!msg) msg = t("Merci de vérifier ce champ.", "Please check this field.");
      }
      if (!msg) msg = extra(field);
      setError(field, msg);
      return !msg;
    }
    form._validate = validate;
    form.querySelectorAll("input, textarea, select").forEach(f => {
      f.addEventListener("blur", () => { if (f.value || f.type === "checkbox") validate(f); });
      f.addEventListener("input", () => { if (f.getAttribute("aria-invalid") === "true") validate(f); });
    });
    function say(type, text) {
      status.hidden = false;
      status.className = "form-status form__full" + (type ? " form-status--" + type : "");
      status.textContent = text;
      status.focus();
    }
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const fields = Array.from(form.querySelectorAll("input, textarea, select")).filter(f => f.name);
      const bad = fields.filter(f => !validate(f));
      if (bad.length) { bad[0].focus(); say("error", EN ? "Some fields need completing: " + bad.length + " error" + (bad.length > 1 ? "s" : "") + "." : "Certains champs sont à compléter : " + bad.length + " erreur" + (bad.length > 1 ? "s" : "") + "."); return; }
      if (!endpoint) {
        say("warning", EN
          ? "The form is not yet connected to the sending service. You can reach us by phone on " + SITE_CONFIG.phone + (SITE_CONFIG.email ? " or by email at " + SITE_CONFIG.email : "") + "."
          : "Le formulaire n’est pas encore connecté au service d’envoi. Vous pouvez nous joindre par téléphone au " + SITE_CONFIG.phone + (SITE_CONFIG.email ? " ou par e-mail à " + SITE_CONFIG.email : "") + ".");
        return;
      }
      submit.disabled = true;
      const label = submit.textContent;
      submit.textContent = t("Envoi en cours…", "Sending…");
      try {
        const data = new FormData(form);
        data.append("formulaire", form.dataset.form || "contact");
        data.append("langue", EN ? "en" : "fr");
        const res = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: data });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        form.dispatchEvent(new Event("reset-done"));
        say("", okText);
      } catch (err) {
        say("error", t("L’envoi n’a pas abouti. Merci de réessayer ou de nous appeler au ", "Sending failed. Please try again or call us on ") + SITE_CONFIG.phone + ".");
      } finally {
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) setupForm(contactForm, CONTACT_ENDPOINT, t("Merci, votre message a bien été envoyé. Nous vous répondons rapidement.", "Thank you, your message has been sent. We will reply shortly."));

  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    const arr = bookingForm.querySelector("#arrivee");
    const dep = bookingForm.querySelector("#depart");
    const guests = bookingForm.querySelector("#voyageurs");
    const summary = document.getElementById("stay-summary");
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    arr.min = today.toISOString().slice(0, 10);
    dep.min = arr.min;
    function nights() { return arr.value && dep.value ? Math.round((new Date(dep.value) - new Date(arr.value)) / 864e5) : 0; }
    function refresh() {
      if (arr.value) {
        const next = new Date(arr.value + "T12:00"); next.setDate(next.getDate() + 1);
        dep.min = next.toISOString().slice(0, 10);
        if (dep.value && dep.value <= arr.value) dep.value = "";
      }
      const n = nights(), g = Number(guests.value) || 0;
      summary.textContent = n > 0
        ? (EN
          ? n + " night" + (n > 1 ? "s" : "") + " · " + fmtDate(arr.value) + " to " + fmtDate(dep.value) + " · " + g + " guest" + (g > 1 ? "s" : "")
          : n + " nuit" + (n > 1 ? "s" : "") + " · du " + fmtDate(arr.value) + " au " + fmtDate(dep.value) + " · " + g + " voyageur" + (g > 1 ? "s" : ""))
        : t("Choisissez vos dates d’arrivée et de départ.", "Choose your arrival and departure dates.");
    }
    bookingForm._extraCheck = field => {
      if (field === dep && arr.value && dep.value && dep.value <= arr.value) return t("La date de départ doit suivre la date d’arrivée.", "The departure date must be after the arrival date.");
      if (field === arr && arr.value && arr.value < arr.min) return t("Merci de choisir une date à venir.", "Please choose a future date.");
      return "";
    };
    [arr, dep, guests].forEach(f => { f.addEventListener("change", refresh); f.addEventListener("input", refresh); });
    bookingForm.querySelectorAll(".stepper__btn").forEach(b => b.addEventListener("click", () => {
      const v = Math.min(15, Math.max(1, (Number(guests.value) || 1) + Number(b.dataset.step)));
      guests.value = v; refresh();
      if (bookingForm._validate) bookingForm._validate(guests);
    }));
    bookingForm.addEventListener("reset-done", () => { guests.value = 10; refresh(); });
    setupForm(bookingForm, BOOKING_ENDPOINT, t("Merci, votre demande de réservation a bien été envoyée. Nous revenons vers vous rapidement pour confirmer la disponibilité et le tarif.", "Thank you, your booking request has been sent. We will get back to you shortly to confirm availability and the rate."));
    refresh();
  }
})();
