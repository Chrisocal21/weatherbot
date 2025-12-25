import 'dotenv/config';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch weather data from OpenWeather API
 * @param {string} city - City name (e.g., "Tokyo", "San Diego, CA", "London, UK")
 * @returns {Promise<Object>} Weather data or null if not found
 */
export async function getWeather(city) {
  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'City not found' };
      }
      return { error: `Weather service error: ${response.statusText}` };
    }

    const data = await response.json();
    
    return {
      success: true,
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      main: data.weather[0].main,
      windSpeed: Math.round(data.wind.speed),
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return { error: 'Weather service is temporarily unavailable' };
  }
}

/**
 * Fetch weather for multiple cities
 * @param {Array<string>} cities - Array of city names
 * @returns {Promise<Array<Object>>} Array of weather data
 */
export async function getWeatherForCities(cities) {
  const promises = cities.map(city => getWeather(city));
  return Promise.all(promises);
}
