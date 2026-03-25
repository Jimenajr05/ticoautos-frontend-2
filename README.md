# TicoAutos Frontend

Frontend del sistema **TicoAutos**, una aplicación web para la publicación, búsqueda y gestión de vehículos en venta.  
Permite a los usuarios registrarse, iniciar sesión, explorar vehículos disponibles, ver detalles, administrar sus publicaciones y comunicarse con otros usuarios mediante un chat de preguntas y respuestas.

Este proyecto fue desarrollado con **React**, **Vite**, **React Router**, **Axios** y **Tailwind CSS**.

---

## Tecnologías utilizadas

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- JavaScript
- HTML5
- CSS3

---

## Instalación de dependencias
Durante el desarrollo del proyecto se instalaron las siguientes dependencias:

- npm create vite@latest .
- npm install axios
- npm install react-router-dom
- npm install -D tailwindcss @tailwindcss/vite

---

## Estructura del proyecto

``` 
ticoautos-frontend
│
├── public
│
├── src
│   ├── assets
│   │
│   ├── components
│   │   ├── Home
│   │   │   ├── HeroSection.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── VehicleCard.jsx
│   │   │   └── VehicleFilters.jsx
│   │   │
│   │   ├── Vehicles
│   │   │   ├── MyVehicleCard.jsx
│   │   │   └── VehicleForm.jsx
│   │   │
│   │   └── Navbar.jsx
│   │
│   ├── pages
│   │   ├── Chat.jsx
│   │   ├── GestionarVehicle.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── PublicHome.jsx
│   │   ├── Register.jsx
│   │   └── VehicleDetail.jsx
│   │
│   ├── services
│   │   ├── authService.js
│   │   ├── questionService.js
│   │   └── vehicleService.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

# Instalación y ejecución

1. Clonar el repositorio

```
git clone https://github.com/Jimenajr05/ticoautos-frontend
```

2. Entrar a la carpeta del proyecto

```
cd ticoautos-frontend
```

3. Instalar dependencias

```
npm install
```

4. Ejecutar el proyecto en desarrollo

```
npm run dev
```

El proyecto se ejecutará normalmente en:

```
http://localhost:5173
```

---

# Conexión con el backend

Este frontend consume el backend mediante Axios usando rutas como:

```
http://localhost:3000/api/auth
http://localhost:3000/api/vehicles
http://localhost:3000/api/questions
```

Por lo tanto, el backend debe estar ejecutándose en:

```
http://localhost:3000
```

---

# Funcionalidades principales

1. Autenticación

- Registro de usuario
- Inicio de sesión
- Persistencia del token en sessionStorage
- Persistencia de la información básica del usuario en sessionStorage

2. Gestión de vehículos

- Crear vehículo
- Editar vehículo
- Eliminar vehículo
- Marcar vehículo como vendido
- Ver lista de vehículos propios

3. Búsqueda y filtrado

- Filtrar por marca
- Filtrar por modelo
- Filtrar por año mínimo y máximo
- Filtrar por precio mínimo y máximo
- Filtrar por estado del vehículo
- Paginación de resultados

4. Detalle del vehículo

- Visualización de información completa del vehículo
- Información del propietario
- Estado del vehículo
- Copia de enlace público
- Navegación al chat con el vendedor

5. Chat entre usuarios

- Enviar preguntas sobre un vehículo
- Responder preguntas como propietario
- Ver conversaciones activas
- Eliminar conversaciones
- Restricción para evitar que el dueño se escriba a sí mismo
- Restricción para que el comprador espere respuesta antes de enviar otra pregunta

---

# Componentes principales
- Navbar.jsx
- HeroSection.jsx
- VehicleFilters.jsx
- VehicleCard.jsx
- Pagination.jsx
- VehicleForm.jsx
- MyVehicleCard.jsx

---

# Páginas principales
- PublicHome.jsx
- Home.jsx
- Login.jsx
- Register.jsx
- GestionarVehicle.jsx
- VehicleDetail.jsx
- Chat.jsx

---

# Servicios

- authService.js
- vehicleService.js
- questionService.js

---

# Manejo de sesión

La aplicación utiliza sessionStorage para guardar:

- token
- user

Esto permite mantener la sesión activa mientras el navegador permanezca abierto.

Ejemplo:

```
sessionStorage.setItem("token", data.token);
sessionStorage.setItem("user", JSON.stringify(data.user));
```

---

# Diseño de interfaz

El proyecto utiliza Tailwind CSS para construir la interfaz

--- 

# Dependencias principales

## Dependencias

- axios
- react
- react-dom
- react-router-dom

## Dependencias de desarrollo

- vite
- @vitejs/plugin-react
- tailwindcss
- @tailwindcss/vite
- eslint

---

# Requisitos para funcionar correctamente

- Node.js instalado
- npm instalado
- Backend de TicoAutos corriendo en http://localhost:3000
- MongoDB funcionando desde el backend
- Navegador web 

---

# Autoras

- María Paz Ugalde Araya
- María Jimena Jara Rojas