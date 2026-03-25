import axios from "axios";

const API_URL = "http://localhost:3000/api/vehicles";

// Obtener todos los vehículos con filtro
export const getVehicles = async (filters = {}) => {
  const token = sessionStorage.getItem("token");

  const response = await axios.get(API_URL, {
    params: filters,
    headers: 
    {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

//Obtener solo los vehículos del usuario autenticado
export const getMyVehicles = async () => {
  const token = sessionStorage.getItem("token");

  const response = await axios.get(`${API_URL}/my-vehicles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

//Obtener Vehiculo por ID
export const getVehicleById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};


// Crear vehículo
export const createVehicle = async (vehicleData) => {
  const token = sessionStorage.getItem("token");

  const response = await axios.post(API_URL, vehicleData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Actualizar vehículo
export const updateVehicle = async (id, vehicleData) => {
  const token = sessionStorage.getItem("token");

  const response = await axios.put(`${API_URL}/${id}`, vehicleData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Eliminar vehículo
export const deleteVehicle = async (id) => {
  const token = sessionStorage.getItem("token");

  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Marcar vehículo como vendido
export const markVehicleAsSold = async (id) => {
  const token = sessionStorage.getItem("token");

  const response = await axios.patch(
    `${API_URL}/${id}/sold`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};