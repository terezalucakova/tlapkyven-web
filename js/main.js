(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function closeNav() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openNav() {
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.contains("is-open");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    navMenu.querySelectorAll(".nav-link, .nav-cta").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ---------- Scroll-spy active nav link ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var linkBySection = {};
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").replace("#", "");
      linkBySection[id] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkBySection[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      if (linkBySection[section.id]) observer.observe(section);
    });
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll(".accordion-trigger");
  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));

      triggers.forEach(function (other) {
        if (other !== trigger) {
          other.setAttribute("aria-expanded", "false");
          var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      trigger.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var statusEl = document.getElementById("formStatus");

    var validators = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return /^[+0-9 ()\-]{7,}$/.test(v.trim()); },
      email: function (v) { return v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      city: function (v) { return v.trim().length > 1; },
      consent: function (v, field) { return field.checked; }
    };

    var messages = {
      name: "Zadejte prosím své jméno a příjmení.",
      phone: "Zadejte prosím platné telefonní číslo.",
      email: "Zadejte prosím platnou e-mailovou adresu.",
      city: "Zadejte prosím město nebo obec.",
      consent: "Pro odeslání poptávky je nutný souhlas se zpracováním osobních údajů."
    };

    function setError(fieldName, message) {
      var field = form.elements[fieldName];
      var wrapper = field.closest(".form-field");
      var errorEl = document.getElementById(fieldName + "-error");
      if (wrapper) wrapper.classList.toggle("has-error", !!message);
      if (errorEl) errorEl.textContent = message || "";
    }

    function validateField(fieldName) {
      var field = form.elements[fieldName];
      var validator = validators[fieldName];
      if (!validator) return true;
      var isValid = validator(field.value, field);
      setError(fieldName, isValid ? "" : messages[fieldName]);
      return isValid;
    }

    ["name", "phone", "email", "city", "consent"].forEach(function (fieldName) {
      var field = form.elements[fieldName];
      if (!field) return;
      var evt = field.type === "checkbox" ? "change" : "blur";
      field.addEventListener(evt, function () { validateField(fieldName); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot check
      if (form.elements.website && form.elements.website.value.trim() !== "") {
        return;
      }

      var fieldsToValidate = ["name", "phone", "email", "city", "consent"];
      var isFormValid = fieldsToValidate.reduce(function (valid, fieldName) {
        var fieldValid = validateField(fieldName);
        return valid && fieldValid;
      }, true);

      if (!isFormValid) {
        statusEl.textContent = "Zkontrolujte prosím zvýrazněná pole.";
        statusEl.className = "form-status is-error";
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      var endpoint = form.getAttribute("action");
      var hasRealEndpoint = endpoint && endpoint !== "#" && endpoint.trim() !== "";

      function showSuccess() {
        form.reset();
        form.hidden = true;
        statusEl.className = "form-status is-success";
        statusEl.textContent = "Děkuji za poptávku! Ozvu se vám co nejdříve na uvedený telefon nebo e-mail.";
      }

      if (hasRealEndpoint) {
        fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (response) {
            if (response.ok) {
              showSuccess();
            } else {
              throw new Error("Odeslání se nezdařilo.");
            }
          })
          .catch(function () {
            statusEl.className = "form-status is-error";
            statusEl.textContent = "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo mi napište přímo na e-mail.";
          });
      } else {
        // Formulář zatím není napojen na žádný backend/endpoint.
        // Po připojení (např. Formspree nebo vlastní endpoint) nastavte atribut
        // action="..." na <form id="contactForm"> a odeslání poběží přes fetch výše.
        showSuccess();
      }
    });
  }

  /* ---------- Gallery carousel nav ---------- */
  var galleryTrack = document.getElementById("miniGallery");
  var galleryPrev = document.getElementById("galleryPrev");
  var galleryNext = document.getElementById("galleryNext");

  if (galleryTrack && galleryPrev && galleryNext) {
    function scrollGallery(direction) {
      var figure = galleryTrack.querySelector("figure");
      var step = figure ? figure.getBoundingClientRect().width + 24 : 300;
      galleryTrack.scrollBy({ left: direction * step, behavior: "smooth" });
    }
    galleryPrev.addEventListener("click", function () { scrollGallery(-1); });
    galleryNext.addEventListener("click", function () { scrollGallery(1); });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var galleryTriggers = document.querySelectorAll(".gallery-trigger");
  var lastFocusedTrigger = null;

  function openLightbox(trigger) {
    var fullSrc = trigger.getAttribute("data-full");
    var label = trigger.getAttribute("aria-label") || "";
    lightboxImg.src = fullSrc;
    lightboxImg.alt = label.replace(/^Zvětšit fotografii:\s*/, "");
    lastFocusedTrigger = trigger;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocusedTrigger) lastFocusedTrigger.focus();
  }

  if (lightbox && galleryTriggers.length) {
    galleryTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger);
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }
})();
