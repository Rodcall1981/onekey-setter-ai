const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const analysisRoutes = require('./routes/analysis');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Servidor OK ✅', timestamp: new Date().toISOString() });
});

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas de análisis
app.use('/api', analysisRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Test: http://localhost:${PORT}/health`);
  console.log(`🤖 Análisis: POST http://localhost:${PORT}/api/analyze`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
});
