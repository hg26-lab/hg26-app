const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

// Use DATABASE_PATH in production.
// Otherwise, use data/app.db during local development.
const databasePath =
  process.env.DATABASE_PATH || path.join(__dirname, 'data', 'app.db')

// Create the data directory if it does not exist.
fs.mkdirSync(path.dirname(databasePath), { recursive: true })

// Open the SQLite database.
// SQLite creates app.db automatically if it does not exist.
const db = new Database(databasePath)

// Improve SQLite behavior for concurrent reads and writes.
db.pragma('journal_mode = WAL')

// Create a users table if it does not already exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

// Make the database available to server.js.
module.exports = db
