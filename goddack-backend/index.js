const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Importamos la conexión 
// OJO: Según tu imagen, database.js está en src/api/utils/, no en src/utils/
const { connect } = require("./src/utils/database");

// 2. Importamos las Rutas
const playerRoutes    = require('./src/api/routes/playerRoutes');
const reportRoutes    = require('./src/api/routes/reportRoutes');
const dashboardRoutes = require('./src/api/routes/dashboardRoutes');
const authRoutes      = require('./src/api/routes/userRoutes');
const adminRoutes     = require('./src/api/routes/adminRoutes');

// Configuración de variables de entorno
dotenv.config();

// 3. Conectar a la base de datos
connect();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 4. Rutas de la API
app.use('/api/auth',      authRoutes);
app.use('/api/players',   playerRoutes);
app.use('/api/reports',   reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users',     adminRoutes); 

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Goddack Analítica funcionando 🚀');
});

// Manejador de errores global (Para que el servidor no se caiga si hay un error inesperado)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});