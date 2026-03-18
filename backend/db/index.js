const path = require("path");
const fs = require("fs");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "harborlist.db");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

console.log(`Database path: ${DB_PATH}`);

let _db = null;

async function getDb() {
  if (_db) return _db;
  _db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await _db.exec("PRAGMA foreign_keys = ON");
  await _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password      TEXT NOT NULL,
      phone         TEXT,
      created_at    TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS listings (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      -- Basic
      name          TEXT NOT NULL,
      type          TEXT NOT NULL,
      price         INTEGER NOT NULL,
      year          INTEGER NOT NULL,
      condition     TEXT NOT NULL,
      status        TEXT DEFAULT 'active',
      location      TEXT NOT NULL,
      lat           REAL,
      lng           REAL,
      description   TEXT,
      category      TEXT,
      -- Dimensions
      length        REAL NOT NULL,
      beam          REAL,
      draft         REAL,
      hull_material TEXT,
      -- Engine
      engine_make   TEXT,
      engine_model  TEXT,
      engine_type   TEXT,
      engine_hours  INTEGER,
      total_power   TEXT,
      fuel_type     TEXT,
      -- Tanks
      fuel_tank     INTEGER,
      water_tank    INTEGER,
      holding_tank  INTEGER,
      -- Accommodations
      cabins        INTEGER,
      heads         INTEGER,
      berths        INTEGER,
      capacity      INTEGER,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS listing_photos (
      id          TEXT PRIMARY KEY,
      listing_id  TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      filename    TEXT NOT NULL,
      is_primary  INTEGER DEFAULT 0,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS messages (
      id           TEXT PRIMARY KEY,
      listing_id   TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      sender_name  TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      body         TEXT NOT NULL,
      read         INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_listings_user    ON listings(user_id);
    CREATE INDEX IF NOT EXISTS idx_listings_status  ON listings(status);
    CREATE INDEX IF NOT EXISTS idx_photos_listing   ON listing_photos(listing_id);
    CREATE INDEX IF NOT EXISTS idx_messages_listing ON messages(listing_id);
  `);
  return _db;
}

module.exports = { getDb };
