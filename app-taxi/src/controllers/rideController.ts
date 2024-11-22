//! Usamos essas importações para definir tipos para a requisição e resposta, além de criar endpoints com Express.
import express, { Request, Response } from "express";

//!  Importa o serviço que faz a chamada à API Routes do Google.
import mapsService from "../services/mapsService";

//!  Importado aqui para usar a API Geocoding, que transforma endereços em coordenadas (latitude e longitude).
import axios from "axios";

//! URL base para a API Geocoding, usada para converter endereços em coordenadas.
const GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

//!  A chave da API é carregada a partir do arquivo .env. Se não estiver configurada, usamos uma chave alternativa (fallback_key).
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "fallback_key";

//! Função para geocodificar endereços
const geocodeAddress = async (address: string) => {
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

/*
    axios.get(): Faz uma requisição GET para a API Geocoding.

    address: O endereço fornecido no corpo da requisição.
    key: A chave da API.
    Validação do status da API:

    Se a resposta não for "OK", lançamos um erro indicando o problema. Isso evita que dados inválidos continuem no fluxo.
    Extração das coordenadas:

    Obtemos latitude e longitude da propriedade geometry.location do primeiro resultado retornado.
    Retorno:

    Retornamos as coordenadas como um objeto { latitude, longitude }.
 */

export const estimateRide = async (req: Request, res: Response) => {
  /*
    req: Contém os dados enviados pelo cliente.
    res: Usado para enviar a resposta ao cliente.
  */
  const { customer_id, origin, destination } = req.body;

  if (!customer_id || !origin || !destination) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description:
        "Os campos customer_id, origin e destination são obrigatórios.",
    });
  }

  if (origin === destination) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description:
        "Os endereços de origem e destino não podem ser os mesmos.",
    });
  }

  /* 
   !Desestruturação do req.body:

    Extrai os campos enviados no corpo da requisição.
    Validação de campos obrigatórios:

    Se customer_id, origin ou destination estiverem vazios, retornamos um erro 400 (Bad Request) com uma mensagem clara.
    Validação de endereços iguais:

    Garantimos que origem e destino sejam diferentes.
  */

  try {
    //! Geocodificar os endereços
    const originCoordinates = await geocodeAddress(origin);
    const destinationCoordinates = await geocodeAddress(destination);

    /*
      Conversão de endereços em coordenadas:
      Usamos a função geocodeAddress para transformar origin e destination em coordenadas.
    */

    // Obter a rota
    const routeData = await mapsService.getRoute(
      originCoordinates,
      destinationCoordinates
    );

    // Chamamos o serviço getRoute (em mapsService) para calcular a rota entre as coordenadas.

    //! VALIDACAO DA RESPOSTA DA API
    if (!routeData.routes || routeData.routes.length === 0) {
      return res.status(404).json({
        error_code: "ROUTE_NOT_FOUND",
        error_description:
          "Não foi possível calcular uma rota entre os endereços fornecidos.",

        //Garantimos que a resposta contenha pelo menos uma rota válida. Caso contrário, retornamos um erro 404 (Not Found).
      });
    }

    //! Extração de informações da rota
    const route = routeData.routes[0];
    const distanceMeters = route.distanceMeters;
    const duration = route.duration;
    const distanceKm = distanceMeters / 1000;

    //! Dados de motoristas
    const drivers = [
      {
        id: 1,
        name: "Homer Simpson",
        description: "Motorista camarada com rosquinhas e boas risadas.",
        vehicle: "Plymouth Valiant 1973 rosa",
        review: {
          rating: 2,
          comment: "Simpatia, mas carro com cheiro de donuts.",
        },
        ratePerKm: 2.5,
        minKm: 1,
      },
      {
        id: 2,
        name: "Dominic Toretto",
        description: "Viagem com segurança e playlist especial.",
        vehicle: "Dodge Charger R/T 1970",
        review: {
          rating: 4,
          comment: "Carro incrível, motorista super gente boa.",
        },
        ratePerKm: 5.0,
        minKm: 5,
      },
      {
        id: 3,
        name: "James Bond",
        description: "Passeio suave e discreto digno de um agente secreto.",
        vehicle: "Aston Martin DB5",
        review: {
          rating: 5,
          comment: "Serviço impecável, experiência magnífica.",
        },
        ratePerKm: 10.0,
        minKm: 10,
      },
    ];

    //! Filtragem e ordenação
    const options = drivers
      .filter((driver) => distanceKm >= driver.minKm)
      .map((driver) => ({
        id: driver.id,
        name: driver.name,
        description: driver.description,
        vehicle: driver.vehicle,
        review: driver.review,
        value: driver.ratePerKm * distanceKm,
      }))
      .sort((a, b) => a.value - b.value);

    /*
        !Filtragem:

        Apenas motoristas cuja distância mínima (minKm) é satisfeita são incluídos.
        Mapeamento:

        Cada motorista na lista é transformado em um objeto contendo:
        Informações básicas do motorista.
        value: Valor total da corrida (taxa por km × distância).
        Ordenação:

        Os motoristas são ordenados pelo custo da corrida, do mais barato para o mais caro.
      */

    //! Resposta Final
    return res.status(200).json({
      origin: originCoordinates,
      destination: destinationCoordinates,
      distance: distanceKm,
      duration,
      options,
      routeResponse: routeData,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      error_code: "ROUTE_CALCULATION_ERROR",
      error_description: error instanceof Error ? error.message : String(error),
    });
  }
};

/*
  Retornamos:
  Coordenadas de origem e destino.
  Distância e duração.
  Lista de motoristas ordenada por custo.
  Resposta original da rota do Google.
*/

export default { estimateRide };
