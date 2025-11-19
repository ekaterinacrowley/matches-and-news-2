document.querySelectorAll('.sports__tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Убираем активный класс у всех вкладок и контента
        document.querySelectorAll('.sports__tab').forEach(tab => tab.classList.remove('sports__tab--active'));
        document.querySelectorAll('.sports__content').forEach(content => content.classList.remove('sports__content--active'));

        // Добавляем активный класс к выбранной вкладке
        e.target.classList.add('sports__tab--active');

        // Добавляем активный класс к соответствующему контенту
        const sport = e.target.getAttribute('data-sport');
        document.querySelector(`.sports__content[data-container="${sport}"]`).classList.add('sports__content--active');
    });
});

// Функция для drag-скролла
function enableDragScroll(container) {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // multiplier for faster scroll
        container.scrollLeft = scrollLeft - walk;
    });

    // Добавляем курсор по умолчанию
    container.style.cursor = 'grab';
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const topicsContainer = document.getElementById('newsTopics');
    if (topicsContainer) {
        enableDragScroll(topicsContainer);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const teamsContainer = document.getElementById('teamsTopics');
    if (teamsContainer) {
        enableDragScroll(teamsContainer);
    }
});

document.addEventListener('DOMContentLoaded', () => {
   const teamsLogosContainer = document.getElementById('teamsLogos');
        if (teamsLogosContainer) {
            enableDragScroll(teamsLogosContainer);
        }
});

document.querySelectorAll('.slide__content').forEach(slide => {
    const dateElement = slide.querySelector('.slide__match-date');
    const timerElement = slide.querySelector('.slide__timer');
    
    const eventDate = new Date(dateElement.getAttribute('data-date').split('.').reverse().join('-')); // Преобразуем дату в правильный формат
    
    function updateTimer() {
        const now = new Date();
        const timeRemaining = eventDate - now;
        
        if (timeRemaining <= 0) {
            timerElement.innerHTML = 'Event Started'; 
            return;
        }

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        timerElement.querySelector('.days div').textContent = days < 10 ? '0' + days : days;
        timerElement.querySelector('.hours div').textContent = hours < 10 ? '0' + hours : hours;
        timerElement.querySelector('.minutes div').textContent = minutes < 10 ? '0' + minutes : minutes;
        timerElement.querySelector('.seconds div').textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    setInterval(updateTimer, 1000); // Обновляем таймер каждую секунду
});

    const swiper = new Swiper('.swiper-container', {
        loop: true,  
        centeredSlides: true, 
        slidesPerView: 'auto',  
        slidesToScroll: 1, 
        spaceBetween: 0,  
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true,
        },
    });


document.addEventListener('DOMContentLoaded', function() {
    const themeSwitcher = document.querySelector('.header__themes-switcher');
    const darkIcon = document.querySelector('.header__theme-icon--dark');
    const lightIcon = document.querySelector('.header__theme-icon--light');
    const body = document.body;

    // Функция для получения текущей темы из localStorage
    function getSavedTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    // Функция для сохранения темы в localStorage
    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    // Функция для применения темы
    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        
        // Обновляем видимость иконок
        if (theme === 'dark') {
            darkIcon.classList.add('header__theme-icon--active');
            lightIcon.classList.remove('header__theme-icon--active');
        } else {
            lightIcon.classList.add('header__theme-icon--active');
            darkIcon.classList.remove('header__theme-icon--active');
        }
    }

    // Функция для переключения темы
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme') || getSavedTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        saveTheme(newTheme);
    }

    // Инициализация темы при загрузке страницы
    function initTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);
    }

    // Добавляем обработчик клика на переключатель
    themeSwitcher.addEventListener('click', toggleTheme);

    // Инициализируем тему
    initTheme();
});

document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  
  // Обработчик клика на сайдбар (делегирование событий)
  sidebar.addEventListener('click', function(e) {
    const link = e.target.closest('.sidebar__nav-item a[href^="#"]');
    
    if (!link) return;
    
    e.preventDefault();
    
    // Убираем класс у всех элементов
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.classList.remove('sidebar__nav-item--current');
    });
    
    // Добавляем класс текущему элементу
    link.closest('.sidebar__nav-item').classList.add('sidebar__nav-item--current');
    
    // Плавный скролл
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});