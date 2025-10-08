import { body, param, query } from 'express-validator';

// Validaciones para servicios
const validateServicioCreate = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres')
    .trim()
    .customSanitizer((value) => {
      // Limpia espacios múltiples y capitaliza primera letra
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

// Validación para estadísticas
const validateStatsQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('El límite debe ser un número entre 1 y 20')
    .toInt()
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

// Validación para actualización parcial de servicio (PATCH)
const validatePartialUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  
  // Al menos uno de los campos debe estar presente
  body()
    .custom((value) => {
      const { descripcion, importe, activo } = value;
      if (descripcion === undefined && importe === undefined && activo === undefined) {
        throw new Error('Al menos un campo (descripcion, importe, activo) debe estar presente para la actualización');
      }
      return true;
    }),
  
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
    }),
  
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false')
    .toBoolean()
];

// Validaciones comunes
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt()
];

// Validación para campos de búsqueda avanzada
const validateAdvancedSearch = [
  query('sortBy')
    .optional()
    .isIn(['descripcion', 'importe', 'creado', 'modificado'])
    .withMessage('El campo de ordenamiento debe ser uno de: descripcion, importe, creado, modificado'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('El orden debe ser ASC o DESC'),
  
  query('minImporte')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El importe mínimo debe ser un número decimal válido')
    .custom(value => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('El importe mínimo no puede ser negativo');
      }
      return true;
    }),
  
  query('maxImporte')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El importe máximo debe ser un número decimal válido')
    .custom(value => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('El importe máximo no puede ser negativo');
      }
      return true;
    })
];

export {
  validateServicioCreate,
  validateServicioUpdate,
  validateServicioId,
  validatePagination,
  validateStatsQuery,
  validateLogin,
  validateId,
  validatePartialUpdate,
  validateAdvancedSearch
};
