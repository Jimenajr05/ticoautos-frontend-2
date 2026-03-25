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

  // Guarda el id del vehículo que se está editando
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // Resetea el formulario
  const resetForm = () => {
    setForm(initialForm);
    setEditingVehicleId(null);
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
    if (!form.title.trim()) {
      alert("El título del vehículo es obligatorio.");
      return false;
    }

    if (!form.brand.trim()) {
      alert("La marca del vehículo es obligatoria.");
      return false;
    }

    if (!form.model.trim()) {
      alert("El modelo del vehículo es obligatorio.");
      return false;
    }

    if (!form.year) {
      alert("El año del vehículo es obligatorio.");
      return false;
    }

    // Verifica que el año sea válido
    if (
      Number(form.year) < 1900 ||
      Number(form.year) > new Date().getFullYear()
    ) {
      alert("Ingresa un año válido.");
      return false;
    }

    if (!form.price) {
      alert("El precio del vehículo es obligatorio.");
      return false;
    }

    // Verifica que el precio sea mayor que 0
    if (Number(form.price) <= 0) {
      alert("El precio debe ser mayor a 0.");
      return false;
    }

    if (!form.description.trim()) {
      alert("La descripción del vehículo es obligatoria.");
      return false;
    }

    // Si se está creando un vehículo nuevo exige imagen
    if (!editingVehicleId && (!form.vehicleImage || form.vehicleImage.length === 0)) {
      alert("Debes subir al menos una foto del vehículo.");
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
        alert("Vehículo actualizado correctamente.");
      } else {
        // Si es un vehículo nuevo
        await createVehicle(formData);
        alert("Vehículo creado correctamente.");
      }

      // Limpia el formulario y recarga la lista
      resetForm();
      await loadVehicles();
    } catch (error) {
      console.error("Error al guardar vehículo:", error);

      const message =
        error?.response?.data?.message ||
        "Ocurrió un error al guardar el vehículo.";

      alert(message);
    }
  };

  // Carga los datos de un vehículo en el formulario para editarlo
  const handleEdit = (vehicle) => {
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

    // Hace scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Elimina un vehículo
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este vehículo?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVehicle(id);
      alert("Vehículo eliminado correctamente.");
      await loadVehicles();
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      alert(error.response?.data?.message || "Error al eliminar vehículo.");
    }
  };

  // Marca un vehículo como vendido
  const handleMarkAsSold = async (id) => {
    try {
      await markVehicleAsSold(id);
      alert("Vehículo marcado como vendido.");
      await loadVehicles();
    } catch (error) {
      console.error("Error al marcar como vendido:", error);
      alert(
        error.response?.data?.message || "Error al marcar vehículo como vendido."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">
            Gestión de Vehículos
          </h1>
          <p className="mt-2 text-slate-600">
            Registra, edita y administra los vehículos publicados en tu cuenta.
          </p>
        </div>

        {/* Formulario de vehículo */}
        <VehicleForm
          form={form}
          editingVehicleId={editingVehicleId}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />

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