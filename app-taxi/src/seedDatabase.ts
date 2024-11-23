import { Database } from "sqlite3";

// Caminho para o banco de dados
const DB_FILE = "./rides.db";

// Criar conexão com o banco
const db = new Database(DB_FILE);

// Criar tabelas e inserir dados
db.serialize(() => {
  console.log("Populando banco de dados...");

  // Recriar tabela de corridas
  db.run(`DROP TABLE IF EXISTS rides;`);
  db.run(`
    CREATE TABLE rides (
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
    );
  `);

  // Inserir corridas para o endpoint GET /ride/{customer_id}
  const rides = [
    {
      customer_id: "12345",
      origin: "Curitiba, PR",
      destination: "São Paulo, SP",
      distance: 416.156,
      duration: "20335s",
      driver_id: 1,
      driver_name: "Homer Simpson",
      value: 1040.39,
    },
    {
      customer_id: "123",
      origin: "Rio de Janeiro, RJ",
      destination: "Curitiba, PR",
      distance: 852.312,
      duration: "40700s",
      driver_id: 2,
      driver_name: "Dominic Toretto",
      value: 4261.56,
    },
    {
      customer_id: "456",
      origin: "São Paulo, SP",
      destination: "Rio de Janeiro, RJ",
      distance: 430.789,
      duration: "21000s",
      driver_id: 3,
      driver_name: "James Bond",
      value: 4307.89,
    },
  ];

  rides.forEach((ride) => {
    db.run(
      `INSERT INTO rides (customer_id, origin, destination, distance, duration, driver_id, driver_name, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ride.customer_id,
        ride.origin,
        ride.destination,
        ride.distance,
        ride.duration,
        ride.driver_id,
        ride.driver_name,
        ride.value,
      ]
    );
  });

  console.log("Banco de dados populado com sucesso.");
});

// Fechar conexão
db.close();
