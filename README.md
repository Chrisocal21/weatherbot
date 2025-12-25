# Weather Bot

A Discord bot that posts daily weather for saved cities and lets users check weather on demand.

## Features

- 🌤️ Daily automated weather posts for saved cities
- 🔍 On-demand weather checks for any city worldwide
- 📍 Save and manage cities for daily updates
- 🔐 Admin controls for city management

## Commands

| Command | Example | Description |
|---------|---------|-------------|
| `/weather check` | `/weather check` | Shows weather for all saved cities |
| `/weather check [city]` | `/weather check Tokyo` | Shows weather for a specific city |
| `/weather add [city]` | `/weather add Austin` | Add city to daily posts (admin only) |
| `/weather remove [city]` | `/weather remove Tokyo` | Remove city from daily posts (admin only) |
| `/weather list` | `/weather list` | Show all cities in the daily rotation |

## Setup

### Prerequisites

- Node.js 18 or higher
- Discord Bot Token
- OpenWeather API Key (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd weather-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get a Discord Bot Token**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and click "Add Bot"
   - Copy your bot token
   - Under OAuth2 → URL Generator:
     - Select scopes: `bot`, `applications.commands`
     - Select permissions: `Send Messages`, `Embed Links`
   - Use the generated URL to invite the bot to your server

4. **Get an OpenWeather API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Verify your email
   - Go to "API Keys" tab and copy your key
   - Note: New keys take ~10 minutes to activate

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   OPENWEATHER_API_KEY=your_openweather_key_here
   WEATHER_CHANNEL_ID=your_channel_id_here
   WEATHER_POST_TIME=07:00
   ```

   To get your channel ID:
   - Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
   - Right-click the channel and select "Copy ID"

6. **Run the bot**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## Usage

### Add Cities to Daily Posts

1. Use `/weather add Tokyo` to add a city
2. The bot will verify the city exists and save it
3. It will appear in the next daily post

### Check Weather Anytime

- `/weather check` - See all saved cities
- `/weather check Paris` - Check any city instantly

### Daily Weather Post

The bot automatically posts weather at the configured time (default: 7:00 AM) in the designated channel.

Example post:
```
☀️ Weather — Wednesday, December 24, 2025

📍 San Diego, CA
72°F — Sunny
High: 75°F | Low: 58°F
Humidity: 45% | Wind: 8 mph

📍 Tokyo, Japan
48°F — Cloudy
High: 52°F | Low: 41°F
Humidity: 65% | Wind: 12 mph
```

## Deploy to Railway

1. Push your code to GitHub
2. Go to [Railway](https://railway.app) and create a new project
3. Select "Deploy from GitHub repo"
4. Add environment variables in Railway:
   - `DISCORD_TOKEN`
   - `OPENWEATHER_API_KEY`
   - `WEATHER_CHANNEL_ID`
   - `WEATHER_POST_TIME`
5. Deploy!

The `railway.json` file is already configured for automatic deployment.

## API Limits

OpenWeather free tier:
- 1,000 API calls per day
- Current weather data
- More than enough for small to medium servers

With 5 saved cities and occasional manual checks, you'll use ~50-100 calls per day.

## Tech Stack

- **Node.js** - Runtime
- **Discord.js v14** - Discord bot library
- **sql.js** - Local database for saved cities (pure JavaScript SQLite)
- **node-cron** - Schedule daily weather posts
- **OpenWeather API** - Weather data source

## Troubleshooting

**Bot doesn't respond to commands:**
- Make sure the bot has proper permissions in your server
- Check that slash commands are registered (they appear when you type `/`)

**"Weather service is temporarily unavailable":**
- Check your OpenWeather API key is correct
- New API keys take ~10 minutes to activate

**Daily post doesn't appear:**
- Verify `WEATHER_CHANNEL_ID` is correct
- Check `WEATHER_POST_TIME` format (24-hour format, e.g., `07:00`)
- Ensure bot has permission to send messages in that channel

## License

ISC
