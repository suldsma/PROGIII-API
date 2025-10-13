import { body, param, query } from 'express-validator';
// Validaciones para la creación de un servicio (POST /api/servicios)
const validateServicioCreate = [
  // Campo 'descripcion'
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres')
    .trim()
    .customSanitizer((value) => {
      // Limpia espacios múltiples y sanitiza el valor
      return value.replace(/\s+/g, ' ').trim();
    }),
  
  // Campo 'importe'
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
      if (num > 9999999.99) { // Límite para evitar overflow de base de datos
        throw new Error('El importe no puede superar $9,999,999.99');
      }
      return true;
    })
];

// Validaciones para la actualización completa de un servicio (PUT /api/servicios/:id)
const validateServicioUpdate = [
  // Parámetro 'id' en la URL
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  
  // Campo 'descripcion'
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
  
  // Campo 'importe'
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

// Validación para el parámetro ID en la URL (GET, DELETE)
const validateServicioId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt() // Convierte el parámetro a entero
];

// Validación para actualización parcial/restauración de servicio (PATCH /api/servicios/:id)
const validatePartialUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  
  // Regla para asegurar que al menos un campo actualizable esté presente
  body()
    .custom((value) => {
      const { descripcion, importe, activo } = value;
      if (descripcion === undefined && importe === undefined && activo === undefined) {
        throw new Error('Al menos un campo (descripcion, importe, activo) debe estar presente para la actualización');
      }
      return true;
    }),
  
  // Reglas de 'descripcion'
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
  
  // Reglas de 'importe' 
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

  // Regla de 'activo' 
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false')
    .toBoolean()
];

// Validaciones para el login (POST /api/auth/login)
const validateLogin = [
  // Campo 'nombre_usuario' (Email)
  body('nombre_usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isEmail()
    .withMessage('El nombre de usuario debe ser un email válido')
    .normalizeEmail() 
    .isLength({ max: 50 })
    .withMessage('El nombre de usuario no puede exceder 50 caracteres'),
  
  // Campo 'contrasenia'
  body('contrasenia')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 3 }) 
    .withMessage('La contraseña debe tener al menos 3 caracteres')
    .isLength({ max: 50 })
    .withMessage('La contraseña no puede exceder 50 caracteres')
];

// Validaciones para paginación, búsqueda y filtros generales (GET /api/servicios)
const validatePagination = [
  // Query param 'page'
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo')
    .toInt(),
  
  // Query param 'limit'
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100')
    .toInt(),
  
  // Query param 'search'
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El término de búsqueda no puede exceder 100 caracteres')
    .trim(),
  
  // Query param 'includeInactive'
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('includeInactive debe ser true o false')
    .toBoolean()
];

// Validación para parámetros de estadísticas (GET /api/servicios/stats/most-used)
const validateStatsQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('El límite debe ser un número entre 1 y 20')
    .toInt()
];

// Validación para campos de búsqueda avanzada/ordenamiento
const validateAdvancedSearch = [
  // Query param 'sortBy'
  query('sortBy')
    .optional()
    .isIn(['descripcion', 'importe', 'creado', 'modificado'])
    .withMessage('El campo de ordenamiento debe ser uno de: descripcion, importe, creado, modificado'),
  
  // Query param 'sortOrder'
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('El orden debe ser ASC o DESC'),
  
  // Query param 'minImporte'
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
  
  // Query param 'maxImporte'
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

// Validación genérica para el parámetro ID en la URL
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt()
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