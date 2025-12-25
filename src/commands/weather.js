import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { dbOperations } from '../database/db.js';
import { getWeather, getWeatherForCities } from '../services/weatherApi.js';
import { formatWeather, formatCityList } from '../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('weather')
  .setDescription('Check weather for saved cities or a specific city')
  .addSubcommand(subcommand =>
    subcommand
      .setName('check')
      .setDescription('Check weather for a specific city or all saved cities')
      .addStringOption(option =>
        option.setName('city')
          .setDescription('City name (e.g., Tokyo, Austin, San Diego)')
          .setRequired(false)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('add')
      .setDescription('Add a city to daily weather posts (admin only)')
      .addStringOption(option =>
        option.setName('city')
          .setDescription('City name to add')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('remove')
      .setDescription('Remove a city from daily weather posts (admin only)')
      .addStringOption(option =>
        option.setName('city')
          .setDescription('City name to remove')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('Show all cities in the daily rotation'));

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'check') {
    await handleCheck(interaction);
  } else if (subcommand === 'add') {
    await handleAdd(interaction);
  } else if (subcommand === 'remove') {
    await handleRemove(interaction);
  } else if (subcommand === 'list') {
    await handleList(interaction);
  }
}

async function handleCheck(interaction) {
  const city = interaction.options.getString('city');

  if (city) {
    // Check weather for specific city
    await interaction.deferReply();
    
    const weather = await getWeather(city);
    
    if (weather.error) {
      await interaction.editReply({
        content: weather.error === 'City not found'
          ? `Couldn't find weather for "${city}". Try a different spelling.`
          : weather.error,
        ephemeral: true
      });
      return;
    }

    await interaction.editReply(formatWeather(weather));
  } else {
    // Check weather for all saved cities
    const cities = dbOperations.getCities(interaction.guildId);
    
    if (cities.length === 0) {
      await interaction.reply({
        content: 'No cities saved yet. Use `/weather add [city]` to add one.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();
    
    const cityNames = cities.map(c => c.city_name);
    const weatherData = await getWeatherForCities(cityNames);
    
    let response = '**Weather for Saved Cities:**\n\n';
    weatherData.forEach((weather, index) => {
      if (weather.success) {
        response += formatWeather(weather) + '\n\n';
      } else {
        response += `📍 **${cityNames[index]}**\n${weather.error}\n\n`;
      }
    });

    await interaction.editReply(response.trim());
  }
}

async function handleAdd(interaction) {
  // Check for admin permissions
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: 'You need the "Manage Server" permission to add cities.',
      ephemeral: true
    });
    return;
  }

  const city = interaction.options.getString('city');
  await interaction.deferReply();

  // Verify city exists in weather API
  const weather = await getWeather(city);
  
  if (weather.error) {
    await interaction.editReply({
      content: weather.error === 'City not found'
        ? `Couldn't find "${city}". Please check the spelling and try again.`
        : weather.error,
      ephemeral: true
    });
    return;
  }

  // Add to database
  const result = dbOperations.addCity(
    interaction.guildId,
    city,
    interaction.user.id
  );

  if (result.success) {
    await interaction.editReply(`✅ Added **${city}** to daily weather posts!`);
  } else {
    await interaction.editReply({
      content: result.error || 'Failed to add city.',
      ephemeral: true
    });
  }
}

async function handleRemove(interaction) {
  // Check for admin permissions
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: 'You need the "Manage Server" permission to remove cities.',
      ephemeral: true
    });
    return;
  }

  const city = interaction.options.getString('city');
  
  const removed = dbOperations.removeCity(interaction.guildId, city);
  
  if (removed) {
    await interaction.reply(`✅ Removed **${city}** from daily weather posts.`);
  } else {
    await interaction.reply({
      content: `City "${city}" not found in the saved list.`,
      ephemeral: true
    });
  }
}

async function handleList(interaction) {
  const cities = dbOperations.getCities(interaction.guildId);
  const formatted = formatCityList(cities);
  
  await interaction.reply(formatted);
}
