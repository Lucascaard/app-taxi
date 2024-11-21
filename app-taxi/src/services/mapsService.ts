import axios from "axios";

const API_KEY = "AIzaSyD3wiUwIv9_0do0IEwPHHm1jEOGhDVHmfI";
const BASE_URL = `https://routes.googleapis.com/directions/v2:computeRoutes`; // Corrigido para v1

const getRoute = async (origin: string, destination: string) => {
  console.log("Iniciando requisição de rota");

  try {
    const response = await axios.post(
      BASE_URL,
      {
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "DRIVE", // Certifique-se de enviar o travelMode aqui
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline",
        },
      }
      
    );

    console.log("Resposta recebida com sucesso");
    console.log("Status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Erro ao obter rota:", error);
    throw new Error("Erro ao calcular rota");
    
  }
};

export default { getRoute };
