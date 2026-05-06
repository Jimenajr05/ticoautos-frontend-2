// Importa React
import React from 'react';

// Importa ReactDOM para renderizar la aplicación en el navegador
import ReactDOM from 'react-dom/client';

// Importa BrowserRouter para habilitar la navegación entre páginas
import { BrowserRouter } from 'react-router-dom';

// Importa el componente principal de la aplicación
import App from './App';

// Importa los estilos globales
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Renderiza la aplicación dentro del elemento con id "root"
ReactDOM.createRoot(document.getElementById('root')).render(

  // StrictMode ayuda a detectar problemas en la aplicación durante desarrollo
  <React.StrictMode>

    {/* Habilita el sistema de rutas en toda la aplicación */}
    <BrowserRouter>

    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
    
    </BrowserRouter>

  </React.StrictMode>
);