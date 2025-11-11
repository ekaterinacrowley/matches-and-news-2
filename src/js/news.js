// Загружает и отображает новости по выбранной теме.
// Вызов: клик по теме -> fetch /news?q=ТЕМА

const topics = ['Football', 'Cricket', 'Basketball', 'Volleyball', 'Tennis', 'MMA'];

const topicsContainer = document.getElementById('newsTopics');
const newsContainer = document.getElementById('newsContainer');

function createTopicButtons() {
  topics.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = t;
    btn.style.padding = '6px 10px';
    btn.style.borderRadius = '8px';
    btn.style.border = '1px solid #333';
    btn.style.background = '#111';
    btn.style.color = '#fff';
    btn.addEventListener('click', () => {
      // подсветка выбранной темы
      Array.from(topicsContainer.children).forEach(b => b.style.opacity = '0.6');
      btn.style.opacity = '1';
      loadNews(t);
    });
    topicsContainer.appendChild(btn);
  });
}

function renderArticles(articles) {
  newsContainer.innerHTML = '';
  if (!articles || articles.length === 0) {
    newsContainer.innerHTML = '<p>Новостей нет</p>';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = '1fr';
  wrapper.style.gap = '12px';

  articles.forEach(a => {
    const card = document.createElement('article');
    card.style.display = 'flex';
    card.style.gap = '12px';
    card.style.background = '#121212';
    card.style.padding = '12px';
    card.style.borderRadius = '10px';
    card.style.alignItems = 'flex-start';

    const img = document.createElement('img');
    img.src = a.imageUrl || 'https://via.placeholder.com/120x80?text=no+image';
    img.alt = a.title || '';
    img.style.width = '120px';
    img.style.height = '80px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '6px';

    const info = document.createElement('div');
    info.style.flex = '1';

    const title = document.createElement('a');
    title.href = a.url || '#';
    title.textContent = a.title || 'Без заголовка';
    title.target = '_blank';
    title.rel = 'noopener noreferrer';
    title.style.color = '#fff';
    title.style.fontWeight = '600';
    title.style.display = 'block';
    title.style.marginBottom = '6px';
    title.style.textDecoration = 'none';

    const preview = document.createElement('p');
    preview.textContent = (a.description || '').slice(0, 240);
    preview.style.margin = '0';
    preview.style.color = '#cfcfcf';
    preview.style.fontSize = '14px';

    info.appendChild(title);
    info.appendChild(preview);

    card.appendChild(img);
    card.appendChild(info);
    wrapper.appendChild(card);
  });

  newsContainer.appendChild(wrapper);
}

async function loadNews(q = 'Football') {
  newsContainer.innerHTML = '<p>Загрузка новостей...</p>';
  try {
    const res = await fetch(`/news?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      const text = await res.text();
      console.error('News fetch error:', res.status, text);
      newsContainer.innerHTML = '<p>Ошибка загрузки новостей</p>';
      return;
    }
    const json = await res.json();
    // ожидаем { articles: [...] } от сервера
    renderArticles(json.articles || []);
  } catch (err) {
    console.error('Error loading news:', err);
    newsContainer.innerHTML = '<p>Ошибка при получении новостей</p>';
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  createTopicButtons();
  // имитируем клик по первой теме (Football)
  const firstBtn = topicsContainer.querySelector('button');
  if (firstBtn) {
    firstBtn.click();
  } else {
    loadNews('Football');
  }
});