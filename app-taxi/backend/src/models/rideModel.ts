import db from "../database/database";

export const saveRide = (ride: {
  customer_id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver_id: number;
  driver_name: string;
  value: number;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO rides (
        customer_id, origin, destination, distance, duration, driver_id, driver_name, value
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        ride.customer_id,
        ride.origin,
        ride.destination,
        ride.distance,
        ride.duration,
        ride.driver_id,
        ride.driver_name,
        ride.value,
      ],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

//! Função para buscar viagens no banco
export const getRidesByCustomer = async (
  customer_id: string,
  driver_id?: number
) => {
  let query = `
    SELECT 
      id, date, origin, destination, distance, duration, driver_id, driver_name, value 
    FROM rides 
    WHERE customer_id = ?
  `;

  const params: (string | number)[] = [customer_id];

  // Adicionando log para verificar o valor de customer_id
  console.log("Searching for rides with customer_id:", customer_id);

  if (driver_id) {
    query += " AND driver_id = ?";
    params.push(driver_id);
  }

  query += " ORDER BY date DESC";

  console.log("Executing query:", query);
  console.log("With parameters:", params);

  try {
    const rides = await new Promise<any[]>((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.error("Database error:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log("Rides found:", rides);

    return rides.map((ride) => ({
      id: ride.id,
      date: ride.date,
      origin: ride.origin,
      destination: ride.destination,
      distance: ride.distance,
      duration: ride.duration,
      driver: {
        id: ride.driver_id,
        name: ride.driver_name,
      },
      value: ride.value,
    }));
  } catch (error) {
    console.error("Error fetching rides:", error);
    throw error; // Re-throw to let the controller handle it
  }
};
