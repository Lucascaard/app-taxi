import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";
const app = express(); // Cria a aplicação Express

// Lista de origens permitidas
const allowedOrigins = [
  "http://localhost:3000", // Origem do React no dev
  "http://localhost:8080", // para testes no postman
];

// Configuração dinâmica do CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origem (como ferramentas de teste)
    if (!origin) return callback(null, true);

    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Origem permitida
    } else {
      callback(new Error("Not allowed by CORS")); // Origem bloqueada
    }
  },
};

// Adiciona o middleware de CORS
app.use(cors(corsOptions));

app.use(express.json()); // Middleware para interpretar JSON no corpo da requisição
app.use(express.urlencoded({ extended: true })); // Para lidar com form-data
app.use("/api", routes); // Define as rotas com prefixo "/api"
app.use((req, res, next) => {
  console.log("Headers originais:", req.headers);

  // Se necessário, você pode adicionar ou modificar headers aqui
  res.header("X-Custom-Header", "some value");

  next();
});

dotenv.config(); // Carrega variáveis de ambiente do arquivo .env
const PORT = process.env.PORT || 8080; // Porta do servidor

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
