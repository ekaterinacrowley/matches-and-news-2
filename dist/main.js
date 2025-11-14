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
  function enableDragScroll(container) {
    let isDown = false;
    let startX;
    let scrollLeft;
    container.addEventListener("mousedown", (e) => {
      isDown = true;
      container.style.cursor = "grabbing";
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });
    container.addEventListener("mouseleave", () => {
      isDown = false;
      container.style.cursor = "grab";
    });
    container.addEventListener("mouseup", () => {
      isDown = false;
      container.style.cursor = "grab";
    });
    container.addEventListener("mousemove", (e) => {
      if (!isDown)
        return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });
    container.style.cursor = "grab";
  }
  document.addEventListener("DOMContentLoaded", () => {
    const topicsContainer = document.getElementById("newsTopics");
    if (topicsContainer) {
      enableDragScroll(topicsContainer);
    }
  });
  document.querySelectorAll(".slide__content").forEach((slide) => {
    const dateElement = slide.querySelector(".slide__match-date");
    const timerElement = slide.querySelector(".slide__timer");
    const eventDate = new Date(dateElement.getAttribute("data-date").split(".").reverse().join("-"));
    function updateTimer() {
      const now = /* @__PURE__ */ new Date();
      const timeRemaining = eventDate - now;
      if (timeRemaining <= 0) {
        timerElement.innerHTML = "Event Started";
        return;
      }
      const days = Math.floor(timeRemaining / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(timeRemaining % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      const minutes = Math.floor(timeRemaining % (1e3 * 60 * 60) / (1e3 * 60));
      const seconds = Math.floor(timeRemaining % (1e3 * 60) / 1e3);
      timerElement.querySelector(".days div").textContent = days < 10 ? "0" + days : days;
      timerElement.querySelector(".hours div").textContent = hours < 10 ? "0" + hours : hours;
      timerElement.querySelector(".minutes div").textContent = minutes < 10 ? "0" + minutes : minutes;
      timerElement.querySelector(".seconds div").textContent = seconds < 10 ? "0" + seconds : seconds;
    }
    setInterval(updateTimer, 1e3);
  });
  var swiper = new Swiper(".swiper-container", {
    loop: true,
    centeredSlides: true,
    slidesPerView: "auto",
    slidesToScroll: 1,
    spaceBetween: 0,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    }
  });
})();
