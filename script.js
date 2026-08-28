document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const searchForm = document.getElementById("searchForm");
  const newsletterForm = document.getElementById("newsletterForm");
  const dropdowns = document.querySelectorAll(".dropdown");
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  dropdowns.forEach((drop) => {
    const link = drop.querySelector("a");
    link.addEventListener("click", (e) => {
      if (window.innerWidth < 768) {
        e.preventDefault();
        drop.classList.toggle("open");
      }
    });
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toLocaleDateString("en-CA");

  if (checkin) {
    checkin.setAttribute("min", todayString);
    checkin.addEventListener("change", () => {
      if (!checkin.value) return;
      const [y, m, d] = checkin.value.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const day = date.getDay();
      if (day !== 5 && day !== 6) {
        alert("Please select a Friday or Saturday for the check-in date.");
        checkin.value = "";
      } else {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        if (checkout) checkout.setAttribute("min", nextDay.toLocaleDateString("en-CA"));
      }
    });
  }

  if (checkout) {
    checkout.setAttribute("min", todayString);
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const location = document.getElementById("location").value;
      const checkinVal = checkin ? checkin.value : "";
      const checkoutVal = checkout ? checkout.value : "";

      if (location !== "Karnataka") {
        alert("Sorry, we currently only offer treks in Karnataka.");
        return;
      }

      if (!checkinVal || !checkoutVal) {
        alert("Please select both check-in and check-out dates.");
        return;
      }

      const [cy, cm, cd] = checkinVal.split("-").map(Number);
      const [coy, com, cod] = checkoutVal.split("-").map(Number);
      const checkinDate = new Date(cy, cm - 1, cd);
      const checkoutDate = new Date(coy, com - 1, cod);
      const checkinDay = checkinDate.getDay();

      if (checkinDate < today) {
        alert("Check-in date cannot be in the past.");
        return;
      }

      if (checkinDay !== 5 && checkinDay !== 6) {
        alert("Check-in is only available on Friday or Saturday.");
        return;
      }

      if (checkoutDate <= checkinDate) {
        alert("Check-out date must be after the check-in date.");
        return;
      }

      const nights = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
      let target = "#one-day";
      let type = "1-day";
      if (nights === 2) {
        target = "#two-day";
        type = "2-day";
      } else if (nights >= 3) {
        target = "#three-day";
        type = "3-day";
      }

      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }

      alert(`Showing ${type} trips from ${checkinVal} to ${checkoutVal}.`);
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thanks for subscribing! We will share our best trekking deals with you.");
      newsletterForm.reset();
    });
  }
});
