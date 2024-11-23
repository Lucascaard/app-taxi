export const validateRideData = (
  data: any
): { isValid: boolean; error?: string } => {
  if (!data.customer_id) {
    return { isValid: false, error: "O ID do usuário é obrigatório." };
  }
  if (!data.origin || !data.destination) {
    return {
      isValid: false,
      error: "Os endereços de origem e destino são obrigatorios!.",
    };
  }
  if (data.origin === data.destination) {
    return {
      isValid: false,
      error: "A origem e o destino não podem ser iguais.",
    };
  }
  return { isValid: true };
};

// Função para validar motorista específico e distância para o motorista no endpoint confirmRide
export const validateDriverAndDistance = (
  driver: { id: number; name: string },
  distance: number,
  drivers: Array<{ id: number; minKm: number }>
): { isValid: boolean; error?: string } => {
  const driverData = drivers.find((d) => d.id === driver.id);
  if (!driverData) {
    return {
      isValid: false,
      error: "Motorista não encontrado.",
    };
  }

  if (distance < driverData.minKm) {
    return {
      isValid: false,
      error:
        "A distância informada é menor que a quilometragem mínima aceita pelo motorista.",
    };
  }

  return { isValid: true };
};

export const validateCustomerId = (
  customer_id: string
): { isValid: boolean; error?: string } => {
  if (!customer_id) {
    return { isValid: false, error: "O ID do cliente é obrigatório." };
  }
  return { isValid: true };
};

export const validateDriverId = (
  driver_id: number,
  drivers: Array<{ id: number }>
): { isValid: boolean; error?: string } => {
  const driver = drivers.find((d) => d.id === driver_id);
  if (!driver) {
    return { isValid: false, error: "O ID do motorista informado é inválido." };
  }
  return { isValid: true };
};
