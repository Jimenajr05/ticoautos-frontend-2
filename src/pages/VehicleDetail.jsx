// Importa hooks de React
import { useEffect, useState } from "react";

// Importa herramientas de React Router
import { useParams, Link, useNavigate } from "react-router-dom";

// Importa el servicio para obtener un vehículo por id
import { getVehicleById } from "../services/vehicleService";

// Componente para mostrar el detalle de un vehículo
function VehicleDetail() {
  // Obtiene el id del vehículo desde la URL
  const { id } = useParams();

  // Hook para navegar entre páginas
  const navigate = useNavigate();

  // Estado para guardar la información del vehículo
  const [vehicle, setVehicle] = useState(null);

  // Estado para controlar la carga
  const [loading, setLoading] = useState(true);

  // Estado para mostrar mensaje cuando se copia el enlace
  const [copied, setCopied] = useState(false);

  // Estado para mostrar mensajes de error
  const [errorMsg, setErrorMsg] = useState("");

  // Construye la URL pública del vehículo
  const shareUrl = `${window.location.origin}/vehicles/${id}`;

  // Función para cargar el vehículo desde GraphQL
  const loadVehicle = async () => {
    try {
      setLoading(true);

      const data = await getVehicleById(id);

      // getVehicleById devuelve { data: vehiculo }
      setVehicle(data.data);
    } catch (error) {
      console.error("Error al cargar el detalle del vehículo:", error);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta cuando cambia el id del vehículo
  useEffect(() => {
    loadVehicle();
  }, [id]);

  // Copia el enlace del vehículo al portapapeles
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error al copiar el enlace:", error);
      setErrorMsg("No se pudo copiar el enlace.");
    }
  };

  // Maneja el botón para mostrar interés en el vehículo
  const handleInterestClick = () => {
    setErrorMsg("");
    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!token || !user) {
      setErrorMsg("Debes iniciar sesión para contactar al vendedor.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // GraphQL puede traer user como string o como objeto
    const ownerId =
      vehicle.user?._id ||
      vehicle.usuario?._id ||
      vehicle.user ||
      vehicle.usuario;

    if (user._id === ownerId || user.id === ownerId) {
      setErrorMsg("No puedes iniciar un chat con tu propio vehículo.");
      return;
    }

    // GraphQL devuelve id, REST puede devolver _id
    const vehicleRealId = vehicle._id || vehicle.id;

    navigate(`/chat?vehicleId=${vehicleRealId}&askedBy=${user._id || user.id}`);
  };

  // Vista mientras carga la información
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
          <p className="text-center text-slate-600">
            Cargando detalle del vehículo...
          </p>
        </div>
      </div>
    );
  }

  // Vista si no se encuentra el vehículo
  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow">
          <h2 className="text-2xl font-bold text-slate-800">
            Vehículo no encontrado
          </h2>

          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Verifica si el usuario del vehículo viene como objeto o solo como ID
  const ownerIsObject = typeof vehicle.user === "object" && vehicle.user !== null;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-block rounded-xl bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
          >
            ← Volver
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
            {vehicle.vehicleImage && vehicle.vehicleImage.length > 0 ? (
              <img
                src={`http://localhost:3000${vehicle.vehicleImage[0]}`}
                alt={vehicle.title}
                className="h-[420px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center bg-slate-200 text-slate-500">
                Sin imagen
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900">
                {vehicle.title}
              </h1>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  vehicle.status === "sold"
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {vehicle.status === "sold" ? "Vendido" : "Disponible"}
              </span>
            </div>

            <p className="mb-6 text-3xl font-extrabold text-blue-600">
              ₡{Number(vehicle.price).toLocaleString()}
            </p>

            <div className="space-y-3 text-slate-700">
              <p>
                <span className="font-semibold">Marca:</span> {vehicle.brand}
              </p>

              <p>
                <span className="font-semibold">Modelo:</span> {vehicle.model}
              </p>

              <p>
                <span className="font-semibold">Año:</span> {vehicle.year}
              </p>

              <p>
                <span className="font-semibold">Estado:</span>{" "}
                {vehicle.status === "sold" ? "Vendido" : "Disponible"}
              </p>

              <p>
                <span className="font-semibold">Descripción:</span>{" "}
                {vehicle.description || "No disponible"}
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-bold text-slate-800">
                Información del propietario
              </h2>

              {ownerIsObject ? (
                <div className="flex items-center gap-4">
                  {vehicle.user?.profileImage ? (
                    <img
                      src={`http://localhost:3000${vehicle.user.profileImage}`}
                      alt={vehicle.user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 font-bold text-slate-700">
                      {vehicle.user?.name?.charAt(0) || "U"}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-slate-900">
                      {vehicle.user?.name} {vehicle.user?.lastName}
                    </p>

                    <p className="text-sm text-slate-500">
                      Propietario del vehículo
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 font-bold text-slate-700">
                    U
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      Propietario registrado
                    </p>

                    <p className="text-sm text-slate-500">
                      Información cargada mediante GraphQL
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleInterestClick}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
              >
                ¿Te interesa este vehículo?
              </button>

              {errorMsg && (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-bold text-slate-800">
                Compartir vehículo
              </h2>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none"
                />

                <button
                  onClick={handleCopyLink}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Copiar enlace
                </button>
              </div>

              {copied && (
                <p className="mt-3 text-sm font-medium text-green-600">
                  Enlace copiado correctamente.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetail;