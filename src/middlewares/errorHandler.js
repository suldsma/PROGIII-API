const { validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Middleware global de manejo de errores
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Error de validación de express-validator
  if (error.type === 'validation') {
    return res.status(400).json({
      status: 'error',
      message: 'Datos de entrada inválidos',
      errors: error.details
    });
  }

  // Error de base de datos MySQL
  if (error.code) {
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          status: 'error',
          message: 'El registro ya existe'
        });
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          status: 'error',
          message: 'Referencia inválida a otro registro'
        });
      case 'ER_BAD_NULL_ERROR':
        return res.status(400).json({
          status: 'error',
          message: 'Campo requerido faltante'
        });
      default:
        break;
    }
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expirado'
    });
  }

  // Error personalizado con status
  if (error.status) {
    return res.status(error.status).json({
      status: 'error',
      message: error.message
    });
  }

  // Error interno del servidor
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
};

// Función helper para crear errores personalizados
const createError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = {
  errorHandler,
  handleValidationErrors,
  createError
};