import express, { Request, Response } from "express";
import mapsService from "../services/mapsService";
import axios from "axios";

const GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "fallback_key";

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

export const estimateRide = async (req: Request, res: Response) => {
  const { customer_id, origin, destination } = req.body;

  if (!customer_id || !origin || !destination) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "Os campos customer_id, origin e destination são obrigatórios.",
    });
  }

  if (origin === destination) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "Os endereços de origem e destino não podem ser os mesmos.",
    });
  }

  try {
    // Geocodificar os endereços
    const originCoordinates = await geocodeAddress(origin);
    const destinationCoordinates = await geocodeAddress(destination);

    // Obter a rota
    const routeData = await mapsService.getRoute(originCoordinates, destinationCoordinates);

    if (!routeData.routes || routeData.routes.length === 0) {
      return res.status(404).json({
        error_code: "ROUTE_NOT_FOUND",
        error_description: "Não foi possível calcular uma rota entre os endereços fornecidos.",
      });
    }

    const route = routeData.routes[0];
    const distanceMeters = route.distanceMeters;
    const duration = route.duration;
    const distanceKm = distanceMeters / 1000;

    // Dados de motoristas
    const drivers = [
      {
        id: 1,
        name: "Homer Simpson",
        description: "Motorista camarada com rosquinhas e boas risadas.",
        vehicle: "Plymouth Valiant 1973 rosa",
        review: { rating: 2, comment: "Simpatia, mas carro com cheiro de donuts." },
        ratePerKm: 2.5,
        minKm: 1,
      },
      {
        id: 2,
        name: "Dominic Toretto",
        description: "Viagem com segurança e playlist especial.",
        vehicle: "Dodge Charger R/T 1970",
        review: { rating: 4, comment: "Carro incrível, motorista super gente boa." },
        ratePerKm: 5.0,
        minKm: 5,
      },
      {
        id: 3,
        name: "James Bond",
        description: "Passeio suave e discreto digno de um agente secreto.",
        vehicle: "Aston Martin DB5",
        review: { rating: 5, comment: "Serviço impecável, experiência magnífica." },
        ratePerKm: 10.0,
        minKm: 10,
      },
    ];

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

export default { estimateRide };
