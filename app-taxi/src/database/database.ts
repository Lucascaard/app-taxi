import { Database } from "sqlite3";

const db = new Database("rides.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
  }
});

// Criação de tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      distance REAL NOT NULL,
      duration TEXT NOT NULL,
      driver_id INTEGER NOT NULL,
      driver_name TEXT NOT NULL,
      value REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export default db;
