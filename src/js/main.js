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