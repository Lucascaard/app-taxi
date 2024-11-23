import axios from "axios";
import dotenv from "dotenv"; // Importa a biblioteca dotenv para carregar variáveis de ambiente.
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env para `process.env`.
const GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "fallback_key";

/**
 * Função para geocodificar endereços.
 * @param address Endereço a ser convertido em coordenadas.
 * @returns Um objeto contendo latitude e longitude.
 */
export const geocodeAddress = async (address: string) => {
  const response = await axios.get(GEOCODING_API_URL, {
    params: {
      address,
      key: GOOGLE_API_KEY,
    },
  });

  if (response.data.status !== "OK") {
    throw new Error(`Erro ao geocodificar endereço: ${response.data.status}`);
  }

  const location = response.data.results[0].geometry.location;
  return { latitude: location.lat, longitude: location.lng };
};
