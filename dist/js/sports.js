const footballContainer = document.getElementById('footballLeagues');
const cricketContainer = document.getElementById('cricketLeagues');
const basketballContainer = document.getElementById('basketballLeagues');
const volleyballContainer = document.getElementById('volleyballLeagues');

// Храним текущие даты для каждого вида спорта
const currentDates = {
  football: new Date(),
  cricket: new Date()
};

// Выносим formatDate наружу, чтобы она была доступна везде
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function loadMatches() {
  await Promise.all([
    loadFootballMatches(formatDate(currentDates.football)),
    loadCricketMatches(formatDate(currentDates.cricket)),
    loadBasketballMatches(formatDate(currentDates.football)),
    loadVolleyballMatches(formatDate(currentDates.football))
  ]);
}

// --- Футбол ---
const allowedFootballKeywords = [
  'Premier League', 'Saudi Pro League', 'English Premier League', 'sudan', 'UEFA Champions League', 'oman',
];

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация всех видов спорта
  loadMatches();

  // Обработчики для футбола
  const footballPicker = document.getElementById('footballDatePicker');
  if (footballPicker) {
    const prevBtn = footballPicker.querySelector('.prevDay');
    const todayBtn = footballPicker.querySelector('.todayButton');
    const nextBtn = footballPicker.querySelector('.nextDay');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        footballPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        prevBtn.classList.add('active');
        
        currentDates.football.setDate(currentDates.football.getDate() - 1);
        loadFootballMatches(formatDate(currentDates.football));
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        footballPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        todayBtn.classList.add('active');
        
        currentDates.football = new Date();
        loadFootballMatches(formatDate(currentDates.football));
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        footballPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        nextBtn.classList.add('active');
        
        currentDates.football.setDate(currentDates.football.getDate() + 1);
        loadFootballMatches(formatDate(currentDates.football));
      });
    }
  }

  // Обработчики для крикета
  const cricketPicker = document.getElementById('cricketDatePicker');
  if (cricketPicker) {
    const prevPrevBtn = cricketPicker.querySelector('.prevPrevDay');
    const prevBtn = cricketPicker.querySelector('.prevDay');
    const todayBtn = cricketPicker.querySelector('.todayButton');

    if (prevPrevBtn) {
      prevPrevBtn.addEventListener('click', () => {
        cricketPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        prevPrevBtn.classList.add('active');
        
        currentDates.cricket.setDate(currentDates.cricket.getDate() - 2);
        loadCricketMatches(formatDate(currentDates.cricket));
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        cricketPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        prevBtn.classList.add('active');
        
        currentDates.cricket.setDate(currentDates.cricket.getDate() - 1);
        loadCricketMatches(formatDate(currentDates.cricket));
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        cricketPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        todayBtn.classList.add('active');
        
        currentDates.cricket = new Date();
        loadCricketMatches(formatDate(currentDates.cricket));
      });
    }
  }
});


// --- Футбол --- 

async function loadFootballMatches(dateStr) {
  footballContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const res = await fetch(`/matches/football?date=${dateStr}`);
    const data = await res.json();
    if (!data.response || data.response.length === 0) {
      footballContainer.innerHTML = `<p>Нет матчей на ${dateStr}</p>`;
      return;
    }
    renderFootball(data.response);
  } catch (e) {
    footballContainer.innerHTML = "<p>Ошибка загрузки</p>";
    console.error(e);
  }
}

function isAllowedFootball(event) {
  const leagueName = (event.league?.name || '');
  const leagueCountry = (event.league?.country || '');
  const leagueSlug = (event.league?.slug || '');
  const home = (event.teams?.home?.name || '');
  const away = (event.teams?.away?.name || '');

  const hay = [leagueName, leagueCountry, leagueSlug, home, away].join(' ').toLowerCase();
  const ok = allowedFootballKeywords.some(k => hay.includes(k));
  console.log(`[DEBUG] filterFootball -> league="${leagueName}" teams="${home} vs ${away}" matched=${ok}`);
  return ok;
}

