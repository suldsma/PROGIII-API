import { body, param, query, validationResult } from 'express-validator';
import { createError } from './errorHandler.js';

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req,)));
    const errors = validationResult(req);
    if (errors.isEmpty()){
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      param: err.param,
      message: err.msg,
      value: err.value,
    }));

    const validationError = createError('Error de validación de datos.', 400);
    validationError.errors = extractedErrors;
    next(validationError);
  };
};

const validateReservaCreate = [
  body('salon_id')
    .exists().withMessage('El ID de salón es obligatorio.')
    .isInt({ min: 1}).withMessage('El ID de salón debe ser un número entero positivo.'),
  
  body('fecha')
    .exists().withMessage('La fecha es obligatoria.')
    .isISO8601().withMessage('Formato de fecha YYYY-MM-DD inválido.')
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(value);
      if (inputDate < today) {
        throw new Error('La fecha debe ser hoy o una futura.');
      }
      return true;
  }),

  body('hora_inicio')
    .exists().withMessage('La hora de inicio es obligatoria.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de hora HH:MM inválido.'),

  body('hora_fin')
    .exists().withMessage('La hora de fin es obligatoria.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de hora HH:MM inválido.')
    .custom((horaFin, { req }) => {
      if (req.body.hora_inicio && horaFin <= req.body.hora_inicio){
        throw new Error('La hora de fin debe ser posterior a la hora de inicio.'); 
      }
      return true;
  }),

  body('servicios_ids')
    .optional()
    .isArray().withMessage('Los servicios deben ser un array de IDs.'),

  body('cliente_id')
    .optional()
    .isInt({ min: 1}).withMessage('ID de cliente inválido.')
    .custom((value, { req }) => {
      if (req.user && req.user.rol_id !== 3 && ! value){
        throw new Error('El ID de cliente es obligatorio para crear una reserva como Admin/Empleado.'); 
      }
      return true;
    })
];

const validateReservaId = [
  param('id')
  .isInt({ min: 1})
  .withMessage('El ID de reserva debe ser un número entero positivo')
  .toInt()
]

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

const validateOptionalBoolean = (field) => [
  query(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} debe ser true o false`)
    .toBoolean()
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
  validate,
  validateReservaCreate,
  validateReservaId,
  validateServicioCreate,
  validateServicioUpdate,
  validateServicioId,
  validatePagination,
  validateStatsQuery,
  validateLogin,
  validateId,
  validateOptionalBoolean,
  validatePartialUpdate,
  validateAdvancedSearch
};