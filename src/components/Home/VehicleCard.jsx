// Importa el componente Link para navegar entre páginas
import { Link } from "react-router-dom";

// Componente que muestra una tarjeta de un vehículo en la lista pública
function VehicleCard({ vehicle }) {
    return (
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="relative">
                {vehicle.vehicleImage && vehicle.vehicleImage.length > 0 ? (
                    <img
                        src={`http://localhost:3000${vehicle.vehicleImage[0]}`}
                        alt={vehicle.title}
                        className="h-64 w-full object-cover"
                    />
                ) : (
                    <div className="flex h-64 items-center justify-center bg-slate-200 text-slate-500">
                        Sin imagen
                    </div>
                )}

                <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-semibold ${
                        vehicle.status === "sold"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                    }`}
                >
                    {vehicle.status === "sold" ? "Vendido" : "Disponible"}
                </span>
            </div>

            <div className="p-6">
                <div className="mb-4">
                    <h4 className="text-xl font-bold text-slate-900">
                        {vehicle.title}
                    </h4>

                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <div><span className="font-semibold">Marca:</span> {vehicle.brand}</div>
                        <div><span className="font-semibold">Modelo:</span> {vehicle.model}</div>
                        <div><span className="font-semibold">Año:</span> {vehicle.year}</div>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-2xl font-extrabold text-blue-600">
                        ₡{vehicle.price ? Number(vehicle.price).toLocaleString() : "0"}
                    </p>
                </div>

                <div className="mb-5 text-sm text-slate-600">
                    <p>
                        <span className="font-semibold">Propietario:</span>{" "}
                        {vehicle.user
                            ? `${vehicle.user.name || ""} ${vehicle.user.lastName || ""}`
                            : "No disponible"}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        to={`/vehicles/${vehicle._id}`}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
                    >
                        Ver detalle
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default VehicleCard;