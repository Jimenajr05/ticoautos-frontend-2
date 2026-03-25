// Componente formulario para crear o editar vehículos
function VehicleForm({
  form,
  editingVehicleId,
  onChange,
  onSubmit,
  onCancel,
}) {
  const inputClass =
    "rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white";

  return (
    <div className="mb-12 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {editingVehicleId ? "Editar vehículo" : "Registrar vehículo"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Completa la información del vehículo para publicarlo.
          </p>
        </div>

        {editingVehicleId && (
          <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
            Modo edición
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={form.title}
            onChange={onChange}
            className={inputClass}
          />

          <input
            type="text"
            name="brand"
            placeholder="Marca"
            value={form.brand}
            onChange={onChange}
            className={inputClass}
          />

          <input
            type="text"
            name="model"
            placeholder="Modelo"
            value={form.model}
            onChange={onChange}
            className={inputClass}
          />

          <input
            type="number"
            name="year"
            placeholder="Año"
            value={form.year}
            onChange={onChange}
            className={inputClass}
          />

          <input
            type="number"
            name="price"
            placeholder="Precio"
            value={form.price}
            onChange={onChange}
            className={inputClass}
          />

          <div className="rounded-xl border border-slate-300 bg-white px-4 py-2">
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Fotos del vehículo
            </label>

            <input
              type="file"
              name="vehicleImage"
              multiple
              onChange={onChange}
              className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
            />
          </div>
        </div>

        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={onChange}
          rows="4"
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
          >
            {editingVehicleId ? "Actualizar vehículo" : "Crear vehículo"}
          </button>

          {editingVehicleId && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl bg-slate-200 px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default VehicleForm;