const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initializeApp } = require('./config/init');
const swaggerSetup = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');
const serviciosRoutes = require('./routes/servicios');

const app = express();

// Configuración de middlewares de seguridad y utilidad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de Swagger
swaggerSetup(app);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviciosRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PROGIII API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/refresh',
      'GET /api/servicios',
      'POST /api/servicios',
      'GET /api/servicios/:id',
      'PUT /api/servicios/:id',
      'DELETE /api/servicios/:id',
      'PATCH /api/servicios/:id/restore'
    ]
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar la aplicación (conexión a BD, etc.)
    await initializeApp();
    
    const PORT = process.env.PORT || 3000;
    
    app.listen(PORT, () => {
      console.log('🚀 =======================================');
      console.log(`🚀 Servidor PROGIII API iniciado`);
      console.log(`🚀 Puerto: ${PORT}`);
      console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log('🚀 =======================================');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = app;