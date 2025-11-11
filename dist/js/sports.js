const footballContainer = document.getElementById('footballLeagues');
const cricketContainer = document.getElementById('cricketLeagues');
const basketballContainer = document.getElementById('basketballLeagues');
const volleyballContainer = document.getElementById('volleyballLeagues');
const dateInput = document.getElementById('matchDate');

// Ограничение футболa по ключевым словам (нижний регистр)
const allowedFootballKeywords = [
  'Premier League', 'Saudi Pro League', 'English Premier League', 'sudan', 'UEFA Champions League', 'oman',
];

let currentDate = new Date();
dateInput.value = currentDate.toISOString().split("T")[0];

document.getElementById('prevDay').addEventListener('click', () => changeDate(-1));
document.getElementById('nextDay').addEventListener('click', () => changeDate(1));
dateInput.addEventListener('change', loadMatches);

function changeDate(offset) { 
  currentDate.setDate(currentDate.getDate() + offset);
  dateInput.value = currentDate.toISOString().split("T")[0];
  loadMatches();
} 

async function loadMatches() { 
  const dateStr = dateInput.value;
  await Promise.all([
    loadFootballMatches(dateStr),
    loadCricketMatches(dateStr),
    loadBasketballMatches(dateStr),
    loadVolleyballMatches(dateStr)
  ]);
}

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

  // фильтруем матчи по ключевым словам (лига или команды)
  const filtered = matches.filter(isAllowedFootball);

  if (!filtered.length) {
    footballContainer.innerHTML = "<p>Нет матчей в выбранных лигах</p>";
    return;
  }

  const leaguesMap = {};
  filtered.forEach(event => {
    const leagueId = event.league.id;
    if (!leaguesMap[leagueId]) leaguesMap[leagueId] = { league: event.league, events: [] };
    leaguesMap[leagueId].events.push(event);
  });

  for (const leagueId in leaguesMap) {
    const { league, events } = leaguesMap[leagueId];
    const leagueEl = document.createElement('div');
    leagueEl.className = 'league';
    leagueEl.innerHTML = `<div class="league-header"><img src="${league.logo}" alt="${league.name}"><h2>${league.name}</h2></div>`;
    events.forEach(event => {
      const status = event.fixture.status;
      const isLive = ['1H','2H','ET','P','LIVE','HT'].includes(status.short);
      let displayTime;
      if (isLive && status.elapsed !== null) displayTime = `<span class="live">LIVE ${status.elapsed}'</span>`; 
      else if (['FT','AET','P'].includes(status.short)) displayTime = `<strong>${event.goals.home ?? 0} - ${event.goals.away ?? 0}</strong>`;
      else displayTime = new Date(event.fixture.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      const matchEl = document.createElement('div');
      matchEl.className = 'match';
      if (isLive) matchEl.classList.add('live');
      matchEl.innerHTML = `<div class="team"><img src="${event.teams.home.logo}" alt="${event.teams.home.name}">${event.teams.home.name}</div><div class="time">${displayTime}</div><div class="team">${event.teams.away.name}<img src="${event.teams.away.logo}" alt="${event.teams.away.name}"></div>`;
      leagueEl.appendChild(matchEl);
    });
    footballContainer.appendChild(leagueEl);
  }
}

// Загружаем матчи
async function loadCricketMatches() {
  cricketContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const res = await fetch("/matches/cricket");
    const data = await res.json();
    console.log("Cricket API response:", data);
    
    // Исправляем здесь - используем data.data вместо data.matches
    if (!data.data || data.data.length === 0) {
      console.log("No matches found or empty array");
      cricketContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }
    
    console.log(`Found ${data.data.length} matches, proceeding to render`);
    renderCricket(data.data); // Передаем data.data вместо data.matches
  } catch (e) {
    console.error("Error loading matches:", e);
    cricketContainer.innerHTML = "<p>Ошибка загрузки</p>";
  }
}

