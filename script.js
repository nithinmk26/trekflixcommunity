document.addEventListener("DOMContentLoaded", () => {
  // --- Navigation & Mobile Drawer ---
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const dropdowns = document.querySelectorAll(".dropdown");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    // Close mobile nav when clicking outside
    document.addEventListener("click", (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("open");
      }
    });
  }

  dropdowns.forEach((drop) => {
    const link = drop.querySelector("a");
    if (link) {
      link.addEventListener("click", (e) => {
        if (window.innerWidth < 768) {
          e.preventDefault();
          drop.classList.toggle("open");
        }
      });
    }
  });

  // --- Dynamic Search & Live Filter Widget ---
  const searchForm = document.getElementById("searchForm");
  const locationSelect = document.getElementById("locationSelect");
  const durationSelect = document.getElementById("durationSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const filterPills = document.querySelectorAll(".filter-pill");
  const featureCards = document.querySelectorAll(".feature-card");

  function filterTrips(category = "all", location = "all", duration = "all", difficulty = "all") {
    let visibleCount = 0;

    featureCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category") || "all";
      const cardLocation = (card.getAttribute("data-location") || "").toLowerCase();
      const cardDuration = (card.getAttribute("data-duration") || "").toLowerCase();
      const cardDifficulty = (card.getAttribute("data-difficulty") || "").toLowerCase();

      let matchCategory = category === "all" || cardCategory === category;
      let matchLocation = location === "all" || cardLocation.includes(location.toLowerCase());
      let matchDuration = duration === "all" || cardDuration === duration;
      let matchDifficulty = difficulty === "all" || cardDifficulty === difficulty;

      if (matchCategory && matchLocation && matchDuration && matchDifficulty) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    const noResults = document.getElementById("noTripsFound");
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  // Filter Pills click handler
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const targetCat = pill.getAttribute("data-filter");
      filterTrips(targetCat, "all", "all", "all");
    });
  });

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const locVal = locationSelect ? locationSelect.value : "all";
      const durVal = durationSelect ? durationSelect.value : "all";
      const diffVal = difficultySelect ? difficultySelect.value : "all";

      filterTrips("all", locVal, durVal, diffVal);

      // Smooth scroll to trip cards section
      const tripsSec = document.getElementById("tripsSection");
      if (tripsSec) {
        tripsSec.scrollIntoView({ behavior: "smooth" });
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
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    if (questionBtn) {
      questionBtn.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");
        faqItems.forEach((other) => other.classList.remove("active"));
        if (!isOpen) {
          item.classList.add("active");
        }
      });
    }
  });

  // --- Photo Gallery & Mosaic Lightbox ---
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const clickablePhotos = document.querySelectorAll(".gallery-item, .mosaic-item");

  clickablePhotos.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const caption = item.querySelector(".gallery-overlay span, .mosaic-overlay span");
      if (img && lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "Trekflix Community Photo";
        if (lightboxCaption) {
          lightboxCaption.textContent = caption ? caption.textContent : "Trekflix Adventure";
        }
        lightboxModal.classList.add("active");
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightboxModal.classList.remove("active");
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove("active");
      }
    });
  }

  // --- Booking & Community Modals ---
  const bookModal = document.getElementById("bookingModal");
  const communityModal = document.getElementById("communityModal");
  const openModalBtns = document.querySelectorAll(".open-booking-modal-btn");
  const openCommunityBtns = document.querySelectorAll(".open-community-modal-btn");
  const closeModalBtns = document.querySelectorAll(".close-booking-modal-btn, .close-community-modal-btn");
  const tripBookingForm = document.getElementById("tripBookingForm");
  const communityJoinForm = document.getElementById("communityJoinForm");
  const newsletterForm = document.getElementById("newsletterForm");
  const toastMsg = document.getElementById("toastMsg");

  function showToast(msg) {
    if (toastMsg) {
      toastMsg.textContent = msg;
      toastMsg.classList.add("show");
      setTimeout(() => {
        toastMsg.classList.remove("show");
      }, 5000);
    }
  }

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (bookModal) bookModal.classList.add("open");
    });
  });

  openCommunityBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (communityModal) communityModal.classList.add("open");
    });
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (bookModal) bookModal.classList.remove("open");
      if (communityModal) communityModal.classList.remove("open");
    });
  });

  [bookModal, communityModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("open");
        }
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (lightboxModal) lightboxModal.classList.remove("active");
      if (bookModal) bookModal.classList.remove("open");
      if (communityModal) communityModal.classList.remove("open");
    }
  });

  if (tripBookingForm) {
    tripBookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("bookName") ? document.getElementById("bookName").value : "Trekkers";
      const count = document.getElementById("bookCount") ? document.getElementById("bookCount").value : "1";
      const phone = document.getElementById("bookPhone") ? document.getElementById("bookPhone").value : "";

      if (bookModal) bookModal.classList.remove("open");
      showToast(`Thanks ${name}! Booking request received for ${count} slot(s). Our trek leader will contact ${phone} shortly.`);
      tripBookingForm.reset();
    });
  }

  if (communityJoinForm) {
    communityJoinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("commName") ? document.getElementById("commName").value : "Traveler";
      if (communityModal) communityModal.classList.remove("open");
      showToast(`Welcome to Trekflix Community, ${name}! You're now subscribed to weekend batch updates & secret sunrise invites.`);
      communityJoinForm.reset();
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thank you for joining Trekflix! Check your inbox for our latest weekend adventure guide.");
      newsletterForm.reset();
    });
  }
});
