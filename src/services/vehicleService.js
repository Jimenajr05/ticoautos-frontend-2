import axios from "axios";

const API_URL = "http://localhost:3000/api/vehicles";
const GRAPHQL_URL = "http://localhost:5001/graphql";

const getToken = () => sessionStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getToken();

  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const getGraphQLHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Aplica filtros y paginación en el frontend
const applyFiltersAndPagination = (vehicles, filters = {}) => {
  let result = [...vehicles];

  const brand = filters.brand || filters.marca || "";
  const model = filters.model || filters.modelo || "";
  const minYear = filters.minYear || filters.yearMin || filters.anno_min || filters.year_min || "";
  const maxYear = filters.maxYear || filters.yearMax || filters.anno_max || filters.year_max || "";
  const minPrice = filters.minPrice || filters.priceMin || filters.precio_min || filters.price_min || "";
  const maxPrice = filters.maxPrice || filters.priceMax || filters.precio_max || filters.price_max || "";
  const status = filters.status || filters.estado || "";
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 6;

  if (brand) {
    result = result.filter((vehicle) =>
      vehicle.brand?.toLowerCase().includes(brand.toLowerCase())
    );
  }

  if (model) {
    result = result.filter((vehicle) =>
      vehicle.model?.toLowerCase().includes(model.toLowerCase())
    );
  }

  if (minYear) {
    result = result.filter((vehicle) => Number(vehicle.year) >= Number(minYear));
  }

  if (maxYear) {
    result = result.filter((vehicle) => Number(vehicle.year) <= Number(maxYear));
  }

  if (minPrice) {
    result = result.filter((vehicle) => Number(vehicle.price) >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter((vehicle) => Number(vehicle.price) <= Number(maxPrice));
  }

  if (status) {
    const normalizedStatus = status.toLowerCase();

    result = result.filter((vehicle) => {
      const vehicleStatus = vehicle.status?.toLowerCase();

      return (
        vehicleStatus === normalizedStatus ||
        (normalizedStatus === "disponible" && vehicleStatus === "available") ||
        (normalizedStatus === "vendido" && vehicleStatus === "sold") ||
        (normalizedStatus === "available" && vehicleStatus === "available") ||
        (normalizedStatus === "sold" && vehicleStatus === "sold")
      );
    });
  }

  const totalVehicles = result.length;
  const totalPages = Math.ceil(totalVehicles / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedVehicles = result.slice(startIndex, startIndex + limit);

  return {
    data: paginatedVehicles,
    currentPage: page,
    totalPages,
    totalVehicles,
  };
};

// GraphQL público: para PublicHome
export const getVehicles = async (filters = {}) => {
  const query = `
    query {
      getAllVehicles {
        id
        title
        brand
        model
        year
        price
        description
        status
        vehicleImage
        user
        createdAt
        updatedAt
      }
    }
  `;

  const response = await axios.post(
    GRAPHQL_URL,
    { query },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  const vehicles = response.data.data.getAllVehicles || [];

  return applyFiltersAndPagination(vehicles, filters);
};

// GraphQL protegido: para Home
export const getVehiclesAuth = async (filters = {}) => {
  const query = `
    query {
      getAllVehiclesAuth {
        id
        title
        brand
        model
        year
        price
        description
        status
        vehicleImage
        user
        createdAt
        updatedAt
      }
    }
  `;

  const response = await axios.post(
    GRAPHQL_URL,
    { query },
    {
      headers: getGraphQLHeaders(),
    }
  );

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  const vehicles = response.data.data.getAllVehiclesAuth || [];

  return applyFiltersAndPagination(vehicles, filters);
};

// GraphQL: obtener vehículo por ID
export const getVehicleById = async (id) => {
  if (!id || id === "undefined" || id === "null") {
    throw new Error("ID de vehículo inválido.");
  }

  const query = `
    query GetVehicle($id: ID!) {
      getVehicle(id: $id) {
        id
        title
        brand
        model
        year
        price
        description
        status
        vehicleImage
        user
        createdAt
        updatedAt
      }
    }
  `;

  const response = await axios.post(
    GRAPHQL_URL,
    {
      query,
      variables: { id },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  return {
    data: response.data.data.getVehicle,
  };
};

// REST: obtener solo los vehículos del usuario autenticado
export const getMyVehicles = async () => {
  const response = await axios.get(`${API_URL}/my-vehicles`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// REST: crear vehículo
export const createVehicle = async (vehicleData) => {
  const response = await axios.post(API_URL, vehicleData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// REST: actualizar vehículo
export const updateVehicle = async (id, vehicleData) => {
  const response = await axios.put(`${API_URL}/${id}`, vehicleData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// REST: eliminar vehículo
export const deleteVehicle = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// REST: marcar vehículo como vendido
export const markVehicleAsSold = async (id) => {
  const response = await axios.patch(
    `${API_URL}/${id}/sold`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};