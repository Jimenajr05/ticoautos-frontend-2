// Componente para mostrar una tarjeta de un vehículo del usuario
function MyVehicleCard({ vehicle, onEdit, onDelete, onMarkAsSold }) {
  // REST devuelve _id, GraphQL devuelve id
  const vehicleId = vehicle._id || vehicle.id;

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative">
        {vehicle.vehicleImage && vehicle.vehicleImage.length > 0 ? (
          <img
            src={`http://localhost:3000${vehicle.vehicleImage[0]}`}
            alt={vehicle.title}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-slate-200 text-slate-500">
            Sin imagen
          </div>
        )}

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-semibold shadow ${
            vehicle.status === "sold"
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {vehicle.status === "sold" ? "Vendido" : "Disponible"}
        </span>
      </div>

      <div className="p-6">
        <h3 className="mb-3 text-xl font-bold text-slate-900">
          {vehicle.title}
        </h3>

        <div className="space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-800">Marca:</span>{" "}
            {vehicle.brand}
          </p>

          <p>
            <span className="font-semibold text-slate-800">Modelo:</span>{" "}
            {vehicle.model}
          </p>

          <p>
            <span className="font-semibold text-slate-800">Año:</span>{" "}
            {vehicle.year}
          </p>

          <p>
            <span className="font-semibold text-slate-800">Precio:</span> ₡
            {Number(vehicle.price || 0).toLocaleString()}
          </p>

          <p className="line-clamp-3">
            <span className="font-semibold text-slate-800">Descripción:</span>{" "}
            {vehicle.description || "No disponible"}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => onEdit(vehicle)}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Editar
          </button>

          <button
            onClick={() => onDelete(vehicleId)}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Eliminar
          </button>

          {vehicle.status !== "sold" && (
            <button
              onClick={() => onMarkAsSold(vehicleId)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Marcar como vendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyVehicleCard;