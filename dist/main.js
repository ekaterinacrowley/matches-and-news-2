(() => {
  // src/js/main.js
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");
    const btn = document.querySelector(".header__btn");
    if (!header) {
      console.warn("Header element (.header) not found in DOM.");
      return;
    }
    if (!btn) {
      console.warn("No element with .header__btn found in DOM.");
      return;
    }
    btn.addEventListener("click", (e) => {
      const isLink = btn.tagName === "A";
      const href = btn.getAttribute && btn.getAttribute("href");
      if (isLink && (href === "" || href === "#"))
        e.preventDefault();
      header.classList.toggle("header--open");
      const expanded = header.classList.contains("header--open");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    let swiper = null;
    const mq = window.matchMedia("(min-width: 767px)");
    function initSwiperIfNeeded() {
      if (!mq.matches) {
        if (swiper) {
          try {
            swiper.destroy(true, true);
          } catch (err) {
          }
          swiper = null;
        }
        return;
      }
      if (mq.matches && !swiper) {
        if (typeof Swiper === "undefined") {
          console.warn("Swiper \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u0433\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u043E\u0439 \u043E\u0431\u043B\u0430\u0441\u0442\u0438 \u0432\u0438\u0434\u0438\u043C\u043E\u0441\u0442\u0438.");
          return;
        }
        swiper = new Swiper(".swiper", {
          slidesPerView: "auto",
          spaceBetween: 20,
          loop: false,
          autoplay: {
            delay: 5e3,
            disableOnInteraction: false
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
          },
          grabCursor: true
        });
      }
    }
    initSwiperIfNeeded();
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initSwiperIfNeeded, 150);
    });
  });
})();
