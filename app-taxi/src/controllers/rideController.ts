import { Request, Response } from "express";
import { geocodeAddress } from "../utils/geocoding";
import mapsService from "../services/mapsService";
import DRIVERS from "../data/drivers";
import { saveRide } from "../models/rideModel";
import { validateRideData } from "../utils/validators";
import { getRidesByCustomer } from "../models/rideModel";

/**
 * !Endpoint responsável por calcular uma corrida.
 * @param req Requisição recebida.
 * @param res Resposta enviada.
 */
export const estimateRide = async (req: Request, res: Response) => {
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
  //! Desestrutura os dados do corpo da requisição
  const {
    customer_id,
    origin,
    destination,
    distance,
    duration,
    driver,
    value,
  } = req.body;

  //? Validação 1: Verificar se os campos obrigatórios estão preenchidos
  if (
    !customer_id ||
    !origin ||
    !destination ||
    !distance ||
    !duration ||
    !driver ||
    !value
  ) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "Todos os campos obrigatórios devem ser preenchidos.",
    });
  }

  //? Validação 2: Verificar se origem e destino são iguais
  if (origin === destination) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description:
        "Os endereços de origem e destino não podem ser os mesmos.",
    });
  }

  //? Validação 3: Verificar se o motorista informado é válido
  const driverData = DRIVERS.find((d) => d.id === driver.id);
  if (!driverData) {
    return res.status(404).json({
      error_code: "DRIVER_NOT_FOUND",
      error_description: "Motorista não encontrado.",
    });
  }

  //? Validação 4: Verificar se a distância é válida para o motorista selecionado
  if (distance < driverData.minKm) {
    return res.status(406).json({
      error_code: "INVALID_DISTANCE",
      error_description:
        "A distância informada é menor que a quilometragem mínima aceita pelo motorista.",
    });
  }

  try {
    //? Salvar a viagem no banco de dados
    await saveRide({
      customer_id,
      origin,
      destination,
      distance,
      duration,
      driver_id: driverData.id,
      driver_name: driverData.name,
      value,
    });

    //? Retorno de sucesso
    return res.status(200).json({
      success: true,
      Descrição: "Operação realizada com sucesso.",
    });
  } catch (error) {
    //! Tratamento de erro ao salvar no banco de dados
    console.error("Erro ao salvar a viagem no banco de dados:", error);
    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      error_description: "Erro ao salvar a viagem no banco de dados.",
    });
  }
};

//! Função para buscar viagens de um usuário, com validações e filtragem
export const getRides = async (req: Request, res: Response) => {
  const { customer_id } = req.params; // Obtém o ID do cliente da URL
  const { driver_id } = req.query; // Obtém o parâmetro de consulta opcional

  //? Validação 1: Verificar se o ID do cliente está presente
  if (!customer_id) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "O ID do cliente é obrigatório.",
    });
  }

  //? Validação 2: Se o driver_id for informado, verificar se é válido
  if (driver_id && !DRIVERS.find((d) => d.id === Number(driver_id))) {
    return res.status(400).json({
      error_code: "INVALID_DRIVER",
      error_description: "O ID do motorista informado é inválido.",
    });
  }

  try {
    //! Busca as viagens no banco de dados
    const rides = await getRidesByCustomer(
      customer_id,
      driver_id ? Number(driver_id) : undefined
    );

    //? Validação 3: Verificar se existem viagens
    if (rides.length === 0) {
      return res.status(404).json({
        error_code: "NO_RIDES_FOUND",
        error_description:
          "Nenhuma viagem encontrada para o cliente informado.",
      });
    }

    //! Responder com as viagens encontradas
    return res.status(200).json({
      customer_id,
      rides,
    });
  } catch (error) {
    //! Tratamento de erro interno
    console.error("Erro ao buscar viagens:", error);
    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      error_description: "Erro ao buscar viagens no banco de dados.",
    });
  }
};

export default { estimateRide, confirmRide, getRides };
