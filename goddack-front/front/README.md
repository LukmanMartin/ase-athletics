# ASE Athletics — Plataforma de Análisis de Fútbol

## Demo en Vivo

- **Frontend:** https://ase-athletics.vercel.app
- **Backend API:** https://ase-athletics.onrender.com/api

### Credenciales de demo
| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | lukman.o992@gmail.com | Lukman |
| Scout | lukman1@gmail.com | Lukman1 |

---

## Resumen del Proyecto

Goddack Analítica es una plataforma web completa para ojeadores y entrenadores de fútbol. Permite gestionar bases de datos de jugadores con estadísticas completas, visualizar tendencias de rendimiento a través de paneles interactivos, comparar jugadores lado a lado y generar informes de scouting estructurados.

---

## Stack Tecnológico

### Frontend
- **Framework:** React.js con React Router v6
- **Gestión de estado:** Context API (AuthContext, CompareContext)
- **Gráficos:** Recharts
- **Exportación PDF:** @react-pdf/renderer
- **Estilos:** CSS personalizado siguiendo ui_guidelines.json
- **HTTP:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Base de datos:** MongoDB Atlas con Mongoose
- **Autenticación:** JWT + Bcrypt
- **Validación:** Joi
- **CORS:** Habilitado para comunicación con el frontend

---

## Estructura del Proyecto

```
ase-athletics/
├── goddack-frontend/          # Aplicación React
│   └── src/
│       ├── pages/
│       │   ├── Home/          # Lista y búsqueda de jugadores
│       │   ├── Dashboard/     # Panel de análisis con gráficos
│       │   ├── PerfilPlayer/  # Perfil detallado del jugador (8 tabs)
│       │   ├── Reports/       # Informes de scouting
│       │   ├── NewPlayer/     # Crear jugador
│       │   ├── EditPlayer/    # Editar jugador
│       │   ├── Comparar/      # Comparación de jugadores
│       │   ├── Admin/         # Panel de administración
│       │   ├── Login/
│       │   └── Register/
│       ├── components/
│       │   ├── Header/
│       │   ├── CardPlayer/
│       │   ├── PlayerForm/    # Formulario de 17 secciones
│       │   ├── PlayerFilters/
│       │   ├── PlayerGrid/
│       │   ├── CompareBar/
│       │   ├── ConfirmModal/
│       │   ├── PDF/           # Plantillas PDF (PlayerPDF, ReportPDF)
│       │   └── ProtectedRoute/
│       ├── context/           # AuthContext, CompareContext
│       ├── api/               # Configuración Axios
│       └── utils/
│
└── goddack-backend/           # API REST Node.js
    ├── index.js               # Punto de entrada (listen)
    ├── app.js                 # Configuración Express (sin listen)
    ├── src/
    │   ├── api/
    │   │   ├── controllers/   # playerController, reportController,
    │   │   │                  # dashboardController, userController,
    │   │   │                  # authController
    │   │   ├── models/        # Player, ScoutingReport, User
    │   │   └── routes/        # playerRoutes, reportRoutes,
    │   │                      # dashboardRoutes, userRoutes, adminRoutes
    │   ├── middlewares/       # auth.js, roleAuth.js, validator.js
    │   └── utils/             # database.js, token-action.js, error.js
    ├── data/                  # JSONs de datos originales de ASE
    │   ├── players_Data_production.json
    │   ├── player_statistics_detailed.json
    │   └── scout_report.json
    └── seeds/
        └── seed.js            # Script de siembra de datos
```

---

## Configuración Local

### Requisitos previos
- Node.js v16 o superior
- Cuenta en MongoDB Atlas (o instancia local de MongoDB)
- Git

### Backend

```bash
# 1. Clonar el repositorio
git clone [url-del-repo]
cd goddack-backend

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

Contenido del `.env`:
```env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<dbname>?appName=<appName>
JWT_SECRET=tu_secreto_jwt_aqui
PORT=5000
```

```bash
# 4. Sembrar la base de datos con los datos de ASE Athletics
npm run seed

# 5. Iniciar el servidor de desarrollo
npm run dev
# Servidor en http://localhost:5000
```

### Frontend

```bash
cd goddack-frontend

# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Establecer la URL del backend
```

Contenido del `.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
# 3. Iniciar el servidor de desarrollo
npm run dev
# Aplicación en http://localhost:5173
```

---

## Siembra de Datos (Seed)

El script de siembra carga automáticamente los 79 jugadores del archivo `players_Data_production.json` y los 13 jugadores detallados de `player_statistics_detailed.json` en la base de datos.

```bash
npm run seed
```

Este comando:
- Limpia las colecciones existentes de jugadores
- Carga todos los perfiles de `players_Data_production.json` (79 jugadores)
- Carga los perfiles detallados de `player_statistics_detailed.json` (13 jugadores)
- Asigna IDs incrementales automáticamente

---

## Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de nuevo usuario |
| POST | `/api/auth/login` | Login y obtención de token JWT |

### Jugadores
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/players` | Lista paginada con filtros (position, team, nationality, age, marketValue, goals, assists) |
| GET | `/api/players/:id` | Perfil completo del jugador + sus informes |
| GET | `/api/players/search?q=` | Búsqueda por nombre |
| POST | `/api/players` | Crear nuevo jugador |
| PUT | `/api/players/:id` | Actualizar jugador |
| DELETE | `/api/players/:id` | Eliminar jugador y sus informes |

