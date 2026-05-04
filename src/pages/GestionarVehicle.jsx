// Importa hooks de React
import { useEffect, useState } from "react";

// Importa funciones del servicio de vehículos para interactuar con el backend
import {
  createVehicle,
  deleteVehicle,
  markVehicleAsSold,
  updateVehicle,
  getMyVehicles,
} from "../services/vehicleService";
// Importa hook de navegación de React Router
import { useNavigate } from "react-router-dom";

// Importa componentes reutilizables
import VehicleForm from "../components/Vehicles/VehicleForm";
import MyVehicleCard from "../components/Vehicles/MyVehicleCard";

// Componente principal para gestionar vehículos del usuario
function GestionarVehicle() {

  // Hook para navegar entre páginas
  const navigate = useNavigate();

  // Estado inicial del formulario
  const initialForm = {
    title: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    description: "",
    vehicleImage: [],
  };

  // Estado del formulario
  const [form, setForm] = useState(initialForm);

  // Lista de vehículos del usuario
  const [vehicles, setVehicles] = useState([]);

  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // Guarda el id del vehículo que se desea eliminar (para mostrar el cuadro)
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Estado para guardar el mensaje de error del formulario
  const [formErrorMsg, setFormErrorMsg] = useState("");

  // Estado para mostrar/ocultar el formulario
  const [showForm, setShowForm] = useState(false);

  // Resetea el formulario
  const resetForm = () => {
    setForm(initialForm);
    setEditingVehicleId(null);
    setFormErrorMsg("");
    setShowForm(false);
  };

  // Carga los vehículos del usuario desde el backend
  const loadVehicles = async () => {
    try {
      const data = await getMyVehicles();
      setVehicles(data.data || []);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  // Se ejecuta cuando se carga el componente
  useEffect(() => {
    // Obtiene el token de sesión
    const token = sessionStorage.getItem("token");

    // Si no hay token, redirige al login
    if (!token) {
      alert("Debes iniciar sesión para acceder a esta página.");
      navigate("/login");
      return;
    }

    // Carga los vehículos
    loadVehicles();
  }, [navigate]);

  // Maneja cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Si el campo es imagen, guarda los archivos
    if (name === "vehicleImage") {
      setForm({
        ...form,
        vehicleImage: files,
      });
    } else {
      // Para los demás campos guarda el valor normal
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // Valida los datos del formulario antes de enviarlos
  const validateForm = () => {
    setFormErrorMsg("");

    if (!form.title.trim()) {
      setFormErrorMsg("El título del vehículo es obligatorio.");
      return false;
    }

    if (!form.brand.trim()) {
      setFormErrorMsg("La marca del vehículo es obligatoria.");
      return false;
    }

    if (!form.model.trim()) {
      setFormErrorMsg("El modelo del vehículo es obligatorio.");
      return false;
    }

    if (!form.year) {
      setFormErrorMsg("El año del vehículo es obligatorio.");
      return false;
    }

    // Verifica que el año sea válido
    if (
      Number(form.year) < 1900 ||
      Number(form.year) > new Date().getFullYear()
    ) {
      setFormErrorMsg("Ingresa un año válido.");
      return false;
    }

    if (!form.price) {
      setFormErrorMsg("El precio del vehículo es obligatorio.");
      return false;
    }

    // Verifica que el precio sea mayor que 0
    if (Number(form.price) <= 0) {
      setFormErrorMsg("El precio debe ser mayor a 0.");
      return false;
    }

    if (!form.description.trim()) {
      setFormErrorMsg("La descripción del vehículo es obligatoria.");
      return false;
    }

    // Si se está creando un vehículo nuevo exige imagen
    if (!editingVehicleId && (!form.vehicleImage || form.vehicleImage.length === 0)) {
      setFormErrorMsg("Debes subir al menos una foto del vehículo.");
      return false;
    }

    return true;
  };

  // Construye el FormData para enviar datos y archivos al backend
  const buildFormData = () => {

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("brand", form.brand);
    formData.append("model", form.model);
    formData.append("year", form.year);
    formData.append("price", form.price);
    formData.append("description", form.description);

    // Agrega las imágenes al FormData
    if (form.vehicleImage && form.vehicleImage.length > 0) {
      for (let i = 0; i < form.vehicleImage.length; i++) {
        formData.append("vehicleImage", form.vehicleImage[i]);
      }
    }

    return formData;
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formData = buildFormData();

      // Si se está editando un vehículo
      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, formData);
        } else {
        // Si es un vehículo nuevo
        await createVehicle(formData);
        }

      // Limpia el formulario y recarga la lista
      resetForm();
      await loadVehicles();
    } catch (error) {
      console.error("Error al guardar vehículo:", error);

      const message =
        error?.response?.data?.message ||
        "Ocurrió un error al guardar el vehículo.";

      setFormErrorMsg(message);
    }
  };

  // Carga los datos de un vehículo en el formulario para editarlo
  const handleEdit = (vehicle) => {
    setFormErrorMsg("");
    setForm({
      title: vehicle.title || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      price: vehicle.price || "",
      description: vehicle.description || "",
      vehicleImage: [],
    });

    setEditingVehicleId(vehicle._id);
    setShowForm(true);

    // Hace scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Muestra el cuadro de confirmación para eliminar un vehículo
  const handleDelete = (id) => {
    setVehicleToDelete(id);
  };

  // Ejecuta la eliminación real del vehículo
  const executeDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      await deleteVehicle(vehicleToDelete);
      await loadVehicles();
      setVehicleToDelete(null);
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      alert(error.response?.data?.message || "Error al eliminar vehículo.");
      setVehicleToDelete(null);
    }
  };

  // Marca un vehículo como vendido
  const handleMarkAsSold = async (id) => {
    try {
      await markVehicleAsSold(id);
      await loadVehicles();
    } catch (error) {
      console.error("Error al marcar como vendido:", error);
      alert(
        error.response?.data?.message || "Error al marcar vehículo como vendido."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 relative">
      
      {/* Cuadro de confirmación en la esquina superior derecha */}
      {vehicleToDelete && (
        <div className="fixed top-6 right-6 z-50 w-80 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
          <h3 className="mb-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            Eliminar vehículo
          </h3>
          <p className="mb-5 text-sm text-slate-600 mt-2">
            ¿Seguro que deseas eliminar esta publicación?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setVehicleToDelete(null)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={executeDelete}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-red-200 transition hover:bg-red-700"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">
            Gestión de Vehículos
          </h1>
          <p className="mt-2 text-slate-600">
            Registra, edita y administra los vehículos publicados en tu cuenta.
          </p>
        </div>

        {/* Sección del Formulario o Botón */}
        {!showForm ? (
          <div className="mb-10">
            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
            >
              + Crear nuevo vehículo
            </button>
          </div>
        ) : (
          <VehicleForm
            form={form}
            editingVehicleId={editingVehicleId}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            errorMsg={formErrorMsg}
          />
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Vehículos registrados
            </h2>
            <p className="mt-1 text-slate-600">
              Administra tus publicaciones desde aquí.
            </p>
          </div>

          {/* Contador de vehículos */}
          <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow ring-1 ring-slate-200">
            {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"}
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow ring-1 ring-slate-200">
            No tienes vehículos registrados todavía.
          </div>
        ) : (

          // Lista de vehículos
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <MyVehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkAsSold={handleMarkAsSold}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionarVehicle;