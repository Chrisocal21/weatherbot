# Weather Bot — BUILD.md

A Discord bot that posts daily weather for saved cities and lets users check any city on demand.

---

## What This Bot Does

- Posts weather for your saved cities every morning
- Users can check weather for any city with `/weather Tokyo`
- Admins can add/remove cities from the daily post list

---

## Commands

| Command | Example | Description |
|---------|---------|-------------|
| `/weather` | `/weather` | Shows weather for all saved cities |
| `/weather [city]` | `/weather Austin` | Shows weather for a specific city |
| `/weather add [city]` | `/weather add Tokyo` | Add city to daily posts (admin only) |
| `/weather remove [city]` | `/weather remove Tokyo` | Remove city from daily posts (admin only) |
| `/weather list` | `/weather list` | Show all cities in the daily rotation |

---

## How It Works

### Morning Post (passive)

Posted daily at a set time (e.g., 7:00 AM) in a designated channel:

```
☀️ **Weather — December 24, 2024**

📍 **San Diego, CA**
72°F — Sunny
High: 75°F | Low: 58°F
Humidity: 45% | Wind: 8 mph

📍 **Tokyo, Japan**
48°F — Cloudy
High: 52°F | Low: 41°F
Humidity: 65% | Wind: 12 mph
```

### On-Demand Check

User types `/weather Austin`:

```
📍 **Austin, TX**
68°F — Partly Cloudy
High: 74°F | Low: 55°F
Humidity: 50% | Wind: 10 mph
```

---

## File Structure

```
weather-bot/
├── src/
│   ├── index.js              # Bot startup and Discord client
│   ├── commands/
│   │   └── weather.js        # /weather command (all subcommands)
│   ├── events/
│   │   ├── ready.js          # Bot online, start cron job
│   │   └── interactionCreate.js  # Handle slash commands
│   ├── jobs/
│   │   └── dailyWeather.js   # Morning weather post
│   ├── services/
│   │   └── weatherApi.js     # OpenWeather API calls
│   ├── database/
│   │   └── db.js             # SQLite setup and queries
│   └── utils/
│       └── formatters.js     # Format weather data for display
├── data/
│   └── weather.db            # SQLite database (created automatically)
├── .env                      # API keys and bot token
├── .env.example              # Template
├── package.json              # Dependencies
├── railway.json              # Railway deployment config
└── README.md                 # Setup instructions
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js** | Runtime |
| **Discord.js v14** | Discord bot library |
| **better-sqlite3** | Store saved cities |
| **node-cron** | Scheduled morning post |
| **OpenWeather API** | Weather data (free tier) |
| **Railway** | Hosting |

---

## Database Schema

### saved_cities

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| guild_id | TEXT | Discord server ID |
| city_name | TEXT | City name as entered |
| added_by | TEXT | User ID who added it |
| added_at | INTEGER | Unix timestamp |

---

## API Setup

### OpenWeather (free)

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Go to "API Keys" tab
4. Copy your API key

**Free tier limits:**
- 1,000 calls/day
- Current weather + forecast
- More than enough for a small server

**API endpoint we'll use:**
```
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=imperial
```

---

## Setup Steps

### 1. Create Discord Bot

Same as timer bot:
1. [Discord Developer Portal](https://discord.com/developers/applications)
2. New Application → Bot → Copy token
3. OAuth2 → URL Generator → `bot`, `applications.commands`
4. Permissions: `Send Messages`, `Embed Links`
5. Add to your server

### 2. Get OpenWeather API Key

1. Sign up at [openweathermap.org](https://openweathermap.org)
2. Verify email
3. Copy API key from dashboard
4. Note: New keys take ~10 minutes to activate

### 3. Local Development

```bash
git clone https://github.com/YOUR_USERNAME/weather-bot.git
cd weather-bot
npm install
cp .env.example .env
# Add your DISCORD_TOKEN and OPENWEATHER_API_KEY to .env
npm run dev
```

### 4. Deploy to Railway

1. Push to GitHub
2. Railway → New Project → Deploy from GitHub
3. Add environment variables:
   - `DISCORD_TOKEN`
   - `OPENWEATHER_API_KEY`
   - `WEATHER_CHANNEL_ID`
   - `WEATHER_POST_TIME` (e.g., `07:00`)

---

## Environment Variables

```env
# .env.example
DISCORD_TOKEN=your_bot_token_here
OPENWEATHER_API_KEY=your_openweather_key_here
WEATHER_CHANNEL_ID=channel_id_for_daily_posts
WEATHER_POST_TIME=07:00
DEFAULT_CITIES=San Diego,CA|Tokyo,Japan
```

---

## Development Order

### Phase 1: Foundation
- [ ] Initialize project with package.json
- [ ] Set up Discord.js client
- [ ] Create database schema
- [ ] Test OpenWeather API connection

### Phase 2: Commands
- [ ] `/weather [city]` — check any city
- [ ] `/weather add [city]` — save city (admin)
- [ ] `/weather remove [city]` — remove city (admin)
- [ ] `/weather list` — show saved cities

### Phase 3: Daily Post
- [ ] Cron job for morning post
- [ ] Format multi-city weather embed
- [ ] Test timing

### Phase 4: Polish
- [ ] Error handling (city not found, API down)
- [ ] Rate limiting protection
- [ ] Clean embed formatting

---

## Error Handling

| Error | Response |
|-------|----------|
| City not found | "Couldn't find weather for [city]. Try a different spelling." |
| API down | "Weather service is temporarily unavailable. Try again later." |
| No saved cities | "No cities saved yet. Use `/weather add [city]` to add one." |

---

## Notes

- OpenWeather free tier is generous — 1,000 calls/day
- With 5 saved cities and a few manual checks, you'll use maybe 50 calls/day
- City names are flexible: "San Diego", "San Diego, CA", "San Diego, US" all work
- API returns temps in Kelvin by default — we use `units=imperial` for Fahrenheit

---

## Future Ideas (Out of Scope for V1)

- Extended forecast (next 5 days)
- Weather alerts/warnings
- Sunrise/sunset times
- UV index
- User-specific saved cities (not just server-wide)