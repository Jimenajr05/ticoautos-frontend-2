// Importa la función para definir la configuración de Vite
import { defineConfig } from 'vite'

// Importa el plugin de React para que Vite pueda trabajar con React
import react from '@vitejs/plugin-react'

// Importa el plugin de TailwindCSS para usar Tailwind en el proyecto
import tailwindcss from '@tailwindcss/vite'

// Configuración de Vite
export default defineConfig({

  // Lista de plugins que se utilizarán en el proyecto
  plugins: [

    // Habilita soporte para React
    react(),

    // Habilita TailwindCSS
    tailwindcss()

  ],

})