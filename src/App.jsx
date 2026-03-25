// Importa los componentes de enrutamiento de React Router
import { Routes, Route } from "react-router-dom";

// Importa las páginas de la aplicación
import Register from "./pages/Register";
import Login from "./pages/Login";
import GestionarVehicle from "./pages/GestionarVehicle";
import Home from "./pages/Home";
import PublicHome from "./pages/PublicHome";
import VehicleDetail from "./pages/VehicleDetail";
import Chat from "./pages/Chat";

// Importa el componente de navegación
import Navbar from "./components/Navbar";

// Componente principal de la aplicación
function App() {
  return (

    // Contenedor principal de la aplicación
    <div className="min-h-screen bg-slate-100">

      {/* Barra de navegación visible en todas las páginas */}
      <Navbar />

      {/* Contenedor donde se renderizan las páginas */}
      <div className="p-6">

        <Routes>

          {/* Página pública principal */}
          <Route path="/" element={<PublicHome />} />

          {/* Página principal para usuarios autenticados */}
          <Route path="/home" element={<Home />} />

          {/* Página de inicio de sesión */}
          <Route path="/login" element={<Login />} />

          {/* Página de registro */}
          <Route path="/register" element={<Register />} />

          {/* Página para gestionar los vehículos del usuario */}
          <Route path="/mis-vehiculos" element={<GestionarVehicle />} />

          {/* Página de detalle de un vehículo */}
          <Route path="/vehicles/:id" element={<VehicleDetail />} />

          {/* Página de chat entre usuarios */}
          <Route path="/chat" element={<Chat />} />

        </Routes>

      </div>
    </div>
  );
}

// Exporta el componente principal
export default App;