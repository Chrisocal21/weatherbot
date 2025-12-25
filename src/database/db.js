import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'weather.db');

// Initialize SQL.js
const SQL = await initSqlJs();
let db;

// Load or create database
if (existsSync(dbPath)) {
  const buffer = readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

// Initialize database schema
db.run(`
  CREATE TABLE IF NOT EXISTS saved_cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    city_name TEXT NOT NULL,
    added_by TEXT NOT NULL,
    added_at INTEGER NOT NULL,
    UNIQUE(guild_id, city_name)
  )
`);

// Save database to file
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

export const dbOperations = {
  addCity(guildId, cityName, addedBy) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      db.run(
        'INSERT INTO saved_cities (guild_id, city_name, added_by, added_at) VALUES (?, ?, ?, ?)',
        [guildId, cityName, addedBy, timestamp]
      );
      saveDatabase();
      return { success: true };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return { success: false, error: 'City already exists in the list' };
      }
      return { success: false, error: error.message };
    }
  },

  removeCity(guildId, cityName) {
    db.run(
      'DELETE FROM saved_cities WHERE guild_id = ? AND city_name = ?',
      [guildId, cityName]
    );
    const result = db.getRowsModified();
    saveDatabase();
    return result > 0;
  },

  getCities(guildId) {
    const stmt = db.prepare('SELECT * FROM saved_cities WHERE guild_id = ? ORDER BY added_at ASC');
    stmt.bind([guildId]);
    const cities = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      cities.push(row);
    }
    stmt.free();
    return cities;
  },

  getAllCities() {
    const stmt = db.prepare('SELECT * FROM saved_cities ORDER BY guild_id, added_at ASC');
    const cities = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      cities.push(row);
    }
    stmt.free();
    return cities;
  },

  cityExists(guildId, cityName) {
    const stmt = db.prepare('SELECT id FROM saved_cities WHERE guild_id = ? AND city_name = ?');
    stmt.bind([guildId, cityName]);
    const exists = stmt.step();
    stmt.free();
    return exists;
  }
};

export default db;
