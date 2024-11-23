import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";

const corsOptions = {
  origin: "http://localhost:8080",
  optionsSuccessStatus: 200, // para compatibilidade com React Router
};

const app = express(); // Cria a aplicação Express

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
