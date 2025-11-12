(() => {
  // src/js/main.js
  document.querySelectorAll(".sports__tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".sports__tab").forEach((tab2) => tab2.classList.remove("sports__tab--active"));
      document.querySelectorAll(".sports__content").forEach((content) => content.classList.remove("sports__content--active"));
      e.target.classList.add("sports__tab--active");
      const sport = e.target.getAttribute("data-sport");
      document.querySelector(`.sports__content[data-container="${sport}"]`).classList.add("sports__content--active");
    });
  });
})();