// Группировка матчей по дате (исправленная)
function sortAndGroupMatches(matches) {
  console.log("sortAndGroupMatches called with:", matches);
  
  matches.forEach(match => {
    // Используем свойство date вместо dateTimeGMT
    const dateString = match.date || match.dateTimeGMT;
    
    if (!dateString) {
      console.warn("Missing date for match:", match);
      match.dateOnly = "unknown";
      return;
    }
    
    const matchDate = new Date(dateString);
    
    // Проверяем, что дата валидна
    if (isNaN(matchDate.getTime())) {
      console.warn("Invalid date:", dateString, "for match:", match);
      match.dateOnly = "invalid";
      return;
    }
    
    match.dateOnly = matchDate.toISOString().split('T')[0];
    console.log(`Match date: ${dateString} -> ${match.dateOnly}`);
  });

  // Фильтруем матчи с валидными датами
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

// Отображение матчей (исправленное)
function renderCricket(matches) {
  console.log("renderCricket called with matches:", matches);
  cricketContainer.innerHTML = "";
  
  const selectedDate = dateInput.value;
  console.log(`Selected date from input: "${selectedDate}"`);

  try {
    const groupedMatches = sortAndGroupMatches(matches);
    console.log("Available dates:", Object.keys(groupedMatches));

    if (groupedMatches[selectedDate] && groupedMatches[selectedDate].length > 0) {
      console.log(`Found ${groupedMatches[selectedDate].length} matches for ${selectedDate}`);
      
      const dateHeader = document.createElement('h3');
      dateHeader.textContent = selectedDate;
      cricketContainer.appendChild(dateHeader);

      groupedMatches[selectedDate].forEach(match => {
        const matchEl = document.createElement('div');
        matchEl.className = 'match';
        
        // Используем свойство date для отображения
        const displayDate = match.date ? new Date(match.date).toLocaleString() : 'Дата не указана';
        
        matchEl.innerHTML = `
          <div class="team">
            <img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}">
            ${match.teamInfo[0]?.shortname || match.teamInfo[0]?.name}
          </div>
          <div class="status">${match.status}</div>
          <div class="team">
            <img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}">
            ${match.teamInfo[1]?.shortname || match.teamInfo[1]?.name}
          </div>
          <div class="date">${displayDate}</div>
        `;
        
        cricketContainer.appendChild(matchEl);
      });
    } else {
      console.log(`No matches found for selected date: "${selectedDate}"`);
      console.log("Available dates are:", Object.keys(groupedMatches));
      cricketContainer.innerHTML = "<p>Нет матчей на выбранную дату</p>";
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

    // ограничим вывод первыми тремя лигами
    const leagues = Array.isArray(data.data) ? data.data.slice(0, 3) : [];
    if (leagues.length === 0) {
      basketballContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }

    basketballContainer.innerHTML = "";

    // Проходим по лигам (используем переменную leagues вместо data.data)
    leagues.forEach(leagueBlock => {
      const league = leagueBlock.league;
      const matches = leagueBlock.matches;

      if (!matches || matches.length === 0) return;

      const leagueEl = document.createElement('div');
      leagueEl.className = 'league';
      leagueEl.innerHTML = `
        <div class="league-header">
          <img src="${league.logo}" alt="${league.name}">
          <h2>${league.name}</h2>
        </div>
      `;

      matches.forEach(match => {
        const displayTime = match.date ? new Date(match.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

        const matchEl = document.createElement('div');
        matchEl.className = 'match';
        matchEl.innerHTML = `
          <div class="team">
            <img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}">
            ${match.teamInfo[0]?.name}
          </div>
          <div class="status">${match.status}</div>
          <div class="team">
            <img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}">
            ${match.teamInfo[1]?.name}
          </div>
          <div class="time">${displayTime}</div>
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

// новый загрузчик волейбола (по тому же принципу)
async function loadVolleyballMatches(dateStr) {
  volleyballContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const res = await fetch(`/matches/volleyball?date=${dateStr}`);
    const data = await res.json();
    console.log("Volleyball API response:", data);

    // ограничим вывод первыми тремя лигами
    const leagues = Array.isArray(data.data) ? data.data.slice(0, 3) : [];
    if (leagues.length === 0) {
      volleyballContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }

    volleyballContainer.innerHTML = "";

    // Проходим по первым трём лигам
    leagues.forEach(leagueBlock => {
      const league = leagueBlock.league;
      const matches = leagueBlock.matches;
      if (!matches || matches.length === 0) return;

      const leagueEl = document.createElement('div');
      leagueEl.className = 'league';
      leagueEl.innerHTML = `
        <div class="league-header">
          <img src="${league.logo}" alt="${league.name}">
          <h2>${league.name}</h2>
        </div>
      `;

      matches.forEach(match => {
        const displayTime = match.date ? new Date(match.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

        const matchEl = document.createElement('div');
        matchEl.className = 'match';
        matchEl.innerHTML = `
          <div class="team">
            <img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}">
            ${match.teamInfo[0]?.name}
          </div>
          <div class="status">${match.status}</div>
          <div class="team">
            <img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}">
            ${match.teamInfo[1]?.name}
          </div>
          <div class="time">${displayTime}</div>
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

// Инициализация
loadMatches();
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