function renderFootball(matches) {
  footballContainer.innerHTML = "";

  let filtered = matches.filter(isAllowedFootball);

  if (!filtered.length) {
    console.log('[DEBUG] No matches found, adding top 3 leagues');
    const firstThreeMatches = matches.slice(0, 3);
    filtered = [...firstThreeMatches];
  }

  const leaguesMap = {};
  filtered.forEach(event => {
    const leagueId = event.league.id;
    if (!leaguesMap[leagueId]) leaguesMap[leagueId] = { league: event.league, events: [] };
    leaguesMap[leagueId].events.push(event);
  });

  const filteredLeagues = Object.keys(leaguesMap).length;

  if (filteredLeagues < 3) {
    const additionalMatches = matches.filter(event => {
      const leagueId = event.league.id;
      return !leaguesMap[leagueId];
    }).slice(0, 3 - filteredLeagues);
    filtered = [...filtered, ...additionalMatches];
  }

  filtered.forEach(event => {
    const leagueId = event.league.id;
    if (!leaguesMap[leagueId]) leaguesMap[leagueId] = { league: event.league, events: [] };
    leaguesMap[leagueId].events.push(event);
  });

  for (const leagueId in leaguesMap) {
    const { league, events } = leaguesMap[leagueId];
    const leagueEl = document.createElement('div');
    leagueEl.className = 'league';
    leagueEl.innerHTML = `<div class="league__header"><div class="league__logo"><img src="${league.logo}" alt="${league.name}"></div><h2>${league.name}</h2></div>`;
    events.forEach(event => {
      const status = event.fixture.status;
      const isLive = ['1H','2H','ET','P','LIVE','HT'].includes(status.short);
      let displayTime;
      if (isLive && status.elapsed !== null) displayTime = `<span class="live">LIVE ${status.elapsed}'</span><strong>${event.goals.home ?? 0} - ${event.goals.away ?? 0}</strong><span class="watch">Watch</span>`; 
      else if (['FT','AET','P'].includes(status.short)) displayTime = `<strong>${event.goals.home ?? 0} - ${event.goals.away ?? 0}</strong><span class="hightlights">Hightlights</span>`;
      else {
          const matchDate = new Date(event.fixture.date);
         displayTime = `<strong>${matchDate.toLocaleString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit'
        }).replace(',', '')}</strong><span class="watch">Watch</span>`;
      }

      const matchEl = document.createElement('div');
      matchEl.className = 'match';
      if (isLive) matchEl.classList.add('live');
      matchEl.innerHTML = `<div class="team"><div class="team__logo"><img src="${event.teams.home.logo}" alt="${event.teams.home.name}"></div>${event.teams.home.name}</div><div class="time">${displayTime}</div><div class="team team--2">${event.teams.away.name}<div class="team__logo"><img src="${event.teams.away.logo}" alt="${event.teams.away.name}"></div></div>`;
      leagueEl.appendChild(matchEl);
    });
    footballContainer.appendChild(leagueEl);
  }
}

// --- Крикет ---
async function loadCricketMatches(dateStr) {
  console.log("=== loadCricketMatches START ===");
  console.log("Received date parameter:", dateStr);
  console.log("cricketContainer:", cricketContainer);
  
  cricketContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    console.log("Making fetch request to:", `/matches/cricket?date=${dateStr}`);
    const res = await fetch(`/matches/cricket?date=${dateStr}`);
    const data = await res.json();
    console.log("Cricket API response:", data);
    
    if (!data.data || data.data.length === 0) {
      console.log("No matches found or empty array");
      cricketContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }
    
    console.log(`Found ${data.data.length} matches, proceeding to render`);
    renderCricket(data.data, dateStr);
  } catch (e) {
    console.error("Error loading matches:", e);
    cricketContainer.innerHTML = "<p>Ошибка загрузки</p>";
  }
  console.log("=== loadCricketMatches END ===");
}
function sortAndGroupMatches(matches) {
  console.log("sortAndGroupMatches called with:", matches);
  
  // Преобразуем дату в формате ISO в строку вида "YYYY-MM-DD"
  matches.forEach(match => {
    const dateString = match.date || match.dateTimeGMT;
    if (!dateString) {
      console.warn("Missing date for match:", match);
      match.dateOnly = "unknown";
      return;
    }
    const matchDate = new Date(dateString);
    if (isNaN(matchDate.getTime())) {
      console.warn("Invalid date:", dateString, "for match:", match);
      match.dateOnly = "invalid";
      return;
    }
    // Преобразуем в строку "YYYY-MM-DD"
    match.dateOnly = matchDate.toISOString().split('T')[0];
    console.log(`Match date: ${dateString} -> ${match.dateOnly}`);
  });

  const validMatches = matches.filter(match => 
    match.dateOnly && match.dateOnly !== "unknown" && match.dateOnly !== "invalid"
  );
  
  console.log("Valid matches:", validMatches.length, "out of", matches.length);

  validMatches.sort((a, b) => a.dateOnly.localeCompare(b.dateOnly));

  const groupedMatches = validMatches.reduce((acc, match) => {
    if (!acc[match.dateOnly]) {
      acc[match.dateOnly] = [];
    }
    acc[match.dateOnly].push(match);
    return acc;
  }, {});

  console.log("Grouped matches result:", groupedMatches);
  return groupedMatches;
}