### Informes de Scouting
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reports` | Lista todos los informes |
| GET | `/api/reports/:id` | Informe individual |
| GET | `/api/reports/player/:playerId` | Informes de un jugador concreto |
| POST | `/api/reports` | Crear informe (actualiza perfil del jugador) |
| PUT | `/api/reports/:id` | Editar informe (solo propietario o admin) |
| DELETE | `/api/reports/:id` | Eliminar informe (solo propietario o admin) |

### Dashboard
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | KPIs, 7 gráficos, radar de atributos, filtros |

### Administración (solo admin)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Lista de usuarios con conteo de informes |
| GET | `/api/users/stats` | Estadísticas de uso (informes por scout, por mes, jugadores más analizados) |
| PUT | `/api/users/:id/role` | Cambiar rol de usuario (scout/admin) |
| DELETE | `/api/users/:id` | Eliminar usuario |

---

## Esquema de Base de Datos

### Player
Perfil completo del jugador incluyendo: datos personales, estadísticas de temporada (básicas, per90, avanzadas), atributos (pace, shooting, passing, dribbling, defending, physical, finishing), datos de mercado, historial de contrato, análisis de scouting, datos tácticos, forma reciente, carrera, historial médico y datos de marketing.

### ScoutingReport
Informe de scouting con: referencia al jugador, datos del partido observado (rival, competición, resultado, goles, asistencias, rating), valoraciones del scout (1-10), atributos observados (1-99), análisis de scouting (comparable, potencial, techo, preparado, fortalezas, debilidades), personalidad y recomendación (Sign/Monitor/Pass).

Cuando se crea un informe, automáticamente:
- Añade una entrada al historial de partidos del jugador (`recentForm.currentForm.last5Games`)
- Actualiza los atributos del jugador
- Actualiza el análisis de scouting del jugador
- Suma las estadísticas del partido a los totales del jugador (goles, asistencias, minutos)

### User
Usuarios del sistema con roles: `scout` (acceso estándar) y `admin` (acceso completo al panel de administración).

---

## Características Principales

### Gestión de Jugadores
- Directorio con paginación (20 jugadores por página)
- Filtros avanzados: posición, equipo, nacionalidad, rango de edad, valor de mercado, goles, asistencias
- Búsqueda instantánea por nombre
- Ordenación por nombre, edad, valor de mercado, goles, asistencias
- Perfil detallado con 8 tabs: Identidad, Rendimiento, Mercado, Scouting, Táctica, Salud, Carrera, Personal
- CRUD completo con formulario de 17 secciones

### Panel de Análisis
- KPIs: total jugadores, edad media, jugador más valioso, contratos expirando
- Gráficos interactivos: goles/asistencias por posición, distribución de edades, jugadores por equipo, top 10 por valor, distribución por posición, radar de atributos, evolución de valor de mercado
- Filtros dinámicos por grupo de posición (Delanteros, Centrocampistas, Extremos, Defensas, Porteros), equipo y rango de edad
- Mini panel de jugadores filtrados con acceso directo al perfil
- Persistencia de filtros en URL

### Sistema de Informes de Scouting
- Creación de informes que actualizan automáticamente el perfil del jugador
- Valoraciones subjetivas del scout (1-10) por categorías
- Atributos observados (1-99) que se vuelcan al perfil
- Exportación a PDF

### Comparación de Jugadores
- Selección múltiple de jugadores (hasta 4)
- Comparación lado a lado de estadísticas y atributos
- Gráfico de radar superpuesto

### Panel de Administración
- Gestión completa de informes (ver, editar, eliminar cualquier informe)
- Gestión de usuarios (ver, cambiar rol, eliminar)
- Estadísticas de uso: informes por scout, por mes, jugadores más analizados, distribución de recomendaciones

---

## Seguridad

- Contraseñas hasheadas con Bcrypt
- Autenticación mediante JWT en todas las rutas protegidas
- Control de acceso por roles (scout / admin)
- Los scouts solo pueden editar/eliminar sus propios informes
- Los admins tienen acceso completo

---

## Decisiones Técnicas

**MongoDB sobre PostgreSQL:** La flexibilidad del esquema de Mongoose fue clave dado el modelo de datos complejo del jugador (más de 100 campos anidados). Permite añadir campos sin migraciones.

**Context API sobre Redux:** El estado de la aplicación es relativamente simple (usuario autenticado, lista de jugadores a comparar). Context API evita la complejidad de Redux sin sacrificar funcionalidad.

**CSS personalizado sobre Tailwind/MUI:** El proyecto incluía un `ui_guidelines.json` con paleta de colores, tipografía y espaciados específicos de ASE Athletics. Usar CSS personalizado permite respetar ese sistema de diseño con total precisión, sin que Tailwind o MUI sobreescriban estilos o añadan clases que entren en conflicto con las guías definidas.

**Separación app.js / index.js:** La app de Express se separa del `listen()` para facilitar los tests con Supertest sin arrancar el servidor real.

---

## Mejoras Futuras

- WebSockets para actualizaciones en tiempo real de informes
- Subida real de imágenes de jugadores (actualmente placeholder)
- Pruebas unitarias e integración completas
- Caché de consultas frecuentes con Redis
- Exportación de comparaciones a PDF/imagen
- Notificaciones para contratos próximos a expirar