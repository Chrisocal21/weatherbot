import { Events } from 'discord.js';
import cron from 'node-cron';
import { postDailyWeather } from '../jobs/dailyWeather.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
  console.log(`✅ Logged in as ${client.user.tag}`);
  
  // Register slash commands
  const commands = client.commands.map(cmd => cmd.data.toJSON());
  await client.application.commands.set(commands);
  console.log('✅ Slash commands registered');
  
  // Set up daily weather cron job
  const postTime = process.env.WEATHER_POST_TIME || '07:00';
  const [hour, minute] = postTime.split(':');
  
  // Cron format: minute hour * * *
  const cronExpression = `${minute} ${hour} * * *`;
  
  cron.schedule(cronExpression, async () => {
    console.log('⏰ Running daily weather post...');
    await postDailyWeather(client);
  });
  
  console.log(`✅ Daily weather scheduled for ${postTime}`);
  
  // Optional: Post weather immediately on startup if DEFAULT_CITIES is set
  if (process.env.DEFAULT_CITIES && process.env.WEATHER_CHANNEL_ID) {
    const cities = process.env.DEFAULT_CITIES.split('|').map(c => c.trim());
    console.log(`📍 Default cities configured: ${cities.join(', ')}`);
  }
}