function renderCricket(matches, selectedDate) {
  console.log("renderCricket called with matches:", matches);
  console.log(`Selected date: "${selectedDate}"`);
  cricketContainer.innerHTML = "";
  
  try {
    const groupedMatches = sortAndGroupMatches(matches);
    console.log("Available dates:", Object.keys(groupedMatches));
    console.log("Looking for date:", selectedDate);

    if (groupedMatches[selectedDate] && groupedMatches[selectedDate].length > 0) {
      console.log(`✓ Found ${groupedMatches[selectedDate].length} matches for ${selectedDate}`);
      
      groupedMatches[selectedDate].forEach(match => {
        const matchEl = document.createElement('div');
        matchEl.className = 'match match--cricket';
        
        // Форматируем дату в формат "14 Nov 15:00"
        let displayDate = 'Дата не указана';
        if (match.date) {
          const matchDate = new Date(match.date);
          displayDate = matchDate.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(',', '');
        }
        
        matchEl.innerHTML = `
          <div class="team">
            <img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}">
            ${match.teamInfo[0]?.shortname || match.teamInfo[0]?.name}
          </div>
          <div class="info">
            <div class="date">${displayDate}</div>
            <div class="status">${match.status}</div>
          </div>
          <div class="team">
            <img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}">
            ${match.teamInfo[1]?.shortname || match.teamInfo[1]?.name}
          </div>
        `;
        
        cricketContainer.appendChild(matchEl);
      });
    } else {
      console.log(`✗ No matches found for selected date: "${selectedDate}"`);
      console.log("Available dates are:", Object.keys(groupedMatches));
      cricketContainer.innerHTML = `<p>Нет матчей на ${selectedDate}</p>`;
    }
  } catch (error) {
    console.error("Error in renderCricket:", error);
    cricketContainer.innerHTML = "<p>Ошибка при отображении матчей</p>";
  }
}

// --- Баскетбол ---
async function loadBasketballMatches(dateStr) {
  basketballContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const res = await fetch(`/matches/basketball?date=${dateStr}`);
    const data = await res.json();
    console.log("Basketball API response:", data);

    const leagues = Array.isArray(data.data) ? data.data.slice(0, 3) : [];
    if (leagues.length === 0) {
      basketballContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }

    basketballContainer.innerHTML = "";

    leagues.forEach(leagueBlock => {
      const league = leagueBlock.league;
      const matches = leagueBlock.matches;

      if (!matches || matches.length === 0) return;

      const leagueEl = document.createElement('div');
      leagueEl.className = 'league';
      leagueEl.innerHTML = `
        <div class="league__header">
          <div class="league__logo"><img src="${league.logo}" alt="${league.name}"></div>
          <h2>${league.name}</h2>
        </div>
      `;

      matches.forEach(match => {
        // const displayTime = match.date ? new Date(match.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

        const matchEl = document.createElement('div');
        matchEl.className = 'match';
        matchEl.innerHTML = `
          <div class="team">
            <div class="team__logo"><img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}"></div>
            ${match.teamInfo[0]?.name}
          </div>
          <div class="time time--status">${match.status}</div>
          <div class="team team--2">
            ${match.teamInfo[1]?.name}
            <div class="team__logo"><img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}"></div>
          </div>
        `;
        leagueEl.appendChild(matchEl);
      });

      basketballContainer.appendChild(leagueEl);
    });

  } catch (e) {
    console.error("Basketball fetch error:", e);
    basketballContainer.innerHTML = "<p>Ошибка загрузки</p>";
  }
}

// --- Волейбол ---
async function loadVolleyballMatches(dateStr) {
  volleyballContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const res = await fetch(`/matches/volleyball?date=${dateStr}`);
    const data = await res.json();
    console.log("Volleyball API response:", data);

    const leagues = Array.isArray(data.data) ? data.data.slice(0, 3) : [];
    if (leagues.length === 0) {
      volleyballContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }

    volleyballContainer.innerHTML = "";

    leagues.forEach(leagueBlock => {
      const league = leagueBlock.league;
      const matches = leagueBlock.matches;
      if (!matches || matches.length === 0) return;

      const leagueEl = document.createElement('div');
      leagueEl.className = 'league';
      leagueEl.innerHTML = `
        <div class="league__header">
          <div class="league__logo"><img src="${league.logo}" alt="${league.name}"></div>
          <h2>${league.name}</h2>
        </div>
      `;

      matches.forEach(match => {
        // const displayTime = match.date ? new Date(match.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

        const matchEl = document.createElement('div');
        matchEl.className = 'match';
        matchEl.innerHTML = `
          <div class="team">
            <div class="team__logo"><img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}"></div>
            ${match.teamInfo[0]?.name}
          </div>
          <div class="time time--status">${match.status}</div>
          <div class="team team--2">
            ${match.teamInfo[1]?.name}
            <div class="team__logo"><img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}"></div>
          </div>
        `;
        leagueEl.appendChild(matchEl);
      });

      volleyballContainer.appendChild(leagueEl);
    });

  } catch (e) {
    console.error("Volleyball fetch error:", e);
    volleyballContainer.innerHTML = "<p>Ошибка загрузки</p>";
  }
}

