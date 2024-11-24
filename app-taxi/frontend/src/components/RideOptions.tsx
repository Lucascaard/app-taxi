import React from "react";

interface RideOptionsProps {
  options: {
    id: number;
    name: string;
    description: string;
    vehicle: string;
    review: {
      rating: number;
      comment: string;
    };
    value: number;
  }[];
  route: {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    polyline: {
      encodedPolyline: string;
    };
  };
  onSelectDriver: (driverId: number) => void;
}

const RideOptions: React.FC<RideOptionsProps> = ({ options, route, onSelectDriver }) => {
  const getMapUrl = () => {
    const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
    
    // Coordenadas de origem e destino
    const origin = `${route.origin.latitude},${route.origin.longitude}`;
    const destination = `${route.destination.latitude},${route.destination.longitude}`;
  
    // Codifica a polilinha, se necessário
    const path = `&path=enc:${encodeURIComponent(route.polyline.encodedPolyline)}`;
  
    // Marcadores para origem e destino
    const markers = `&markers=color:green|label:A|${encodeURIComponent(origin)}&markers=color:red|label:B|${encodeURIComponent(destination)}`;
  
    // Recupera a chave da API
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
    // Formata a URL
    const mapUrl = `${baseUrl}?size=600x400${markers}${path}&key=${apiKey}`;
    console.log("Generated Map URL:", mapUrl); // Verifique a URL gerada no console
  
    return mapUrl;
  };
  
  

  return (
    <div style={{ padding: "20px" }}>
      <h2>Opções de Viagem</h2>

      {/* Mapa estático com a rota */}
      <div>
        <img src={getMapUrl()} alt="Mapa da Rota" />
      </div>

      {/* Lista de motoristas */}
      <ul>
        {options.map((option) => (
          <li key={option.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
            <h3>{option.name}</h3>
            <p>{option.description}</p>
            <p><strong>Veículo:</strong> {option.vehicle}</p>
            <p><strong>Avaliação:</strong> {option.review.rating}/5</p>
            <p><strong>Comentário:</strong> {option.review.comment}</p>
            <p><strong>Valor:</strong> R$ {option.value.toFixed(2)}</p>
            <button onClick={() => onSelectDriver(option.id)}>Escolher</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RideOptions;
