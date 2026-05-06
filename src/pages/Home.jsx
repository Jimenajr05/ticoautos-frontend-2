// Importa hooks de React
import { useEffect, useState } from "react";

// Importa navegación de React Router
import { useNavigate } from "react-router-dom";

// Importa el servicio para obtener vehículos desde el backend
import { getVehiclesAuth } from "../services/vehicleService";

// Importa componentes de la página principal
import VehicleFilters from "../components/Home/VehicleFilters";
import VehicleCard from "../components/Home/VehicleCard";
import Pagination from "../components/Home/Pagination";

// Componente principal de la página Home
function Home() {
  // Hook para redireccionar entre páginas
  const navigate = useNavigate();

  // Estado para guardar los vehículos obtenidos del backend
  const [vehicles, setVehicles] = useState([]);

  // Estado para controlar la carga de datos
  const [loading, setLoading] = useState(true);

  // Estado para manejar la paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVehicles: 0,
  });

  // Estado para guardar los filtros actuales
  const [currentFilters, setCurrentFilters] = useState({});

  // Función para cargar los vehículos con filtros y paginación
  const loadVehicles = async (filters = currentFilters, page = 1) => {
    try {
      // Activa el estado de carga
      setLoading(true);

      // Combina filtros con paginación
      const finalFilters = { ...filters, page, limit: 6 };

      // Llama al servicio de vehículos
      const data = await getVehiclesAuth(finalFilters);

      // Guarda los vehículos obtenidos
      const vehiclesData = data.data || [];
      setVehicles(vehiclesData);

      // Actualiza la información de paginación
      setPagination({
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || 1,
        totalVehicles: data.totalVehicles || vehiclesData.length,
      });

      // Guarda los filtros actuales
      setCurrentFilters(filters);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);

      // Si ocurre un error limpia la lista
      setVehicles([]);

      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalVehicles: 0,
      });
    } finally {
      // Finaliza el estado de carga
      setLoading(false);
    }
  };

  // Se ejecuta cuando se carga el componente
  useEffect(() => {
    // Obtiene el token de sesión
    const token = sessionStorage.getItem("token");

    // Si no hay sesión redirige al login
    if (!token) {
      navigate("/login");
      return;
    }

    // Carga los vehículos al iniciar la página
    loadVehicles({}, 1);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Vehículos en venta
          </h1>

          <p className="mt-2 text-slate-600">
            Explora los autos disponibles y encuentra el que más te interese.
          </p>
        </div>

        <VehicleFilters onFilter={(filters) => loadVehicles(filters, 1)} />

        <div className="mb-6 flex justify-end">
          <span className="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-600 shadow ring-1 ring-slate-200">
            {pagination.totalVehicles} resultados
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-600">
            Cargando vehículos...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow">
            No se encontraron vehículos con esos filtros.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id || vehicle._id}
                  vehicle={vehicle}
                />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={(page) => loadVehicles(currentFilters, page)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Home;