import { validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Errores de validación en los datos enviados',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Middleware global para manejo de errores
 */
const errorHandler = (error, req, res, next) => {
  // Log del error para debugging
  console.error('=== ERROR HANDLER ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Method:', req.method);
  console.error('URL:', req.originalUrl);
  console.error('User:', req.user ? `${req.user.id} (${req.user.tipo})` : 'No autenticado');
  console.error('Error:', {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
  console.error('==================');

  // Error de validación personalizado
  if (error.type === 'validation') {
    return res.status(400).json({
      status: 'error',
      message: 'Datos de entrada inválidos',
      errors: error.details || []
    });
  }

  // Errores de base de datos MySQL
  if (error.code) {
    const dbErrorResponses = {
      'ER_DUP_ENTRY': {
        status: 409,
        message: 'Ya existe un registro con estos datos',
        detail: 'Registro duplicado'
      },
      'ER_NO_REFERENCED_ROW_2': {
        status: 400,
        message: 'Referencia inválida a otro registro',
        detail: 'La referencia especificada no existe'
      },
      'ER_BAD_NULL_ERROR': {
        status: 400,
        message: 'Campo requerido faltante',
        detail: 'Uno o más campos obligatorios no fueron proporcionados'
      },
      'ER_DATA_TOO_LONG': {
        status: 400,
        message: 'Datos demasiado largos para el campo',
        detail: 'Uno o más campos exceden la longitud máxima permitida'
      },
      'ER_TRUNCATED_WRONG_VALUE': {
        status: 400,
        message: 'Formato de dato incorrecto',
        detail: 'Uno o más campos tienen un formato inválido'
      },
      'ECONNREFUSED': {
        status: 503,
        message: 'Error de conexión con la base de datos',
        detail: 'Servicio temporalmente no disponible'
      },
      'ER_ACCESS_DENIED_ERROR': {
        status: 503,
        message: 'Error de acceso a la base de datos',
        detail: 'Configuración de base de datos incorrecta'
      }
    };

    const response = dbErrorResponses[error.code];
    if (response) {
      return res.status(response.status).json({
        status: 'error',
        message: response.message,
        detail: response.detail
      });
    } else {
      console.error('Error de BD no manejado:', error.code, error.message);
    }
  }

  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token de acceso inválido',
      detail: 'El token proporcionado no es válido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token de acceso expirado',
      detail: 'Debe iniciar sesión nuevamente'
    });
  }

  if (error.name === 'NotBeforeError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token no válido aún',
      detail: 'El token no es válido en este momento'
    });
  }

  // Errores de parsing JSON
  if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    return res.status(400).json({
      status: 'error',
      message: 'Formato JSON inválido',
      detail: 'El cuerpo de la petición contiene JSON malformado'
    });
  }

  // Error de límite de tamaño de payload
  if (error.name === 'PayloadTooLargeError') {
    return res.status(413).json({
      status: 'error',
      message: 'Datos demasiado grandes',
      detail: 'El tamaño de los datos excede el límite permitido'
    });
  }

  // Errores personalizados con status
  if (error.status) {
    const response = {
      status: 'error',
      message: error.message
    };

    // Agrego detalles adicionales si están disponibles
    if (error.details) response.details = error.details;
    if (error.errors) response.errors = error.errors;

    return res.status(error.status).json(response);
  }

  // Error interno del servidor 
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    ...(isDevelopment && {
      detail: error.message,
      stack: error.stack
    })
  });
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint no encontrado',
    detail: `${req.method} ${req.originalUrl} no existe`,
    availableEndpoints: {
      auth: [
        'POST /api/auth/login',
        'GET /api/auth/me',
        'POST /api/auth/refresh'
      ],
      servicios: [
        'GET /api/servicios',
        'POST /api/servicios',
        'GET /api/servicios/:id',
        'PUT /api/servicios/:id',
        'PATCH /api/servicios/:id',
        'DELETE /api/servicios/:id',
        'PATCH /api/servicios/:id/restore',
        'GET /api/servicios/stats/most-used'
      ],
      otros: [
        'GET /api/health',
        'GET /api-docs'
      ]
    }
  });
};

/**
 * Función helper para crear errores personalizados
 */
const createError = (message, status = 500, details = null) => {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
};

/**
 * Función helper para crear errores de validación
 */
const createValidationError = (message, errors = []) => {
  const error = new Error(message);
  error.type = 'validation';
  error.status = 400;
  error.details = errors;
  return error;
};

/**
 * Middleware para capturar errores asíncronos
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Función para log de errores críticos
 */
const logCriticalError = (error, context = {}) => {
  console.error('=== ERROR CRÍTICO ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Context:', context);
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
  console.error('====================');
};

export {
  errorHandler,
  handleValidationErrors,
  notFoundHandler,
  createError,
  createValidationError,
  asyncHandler,
  logCriticalError
};
