import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import GestionarVehicle from "./pages/GestionarVehicle";
import Home from "./pages/Home";
import PublicHome from "./pages/PublicHome";
import VehicleDetail from "./pages/VehicleDetail";
import Chat from "./pages/Chat";
import Verify2FA from "./pages/Verify2FA";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="p-6">
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verificar-2fa" element={<Verify2FA />} />
          <Route path="/mis-vehiculos" element={<GestionarVehicle />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;