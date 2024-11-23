export const validateRideData = (data: any): { isValid: boolean; error?: string } => {
    if (!data.customer_id) {
      return { isValid: false, error: "O ID do usuário é obrigatório." };
    }
    if (!data.origin || !data.destination) {
      return { isValid: false, error: "Os endereços de origem e destino não podem estar em branco." };
    }
    if (data.origin === data.destination) {
      return { isValid: false, error: "A origem e o destino não podem ser iguais." };
    }
    if (!data.driver || !data.driver.id || !data.driver.name) {
      return { isValid: false, error: "Uma opção de motorista válida deve ser informada." };
    }
    if (data.distance <= 0) {
      return { isValid: false, error: "A quilometragem deve ser um valor válido." };
    }
    return { isValid: true };
  };
  