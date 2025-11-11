document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const btn = document.querySelector('.header__btn');

  if (!header) {
    console.warn('Header element (.header) not found in DOM.');
    return;
  }
  if (!btn) {
    console.warn('No element with .header__btn found in DOM.');
    return;
  }

  btn.addEventListener('click', (e) => {
    // Если это ссылка с href="#" — предотвращаем переход, иначе позволяем
    const isLink = btn.tagName === 'A';
    const href = btn.getAttribute && btn.getAttribute('href');
    if (isLink && (href === '' || href === '#')) e.preventDefault();

    header.classList.toggle('header--open');
    const expanded = header.classList.contains('header--open');
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });

  // Слайдер — инициализируем только при ширине >= 767px
  let swiper = null;
  const mq = window.matchMedia('(min-width: 767px)');

  function initSwiperIfNeeded() {
    if (!mq.matches) {
      if (swiper) {
        try { swiper.destroy(true, true); } catch (err) { /* ignore */ }
        swiper = null;
      }
      return;
    }

    if (mq.matches && !swiper) {
      if (typeof Swiper === 'undefined') {
        console.warn('Swiper не найден в глобальной области видимости.');
        return;
      }
      swiper = new Swiper('.swiper', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        loop: false,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        grabCursor: true,
      });
    }
  }

  // Инициализация на загрузке
  initSwiperIfNeeded();

  // Обработка изменения размера с дебаунсом
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initSwiperIfNeeded, 150);
  });
});
