import axios from "axios";
import dotenv from "dotenv";
dotenv.config(); // Garantindo que as variáveis sejam carregadas

const API_KEY = process.env.GOOGLE_API_KEY || "fallback_key";
const BASE_URL = `https://routes.googleapis.com/directions/v2:computeRoutes`;

const getRoute = async (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
  console.log("Iniciando requisição de rota");

  try {
    const response = await axios.post(
      BASE_URL,
      {
        origin: {
          location: {
            latLng: origin,
          },
        },
        destination: {
          location: {
            latLng: destination,
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        languageCode: "en-US",
        units: "METRIC",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
      }
    );

    console.log("Resposta recebida com sucesso");
    console.log("Dados recebidos:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Erro ao obter rota:", error);
    throw new Error("Erro ao calcular rota");
  }
};

export default { getRoute };
