import { Request, Response } from "express";
import { geocodeAddress } from "../utils/geocoding";
import mapsService from "../services/mapsService";
import DRIVERS from "../data/drivers";
import { saveRide } from "../models/rideModel";
import {
  validateRideData,
  validateDriverAndDistance,
  validateCustomerId,
  validateDriverId,
} from "../utils/validators";
import { getRidesByCustomer } from "../models/rideModel";

/**
 * !Endpoint responsável por calcular uma corrida.
 * @param req Requisição recebida.
 * @param res Resposta enviada.
 */
export const estimateRide = async (req: Request, res: Response) => {
  const { customer_id, origin, destination } = req.body;

  // Validando os dados com a função validateRideData
  const validation = validateRideData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: validation.error,
    });
  }

  try {
    const originCoordinates = await geocodeAddress(origin);
    const destinationCoordinates = await geocodeAddress(destination);

    const routeData = await mapsService.getRoute(
      originCoordinates,
      destinationCoordinates
    );

    if (!routeData.routes || routeData.routes.length === 0) {
      return res.status(404).json({
        error_code: "ROUTE_NOT_FOUND",
        error_description:
          "Não foi possível calcular uma rota entre os endereços fornecidos.",
      });
    }

    const route = routeData.routes[0];
    const distanceKm = route.distanceMeters / 1000;

    const options = DRIVERS.filter((driver) => distanceKm >= driver.minKm)
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
      duration: route.duration,
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

/**
 * !Endpoint responsável por confirmar uma corrida.
 * @param req Requisição recebida.
 * @param res Resposta enviada.
 */
export const confirmRide = async (req: Request, res: Response) => {
  const {
    customer_id,
    origin,
    destination,
    distance,
    duration,
    driver,
    value,
  } = req.body;

  // Validação usando a função validateRideData para campos gerais
  const validation = validateRideData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: validation.error,
    });
  }

  // Validação do motorista e da distância
  const driverValidation = validateDriverAndDistance(driver, distance, DRIVERS);
  if (!driverValidation.isValid) {
    return res.status(404).json({
      error_code: "DRIVER_NOT_FOUND",
      error_description: driverValidation.error,
    });
  }

  try {
    // Salvar a viagem no banco de dados
    await saveRide({
      customer_id,
      origin,
      destination,
      distance,
      duration,
      driver_id: driver.id,
      driver_name: driver.name,
      value,
    });

    // Retorno de sucesso
    return res.status(200).json({
      success: true,
      description: "Operação realizada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao salvar a viagem no banco de dados:", error);
    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      error_description: "Erro ao salvar a viagem no banco de dados.",
    });
  }
};

/**
 * !Função para buscar as viagens de um cliente, com validações e filtragem por motorista.
 *
 * @param req - Objeto da requisição, contendo o parâmetro `customer_id` na URL e `driver_id` na query string (opcional).
 * @param res - Objeto da resposta, usado para retornar os dados ou erros.
 * @returns Retorna as viagens do cliente ou uma mensagem de erro.
 */

export const getRides = async (req: Request, res: Response) => {
  const { customer_id } = req.params; // Obtém o ID do cliente da URL
  const { driver_id } = req.query; // Obtém o parâmetro de consulta opcional

  // Validação 1: Verificar se o ID do cliente está presente usando a função do validators
  const customerValidation = validateCustomerId(customer_id);
  if (!customerValidation.isValid) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: customerValidation.error,
    });
  }

  // Validação 2: Se o driver_id for informado, verificar se é válido
  if (driver_id) {
    const driverValidation = validateDriverId(Number(driver_id), DRIVERS);
    if (!driverValidation.isValid) {
      return res.status(400).json({
        error_code: "INVALID_DRIVER",
        error_description: driverValidation.error,
      });
    }
  }

  try {
    // Busca as viagens no banco de dados com base no ID do cliente e, se necessário, no driver_id
    const rides = await getRidesByCustomer(
      customer_id,
      driver_id ? Number(driver_id) : undefined
    );

    // Validação 3: Verificar se existem viagens
    if (rides.length === 0) {
      return res.status(404).json({
        error_code: "NO_RIDES_FOUND",
        error_description:
          "Nenhuma viagem encontrada para o cliente informado.",
      });
    }

    // Responder com as viagens encontradas
    return res.status(200).json({
      customer_id,
      rides,
    });
  } catch (error) {
    // Tratamento de erro interno ao buscar viagens
    console.error("Erro ao buscar viagens:", error);
    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      error_description: "Erro ao buscar viagens no banco de dados.",
    });
  }
};

export default { estimateRide, confirmRide, getRides };
