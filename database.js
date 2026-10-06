const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("users.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    title TEXT,
    completed INTEGER DEFAULT 0
  )
`);

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN email TEXT
  `);
} catch (error) {
  // Column already exists
}

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN password TEXT
  `);
} catch (error) {
  // Column already exists
}

console.log("Database connected successfully!");

module.exports = db;
