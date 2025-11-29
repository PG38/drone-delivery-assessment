const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'drone_delivery.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('admin', 'enduser', 'drone'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, ASSIGNED, DELIVERED, FAILED
    assigned_drone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assigned_drone) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS drones (
    id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'IDLE', -- IDLE, BUSY, BROKEN
    location TEXT DEFAULT '0,0', -- lat,long
    current_order_id INTEGER,
    FOREIGN KEY(id) REFERENCES users(username),
    FOREIGN KEY(current_order_id) REFERENCES orders(id)
  );
`);

module.exports = db;
