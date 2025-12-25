/**
 * Get weather emoji based on weather condition
 * @param {string} main - Main weather condition
 * @returns {string} Emoji
 */
export function getWeatherEmoji(main) {
  const emojiMap = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  
  return emojiMap[main] || '🌡️';
}

/**
 * Format single city weather data
 * @param {Object} weather - Weather data from API
 * @returns {string} Formatted weather text
 */
export function formatWeather(weather) {
  const emoji = getWeatherEmoji(weather.main);
  const location = weather.country ? `${weather.city}, ${weather.country}` : weather.city;
  
  return `📍 **${location}**
${weather.temp}°F — ${capitalize(weather.description)}
High: ${weather.tempMax}°F | Low: ${weather.tempMin}°F
Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} mph`;
}

/**
 * Format multiple cities weather data for daily post
 * @param {Array<Object>} weatherData - Array of weather data
 * @returns {string} Formatted weather text
 */
export function formatDailyWeather(weatherData) {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let message = `☀️ **Weather — ${date}**\n\n`;
  
  for (const weather of weatherData) {
    if (weather.success) {
      message += formatWeather(weather) + '\n\n';
    }
  }
  
  return message.trim();
}

/**
 * Format list of saved cities
 * @param {Array<Object>} cities - Array of city records from database
 * @returns {string} Formatted list
 */
export function formatCityList(cities) {
  if (cities.length === 0) {
    return 'No cities saved yet. Use `/weather add [city]` to add one.';
  }
  
  let list = '**Saved Cities:**\n\n';
  cities.forEach((city, index) => {
    list += `${index + 1}. ${city.city_name}\n`;
  });
  
  return list;
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
