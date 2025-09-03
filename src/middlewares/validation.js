const { body, param, query } = require('express-validator');

// Validaciones para servicios
const validateServicioCreate = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres')
    .trim()
    .customSanitizer((value) => {
      // Limpiar espacios múltiples y capitalizar primera letra
      return value.replace(/\s+/g, ' ').trim();
    }),
  
  body('importe')
    .notEmpty()
    .withMessage('El importe es requerido')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El importe debe ser un número decimal válido con hasta 2 decimales')
    .custom(value => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('El importe no puede ser negativo');
      }
      if (num > 9999999.99) {
        throw new Error('El importe no puede superar $9,999,999.99');
      }
      return true;
    })
];

const validateServicioUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  
  body('descripcion')
    .optional()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres')
    .trim()
    .customSanitizer((value) => {
      return value ? value.replace(/\s+/g, ' ').trim() : value;
    }),
  
  body('importe')
    .optional()
    .notEmpty()
    .withMessage('El importe no puede estar vacío')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El importe debe ser un número decimal válido con hasta 2 decimales')
    .custom(value => {
      if (value !== undefined && value !== null && value !== '') {
        const num = parseFloat(value);
        if (num < 0) {
          throw new Error('El importe no puede ser negativo');
        }
        if (num > 9999999.99) {
          throw new Error('El importe no puede superar $9,999,999.99');
        }
      }
      return true;
    })
];

const validateServicioId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt()
];

// Validaciones para paginación y búsqueda
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100')
    .toInt(),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El término de búsqueda no puede exceder 100 caracteres')
    .trim(),
  
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('includeInactive debe ser true o false')
    .toBoolean()
];

// Validaciones para login
const validateLogin = [
  body('nombre_usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isEmail()
    .withMessage('El nombre de usuario debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 50 })
    .withMessage('El nombre de usuario no puede exceder 50 caracteres'),
  
  body('contrasenia')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 3 })
    .withMessage('La contraseña debe tener al menos 3 caracteres')
    .isLength({ max: 50 })
    .withMessage('La contraseña no puede exceder 50 caracteres')
];

// Validaciones comunes
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt()
];

const validateOptionalBoolean = (field) => [
  query(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} debe ser true o false`)
    .toBoolean()
];

module.exports = {
  validateServicioCreate,
  validateServicioUpdate,
  validateServicioId,
  validatePagination,
  validateLogin,
  validateId,
  validateOptionalBoolean
};