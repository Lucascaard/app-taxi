import express, { Request, Response } from "express";
import mapsService from "../services/mapsService";

export const estimateRide = async (req: Request, res: Response) => {
  const { customer_id, origin, destination, travelMode = "DRIVE" } = req.body;

  // Os endereços de origem e destino recebidos não podem estar em branco. 
  // O id do usuário não pode estar em branco. 

  if (!customer_id || !origin || !destination) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description:
        "Os campos customer_id, origin e destination são obrigatórios.",
    });
  }

  //Os endereços de origem e destino não podem ser o mesmo endereço. 
  if(origin === destination) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "Os enderecos de partida e chegada nao podem ser iguais",
    })
  }

  try {
    const routeData = await mapsService.getRoute(origin.address, destination.address);

    return res.status(200).json({
      origin: routeData.origin,
      destination: routeData.destination,
      distance: routeData.routes[0].distanceMeters,
      duration: routeData.routes[0].duration,
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
