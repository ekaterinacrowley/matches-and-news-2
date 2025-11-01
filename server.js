import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// API keys
const FOOTBALL_KEY = process.env.FOOTBALL_API_KEY || '76b6f309a4d1ff9512ec99c2dd0ad8e5';
const CRICKET_KEY = process.env.CRICKET_API_KEY || '__API_KEY_CRICKET__';

// CORS
app.use(cors());

// --- Футбол ---
app.get("/matches/football", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date обязателен" });

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
      headers: {
        'x-rapidapi-key': '76b6f309a4d1ff9512ec99c2dd0ad8e5', // вставь свой
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    });

    const text = await response.text();
    console.log(`[DEBUG] Football API status: ${response.status}`);
    console.log(`[DEBUG] Football API body: ${text.slice(0, 1000)}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Football API error ${response.status}`, raw: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: "Invalid JSON", raw: text });
    }

    res.json(data);
  } catch (err) {
    console.error("Football proxy error:", err);
    res.status(500).json({ error: "Football proxy error" });
  }
});


// --- Крикет ---
app.get("/matches/cricket", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=eebe5ade-a481-477d-8f02-440685b4cd53&offset=0`
    );

    const text = await response.text();
    console.log(`[DEBUG] Cricket API status: ${response.status}`);
    console.log(`[DEBUG] Cricket API body: ${text.slice(0, 500)}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Cricket API ${response.status}`, raw: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: "Invalid JSON", raw: text });
    }

    if (!data.data || data.data.length === 0) {
      return res.json({ matches: [], message: "Матчей нет" });
    }

    const matches = data.data.map(match => ({
      id: match.id,
      name: match.name,
      venue: match.venue,
      status: match.status,
      teams: match.teams,
      date: match.dateTimeGMT,
    }));

    res.json({ data: matches });
  } catch (err) {
    console.error("Cricket proxy error:", err);
    res.status(500).json({ error: "Крикет ошибка" });
  }
});


// Статика
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