loadMatches(); // Инициализация

// сразу загружаем турнирную таблицу в div#leagueTable
loadStandings(39, 2023);

// Функция загрузки и отображения таблицы
async function loadStandings(league = 39, season = 2023, containerId = 'leagueTable') {
   const container = document.getElementById(containerId);
   if (!container) return;
   container.innerHTML = '<p>Загрузка таблицы...</p>';

   try {
     const res = await fetch(`/standings/football?league=${encodeURIComponent(league)}&season=${encodeURIComponent(season)}`);
     if (!res.ok) {
       const text = await res.text();
       console.error('Standings fetch error:', res.status, text);
       container.innerHTML = '<p>Ошибка загрузки таблицы</p>';
       return;
     }
     const data = await res.json();
     console.log('Standings response:', data);

     if (!data.standings || data.standings.length === 0) {
       container.innerHTML = '<p>Таблица пустая</p>';
       return;
     }

     // Создаём расширенную таблицу со всеми полями
     const table = document.createElement('table');
     table.style.width = '100%';
     table.style.borderCollapse = 'collapse';
     table.style.marginTop = '8px';

     const thead = document.createElement('thead');
     thead.innerHTML = `
       <tr>
         <th style="text-align:left;padding:6px;border-bottom:1px solid #333">#</th>
         <th style="text-align:left;padding:6px;border-bottom:1px solid #333">Команда</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">И</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">В</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">Н</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">П</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">ГЗ</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">ГП</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">±</th>
         <th style="text-align:right;padding:6px;border-bottom:1px solid #333">О</th>
         <th style="text-align:center;padding:6px;border-bottom:1px solid #333">Форма</th>
       </tr>
     `;
     table.appendChild(thead);

     const tbody = document.createElement('tbody');

     data.standings.forEach(row => {
       // Попытка достать подробную статистику (api возвращает в поле all)
       const all = row.all || row.stats || {};
       const played = all.played ?? row.played ?? '';
       const win = all.win ?? row.win ?? '';
       const draw = all.draw ?? row.draw ?? '';
       const lose = all.lose ?? row.lose ?? '';
       const goalsFor = (all.goals && (all.goals.for ?? all.goals['for'])) ?? (row.goals?.for ?? row.goalsFor) ?? '';
       const goalsAgainst = (all.goals && (all.goals.against ?? all.goals['against'])) ?? (row.goals?.against ?? row.goalsAgainst) ?? '';
       const gfNum = Number(goalsFor) || 0;
       const gaNum = Number(goalsAgainst) || 0;
       const gd = (Number.isFinite(gfNum) && Number.isFinite(gaNum)) ? (gfNum - gaNum) : '';
       const points = row.points ?? row.pts ?? '';
       const form = row.form ?? '';

       const tr = document.createElement('tr');
       tr.innerHTML = `
         <td style="padding:6px;border-bottom:1px solid #222">${row.rank ?? ''}</td>
         <td style="padding:6px;border-bottom:1px solid #222;display:flex;align-items:center;gap:8px">
           ${row.logo ? `<img src="${row.logo}" alt="${row.team}" style="width:22px;height:22px;object-fit:contain">` : ''}
           <div>
             <div style="font-weight:600">${row.team ?? ''}</div>
             ${row.teamId ? `<div style="font-size:12px;color:#999">ID: ${row.teamId}</div>` : ''}
           </div>
         </td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${played}</td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${win}</td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${draw}</td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${lose}</td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${goalsFor}</td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${goalsAgainst}</td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${gd}</td>
         <td style="text-align:right;padding:6px;border-bottom:1px solid #222">${points}</td>
         <td style="text-align:center;padding:6px;border-bottom:1px solid #222">${form}</td>
       `;
       tbody.appendChild(tr);
     });

     table.appendChild(tbody);

     container.innerHTML = '';
     const header = document.createElement('h3');
     header.textContent = data.league?.name ? `${data.league.name} — ${data.season}` : `Таблица — ${data.season}`;
     container.appendChild(header);
     container.appendChild(table);
   } catch (err) {
     console.error('Error loading standings:', err);
     container.innerHTML = '<p>Ошибка при получении таблицы</p>';
   }
}