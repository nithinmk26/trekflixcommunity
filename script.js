document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const trailScene = document.getElementById("trailScene");
  const motionToggle = document.getElementById("motionToggle");
  if (trailScene && motionToggle) {
    let motionPaused = false;
    let sceneVisible = !("IntersectionObserver" in window);
    const updateSceneMotion = () => {
      const prefersStill = reducedMotion.matches;
      trailScene.classList.toggle("motion-running", !motionPaused && !prefersStill && sceneVisible && !document.hidden);
      motionToggle.hidden = prefersStill;
      motionToggle.setAttribute("aria-pressed", String(motionPaused));
      motionToggle.textContent = motionPaused ? "Play motion" : "Pause motion";
    };
    trailScene.classList.add("motion-ready");
    motionToggle.addEventListener("click", () => {
      motionPaused = !motionPaused;
      updateSceneMotion();
    });
    // Suspend decorative loops outside the viewport and in background tabs.
    if ("IntersectionObserver" in window) {
      const sceneObserver = new IntersectionObserver(([entry]) => {
        sceneVisible = entry.isIntersecting;
        updateSceneMotion();
      });
      sceneObserver.observe(trailScene);
    }
    reducedMotion.addEventListener("change", updateSceneMotion);
    document.addEventListener("visibilitychange", updateSceneMotion);
    updateSceneMotion();
  }

  // Only opt into hidden reveal styles when animation can actually run.
  const revealItems = document.querySelectorAll(".section-header, .feature-card, .why-us-card, .story-card, .mosaic-item, .detail-section, .fact-card");
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0 });
    const siblingCounts = new Map();
    revealItems.forEach((item) => {
      const index = siblingCounts.get(item.parentElement) || 0;
      siblingCounts.set(item.parentElement, index + 1);
      item.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 60}ms`);
      item.classList.add("reveal");
      revealObserver.observe(item);
    });
    document.addEventListener("focusin", (event) => {
      let item = event.target.closest(".reveal");
      while (item) {
        item.classList.add("is-visible");
        revealObserver.unobserve(item);
        item = item.parentElement?.closest(".reveal");
      }
    });
    reducedMotion.addEventListener("change", () => {
      revealObserver.disconnect();
      revealItems.forEach((item) => {
        item.classList.add("is-visible");
        item.classList.remove("reveal");
        item.style.removeProperty("--reveal-delay");
      });
    });
  }

  // --- Navigation & Mobile Drawer ---
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const dropdowns = document.querySelectorAll(".dropdown");
  const mobileNav = window.matchMedia("(max-width: 1024px)");

  function setDropdown(drop, open) {
    const link = drop.querySelector("a, button");
    const menu = drop.querySelector("ul");
    drop.classList.toggle("open", open);
    if (link && menu) {
      if (mobileNav.matches) {
        link.setAttribute("aria-expanded", String(open));
        if (link.tagName === "A") link.setAttribute("role", "button");
        menu.style.display = open ? "block" : "none";
      } else {
        link.removeAttribute("aria-expanded");
        if (link.tagName === "A") link.removeAttribute("role");
        menu.style.removeProperty("display");
      }
    }
  }

  function setNavOpen(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle("open", open);
    navLinks.inert = mobileNav.matches && !open;
    navToggle.setAttribute("aria-expanded", String(open));
    if (!open) dropdowns.forEach((drop) => setDropdown(drop, false));
  }

  if (navToggle && navLinks) {
    navToggle.setAttribute("aria-controls", navLinks.id);
    setNavOpen(false);
    navToggle.addEventListener("click", () => {
      if (mobileNav.matches) setNavOpen(!navLinks.classList.contains("open"));
    });

    document.addEventListener("click", (e) => {
      if (mobileNav.matches && !navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        if (navLinks.contains(document.activeElement)) navToggle.focus();
        setNavOpen(false);
      }
    });
    navLinks.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (mobileNav.matches && link && !link.parentElement.classList.contains("dropdown")) {
        if (navLinks.contains(document.activeElement)) navToggle.focus();
        setNavOpen(false);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileNav.matches && navLinks.classList.contains("open")) {
        setNavOpen(false);
        navToggle.focus();
      }
    });
    mobileNav.addEventListener("change", () => {
      if (mobileNav.matches && navLinks.contains(document.activeElement)) navToggle.focus();
      setNavOpen(false);
      if (!mobileNav.matches && document.activeElement === navToggle) navLinks.querySelector("a")?.focus();
    });
  }

  dropdowns.forEach((drop, index) => {
    const link = drop.querySelector("a, button");
    const menu = drop.querySelector("ul");
    if (link && menu) {
      menu.id ||= `nav-submenu-${index + 1}`;
      link.setAttribute("aria-controls", menu.id);
      setDropdown(drop, false);
      link.addEventListener("click", (e) => {
        if (mobileNav.matches) {
          e.preventDefault();
          const open = !drop.classList.contains("open");
          dropdowns.forEach((other) => setDropdown(other, other === drop && open));
        }
      });
      link.addEventListener("keydown", (e) => {
        if (mobileNav.matches && link.tagName === "A" && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          link.click();
        }
      });
    }
  });

  const navbar = document.querySelector(".navbar");
  if (navbar) {
    let scrollPending = false;
    const updateNavbar = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 24);
      scrollPending = false;
    };
    updateNavbar();
    window.addEventListener("scroll", () => {
      if (!scrollPending) {
        scrollPending = true;
        window.requestAnimationFrame(updateNavbar);
      }
    }, { passive: true });
  }

  // --- Dynamic Search & Live Filter Widget ---
  const searchForm = document.getElementById("searchForm");
  const locationSelect = document.getElementById("locationSelect");
  const durationSelect = document.getElementById("durationSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const filterPills = document.querySelectorAll(".filter-pill");
  const featureCards = document.querySelectorAll(".feature-card");
  const tripResults = document.getElementById("tripResults");
  if (tripResults) {
    tripResults.setAttribute("role", "status");
    tripResults.setAttribute("aria-live", "polite");
    tripResults.setAttribute("aria-atomic", "true");
  }

  function filterTrips(category = "all", location = "all", duration = "all", difficulty = "all") {
    let visibleCount = 0;
    filterPills.forEach((pill) => {
      const active = pill.dataset.filter === category;
      pill.classList.toggle("active", active);
      pill.setAttribute("aria-pressed", String(active));
    });

    featureCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category") || "all";
      const cardLocation = (card.getAttribute("data-location") || "").toLowerCase();
      const cardDuration = (card.getAttribute("data-duration") || "").toLowerCase();
      const cardDifficulty = (card.getAttribute("data-difficulty") || "").toLowerCase();

      const matchCategory = category === "trending" ? card.dataset.trending === "true" : category === "all" || cardCategory === category;
      const matchLocation = location === "all" || cardLocation.includes(location.toLowerCase());
      const matchDuration = duration === "all" || cardDuration === duration;
      const matchDifficulty = difficulty === "all" || cardDifficulty === difficulty;

      if (matchCategory && matchLocation && matchDuration && matchDifficulty) {
        card.style.removeProperty("display");
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    const noResults = document.getElementById("noTripsFound");
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
    if (tripResults) {
      tripResults.textContent = `${visibleCount} ${visibleCount === 1 ? "adventure" : "adventures"} found`;
    }
  }

  // Filter Pills click handler
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetCat = pill.dataset.filter || "all";
      if (locationSelect) locationSelect.value = "all";
      if (difficultySelect) difficultySelect.value = "all";
      if (durationSelect) durationSelect.value = ["1day", "2day"].includes(targetCat) ? targetCat : "all";
      filterTrips(targetCat, "all", durationSelect?.value || "all", "all");
    });
  });

  function filterFromSearch() {
    const duration = durationSelect?.value || "all";
    filterTrips(duration, locationSelect?.value || "all", duration, difficultySelect?.value || "all");
  }
  [locationSelect, durationSelect, difficultySelect].forEach((select) => {
    select?.addEventListener("change", filterFromSearch);
  });
  if (featureCards.length) filterFromSearch();

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      filterFromSearch();

      // Smooth scroll to trip cards section
      const tripsSec = document.getElementById("tripsSection");
      if (tripsSec) {
        tripsSec.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth" });
      }
    });
  }

  // --- Itinerary Day Filter Tabs ---
  const dayTabButtons = document.querySelectorAll(".timeline-tab-btn");
  const dayGroups = document.querySelectorAll(".itinerary-day-group");

  dayTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      dayTabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filterDay = btn.getAttribute("data-day");

      dayGroups.forEach((group) => {
        if (filterDay === "all" || group.getAttribute("data-day") === filterDay) {
          group.style.display = "block";
        } else {
          group.style.display = "none";
        }
      });
    });
  });

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll(".faq-item");
  function setFaqOpen(item, open) {
    item.classList.toggle("active", open);
    item.querySelector(".faq-question")?.setAttribute("aria-expanded", String(open));
    const answer = item.querySelector(".faq-answer");
    if (answer) {
      answer.hidden = !open;
      answer.style.maxHeight = open ? "none" : "";
    }
  }
  faqItems.forEach((item, index) => {
    const questionBtn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (questionBtn && answer) {
      questionBtn.id ||= `faq-question-${index + 1}`;
      answer.id ||= `faq-answer-${index + 1}`;
      questionBtn.setAttribute("aria-controls", answer.id);
      answer.setAttribute("aria-labelledby", questionBtn.id);
      setFaqOpen(item, item.classList.contains("active"));
      questionBtn.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");
        faqItems.forEach((other) => setFaqOpen(other, other === item && !isOpen));
      });
    }
  });

  // --- Photo Gallery & Mosaic Lightbox ---
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const clickablePhotos = document.querySelectorAll(".gallery-item, .mosaic-item");

  // Booking and gallery overlays share one focus and dismissal lifecycle.
  const bookModal = document.getElementById("bookingModal");
  const communityModal = document.getElementById("communityModal");
  let activeModal = null;
  let modalTrigger = null;
  const focusableSelector = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function modalFocusables() {
    return [...activeModal.querySelectorAll(focusableSelector)].filter((element) =>
      !element.disabled && element.tabIndex >= 0 && !element.closest("[inert]") && element.getClientRects().length
    );
  }

  function closeModal(restoreFocus = true) {
    if (!activeModal) return;
    const modal = activeModal;
    activeModal = null;
    modal.classList.remove("open", "active");
    document.body.classList.remove("modal-open");
    if (restoreFocus && modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true });
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;
    modalTrigger = null;
  }

  function openModal(modal, trigger) {
    if (!modal) return;
    if (activeModal) closeModal(false);
    modalTrigger = trigger || document.activeElement;
    activeModal = modal;
    modal.inert = false;
    modal.removeAttribute("aria-hidden");
    modal.classList.add(modal === lightboxModal ? "active" : "open");
    document.body.classList.add("modal-open");
    (modalFocusables()[0] || modal).focus({ preventScroll: true });
  }

  [lightboxModal, bookModal, communityModal].forEach((modal) => {
    if (!modal) return;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("tabindex", "-1");
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;
    const heading = modal.querySelector("h2, h3");
    if (heading) {
      heading.id ||= `${modal.id}-title`;
      modal.setAttribute("aria-labelledby", heading.id);
    } else {
      modal.setAttribute("aria-label", "Adventure photo viewer");
    }
    if (modal === lightboxModal && lightboxCaption) modal.setAttribute("aria-describedby", lightboxCaption.id);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!activeModal) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    } else if (e.key === "Tab") {
      const focusables = modalFocusables();
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first) {
        e.preventDefault();
        activeModal.focus();
      } else if (e.shiftKey && (document.activeElement === first || !focusables.includes(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !focusables.includes(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener("focusin", (e) => {
    if (activeModal && !activeModal.contains(e.target)) {
      (modalFocusables()[0] || activeModal).focus({ preventScroll: true });
    }
  });

  document.querySelectorAll(".feature-card img, .gallery-item img, .mosaic-item img").forEach((img) => {
    img.loading = "lazy";
    img.decoding = "async";
  });

  clickablePhotos.forEach((item) => {
    const img = item.querySelector("img");
    const caption = item.querySelector(".gallery-overlay span, .mosaic-overlay span");
    if (img && lightboxModal && lightboxImg) {
      if (item.tagName !== "BUTTON") {
        item.setAttribute("role", "button");
        item.tabIndex = 0;
        item.addEventListener("keydown", (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            item.click();
          }
        });
      } else {
        item.type = "button";
      }
      item.setAttribute("aria-label", `View photo: ${caption?.textContent.trim() || img.alt || "Trekflix adventure"}`);
      item.setAttribute("aria-haspopup", "dialog");
      item.setAttribute("aria-controls", lightboxModal.id);
      item.addEventListener("click", (e) => {
        e.preventDefault();
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || "Trekflix Community Photo";
        if (lightboxCaption) {
          lightboxCaption.textContent = caption ? caption.textContent : "Trekflix Adventure";
        }
        openModal(lightboxModal, item);
      });
    }
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => closeModal());
  }

  // --- Booking & Community Modals ---
  const openModalBtns = document.querySelectorAll(".open-booking-modal-btn");
  const openCommunityBtns = document.querySelectorAll(".open-community-modal-btn");
  const closeModalBtns = document.querySelectorAll(".close-booking-modal-btn, .close-community-modal-btn");
  const tripBookingForm = document.getElementById("tripBookingForm");
  const communityJoinForm = document.getElementById("communityJoinForm");
  const newsletterForm = document.getElementById("newsletterForm");

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(bookModal, btn);
    });
  });

  openCommunityBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(communityModal, btn);
    });
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => closeModal());
  });

  [tripBookingForm, communityJoinForm, newsletterForm].forEach((form) => {
    if (!form || form.tagName !== "FORM") return;
    const submit = form.querySelector('[type="submit"]');
    if (submit) {
      if (submit.tagName === "INPUT") submit.value = "Continue on WhatsApp";
      else submit.textContent = "Continue on WhatsApp";
    }
    const intro = form.closest(".modal-box")?.querySelector("p");
    if (intro) {
      intro.textContent = form === tripBookingForm
        ? "Continue on WhatsApp with your details to ask about availability. Your slot is not reserved until our team confirms it."
        : "Continue on WhatsApp with your details to ask about joining the community. Nothing is submitted until you send the message there.";
      intro.id ||= `${form.id}-intro`;
      form.setAttribute("aria-describedby", intro.id);
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const message = [form === tripBookingForm
        ? `Hi Trekflix! I'd like to enquire about ${document.querySelector("h1")?.textContent.trim() || "a trek"}. Please confirm availability and booking details.`
        : "Hi Trekflix! I'd like to join the community and receive adventure updates."];
      // Existing fields have IDs but no names, so FormData would omit them.
      [...form.elements].forEach((field) => {
        if (!field.matches("input, select, textarea") || field.disabled || ["submit", "button", "reset", "hidden"].includes(field.type)) return;
        if (["checkbox", "radio"].includes(field.type) && !field.checked) return;
        const value = field.tagName === "SELECT"
          ? [...field.selectedOptions].map((option) => option.textContent.trim()).join(", ")
          : field.value.trim();
        if (!value) return;
        const label = field.labels?.[0]?.textContent.replace(/\s*\*\s*$/, "").trim() || field.name || field.id || field.type;
        message.push(`${label}: ${value}`);
      });
      window.open(`https://wa.me/918984462959?text=${encodeURIComponent(message.join("\n"))}`, "_blank", "noopener,noreferrer");
    });
  });
});
