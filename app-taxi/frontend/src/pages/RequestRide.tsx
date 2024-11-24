import React, { useState } from "react";
import axios from "axios";

const RequestRide: React.FC = () => {
  // Estados para armazenar os valores do formulário
  const [customerId, setCustomerId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar mensagens de erro e resposta
    setError(null);
    setResponse(null);

    try {
      // Fazer a requisição à API
      const res = await axios.post(
        
        `${process.env.REACT_APP_API_URL}/ride/estimate`,
        {
          customer_id: customerId,
          origin,
          destination,
        }
      );

      console.log("API URL:", process.env.REACT_APP_API_URL);

      setResponse(res.data); // Armazenar a resposta no estado
    } catch (err: any) {
      setError(err.response?.data?.error_description || "Erro ao estimar viagem.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Solicitação de Viagem</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID do Usuário:</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Origem:</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Destino:</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <button type="submit">Estimar Viagem</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {response && (
        <div>
          <h2>Resposta da API:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RequestRide;
