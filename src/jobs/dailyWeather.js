import 'dotenv/config';
import { dbOperations } from '../database/db.js';
import { getWeatherForCities } from '../services/weatherApi.js';
import { formatDailyWeather } from '../utils/formatters.js';

export async function postDailyWeather(client) {
  const channelId = process.env.WEATHER_CHANNEL_ID;
  
  if (!channelId) {
    console.error('❌ WEATHER_CHANNEL_ID not set in environment variables');
    return;
  }

  try {
    const channel = await client.channels.fetch(channelId);
    
    if (!channel) {
      console.error('❌ Could not find channel with ID:', channelId);
      return;
    }

    // Get all saved cities from database
    const allCities = dbOperations.getAllCities();
    
    if (allCities.length === 0) {
      console.log('⚠️ No cities saved in database for daily weather post');
      return;
    }

    // Group cities by guild
    const citiesByGuild = {};
    for (const city of allCities) {
      if (!citiesByGuild[city.guild_id]) {
        citiesByGuild[city.guild_id] = [];
      }
      citiesByGuild[city.guild_id].push(city.city_name);
    }

    // For simplicity, post weather for the guild that owns the channel
    // In a more complex setup, you'd post to each guild's configured channel
    const guild = channel.guild;
    const cities = citiesByGuild[guild.id];
    
    if (!cities || cities.length === 0) {
      console.log(`⚠️ No cities saved for guild ${guild.name}`);
      return;
    }

    // Fetch weather data
    const weatherData = await getWeatherForCities(cities);
    const successfulData = weatherData.filter(w => w.success);
    
    if (successfulData.length === 0) {
      console.error('❌ Failed to fetch weather for any cities');
      return;
    }

    // Format and send message
    const message = formatDailyWeather(successfulData);
    await channel.send(message);
    
    console.log(`✅ Posted daily weather to ${guild.name} (#${channel.name})`);
  } catch (error) {
    console.error('❌ Error posting daily weather:', error);
  }
}
