import React, { useState } from "react";
import axios from "axios";
import RideOptions from "./RideOptions";

const RideRequestForm: React.FC = () => {
  const [customerId, setCustomerId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [responseData, setResponseData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/ride/estimate`, {
        customer_id: customerId,
        origin,
        destination,
      });

      setResponseData(response.data);
      setErrorMessage(""); // Limpa mensagens de erro anteriores
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error_description || "Erro ao estimar a viagem.");
    }
  };

  const handleSelectDriver = async (driverId: number) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/ride/confirm`, {
        customer_id: customerId,
        origin,
        destination,
        distance: responseData.distance,
        duration: responseData.duration,
        driver: { id: driverId, name: responseData.options.find((d: any) => d.id === driverId).name },
        value: responseData.options.find((d: any) => d.id === driverId).value,
      });

      alert("Viagem confirmada!");
      setResponseData(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error_description || "Erro ao confirmar a viagem.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {!responseData ? (
        <>
          <h2>Solicitar Viagem</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>ID do Cliente:</label>
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
        </>
      ) : (
        <RideOptions
          options={responseData.options}
          route={{
            origin: responseData.origin,
            destination: responseData.destination,
            polyline: responseData.routeResponse.routes[0].polyline.encodedPolyline,
          }}
          onSelectDriver={handleSelectDriver}
        />
      )}

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default RideRequestForm;
