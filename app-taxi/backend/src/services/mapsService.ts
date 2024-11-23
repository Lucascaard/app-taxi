import axios from "axios"; // Importa a biblioteca Axios para realizar requisições HTTP.
import dotenv from "dotenv"; // Importa a biblioteca dotenv para carregar variáveis de ambiente.
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env para `process.env`.

const API_KEY = process.env.GOOGLE_API_KEY || "fallback_key"; // Define a chave da API do Google, utilizando uma variável de ambiente ou um valor padrão caso ela não esteja disponível.
const BASE_URL = `https://routes.googleapis.com/directions/v2:computeRoutes`; // URL base da API Routes do Google.

const getRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  console.log("Iniciando requisição de rota"); // Mensagem de log para indicar o início da requisição.

  try {
    // Realiza a requisição POST para a API do Google Routes.
    const response = await axios.post(
      BASE_URL, // URL para a qual a requisição será enviada.
      {
        // Corpo da requisição contendo os dados necessários para a rota.
        origin: {
          location: {
            latLng: origin, // Define a latitude e longitude do ponto de origem.
          },
        },
        destination: {
          location: {
            latLng: destination, // Define a latitude e longitude do ponto de destino.
          },
        },
        travelMode: "DRIVE", // Especifica o modo de transporte como "DRIVE" (dirigir).
        routingPreference: "TRAFFIC_AWARE", // Define a preferência de rota considerando o tráfego.
        computeAlternativeRoutes: false, // Indica que rotas alternativas não devem ser calculadas.
        routeModifiers: {
          avoidTolls: false, // Não evitar pedágios.
          avoidHighways: false, // Não evitar rodovias.
          avoidFerries: false, // Não evitar balsas.
        },
        languageCode: "en-US", // Define o idioma das respostas como inglês (EUA).
        units: "METRIC", // Define as unidades de medida como métricas (quilômetros e metros).
      },
      {
        headers: {
          "Content-Type": "application/json", // Especifica que o corpo da requisição está no formato JSON.
          "X-Goog-Api-Key": API_KEY, // Inclui a chave da API para autenticação.
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline", // Especifica os campos desejados na resposta da API.
        },
      }
    );

    console.log("Resposta recebida com sucesso"); // Log para indicar que a requisição foi bem-sucedida.
    console.log("Dados recebidos:", JSON.stringify(response.data, null, 2)); // Log detalhado dos dados recebidos.
    return response.data; // Retorna os dados da resposta para quem chamou a função.
  } catch (error) {
    // Caso ocorra algum erro durante a requisição, captura e trata o erro.
    console.error("Erro ao obter rota:", error); // Log do erro para depuração.
    throw new Error("Erro ao calcular rota"); // Lança um novo erro com uma mensagem mais clara.
  }
};

export default { getRoute }; // Exporta a função getRoute como parte do objeto padrão para ser usada em outros módulos.
