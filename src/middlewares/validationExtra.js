import { body, param, query } from 'express-validator';

// ============================================
// VALIDACIONES PARA SALONES
// ============================================

const validateSalonCreate = [
  body('titulo')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres')
    .trim(),
  
  body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 3, max: 255 })
    .withMessage('La dirección debe tener entre 3 y 255 caracteres')
    .trim(),
  
  body('latitud')
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: '0,8' })
    .withMessage('La latitud debe ser un número decimal válido')
    .custom(value => {
      if (value !== null && value !== undefined) {
        const num = parseFloat(value);
        if (num < -90 || num > 90) {
          throw new Error('La latitud debe estar entre -90 y 90');
        }
      }
      return true;
    }),
  
  body('longitud')
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: '0,8' })
    .withMessage('La longitud debe ser un número decimal válido')
    .custom(value => {
      if (value !== null && value !== undefined) {
        const num = parseFloat(value);
        if (num < -180 || num > 180) {
          throw new Error('La longitud debe estar entre -180 y 180');
        }
      }
      return true;
    }),
  
  body('capacidad')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 10000 })
    .withMessage('La capacidad debe ser un número entero entre 1 y 10000')
    .toInt(),
  
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

const validateSalonUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  
  body('titulo')
    .optional()
    .notEmpty()
    .withMessage('El título no puede estar vacío')
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres')
    .trim(),
  
  body('direccion')
    .optional()
    .notEmpty()
    .withMessage('La dirección no puede estar vacía')
    .isLength({ min: 3, max: 255 })
    .withMessage('La dirección debe tener entre 3 y 255 caracteres')
    .trim(),
  
  body('latitud')
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: '0,8' })
    .withMessage('La latitud debe ser un número decimal válido')
    .custom(value => {
      if (value !== null && value !== undefined && value !== '') {
        const num = parseFloat(value);
        if (num < -90 || num > 90) {
          throw new Error('La latitud debe estar entre -90 y 90');
        }
      }
      return true;
    }),
  
  body('longitud')
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: '0,8' })
    .withMessage('La longitud debe ser un número decimal válido')
    .custom(value => {
      if (value !== null && value !== undefined && value !== '') {
        const num = parseFloat(value);
        if (num < -180 || num > 180) {
          throw new Error('La longitud debe estar entre -180 y 180');
        }
      }
      return true;
    }),
  
  body('capacidad')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 10000 })
    .withMessage('La capacidad debe ser un número entero entre 1 y 10000')
    .toInt(),
  
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

const validateSalonPartialUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  
  body()
    .custom((value) => {
      const { titulo, direccion, latitud, longitud, capacidad, importe, activo } = value;
      if (titulo === undefined && direccion === undefined && latitud === undefined && 
          longitud === undefined && capacidad === undefined && importe === undefined && activo === undefined) {
        throw new Error('Al menos un campo debe estar presente para la actualización');
      }
      return true;
    }),
  
  ...validateSalonUpdate.slice(1) // Reutiliza las validaciones de update
];

const validateSalonAvailable = [
  query('fecha')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isDate()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)'),
  
  query('turno_id')
    .notEmpty()
    .withMessage('El turno_id es requerido')
    .isInt({ min: 1 })
    .withMessage('El turno_id debe ser un número entero positivo')
    .toInt()
];

// ============================================
// VALIDACIONES PARA TURNOS
// ============================================

const validateTurnoCreate = [
  body('orden')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El orden debe ser un número entero positivo')
    .toInt(),
  
  body('hora_desde')
    .notEmpty()
    .withMessage('La hora desde es requerida')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('La hora desde debe tener formato HH:MM (00:00 a 23:59)'),
  
  body('hora_hasta')
    .notEmpty()
    .withMessage('La hora hasta es requerida')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('La hora hasta debe tener formato HH:MM (00:00 a 23:59)')
];

const validateTurnoUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  
  body('orden')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El orden debe ser un número entero positivo')
    .toInt(),
  
  body('hora_desde')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('La hora desde debe tener formato HH:MM (00:00 a 23:59)'),
  
  body('hora_hasta')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('La hora hasta debe tener formato HH:MM (00:00 a 23:59)')
];

const validateTurnoPartialUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  
  body()
    .custom((value) => {
      const { orden, hora_desde, hora_hasta, activo } = value;
      if (orden === undefined && hora_desde === undefined && hora_hasta === undefined && activo === undefined) {
        throw new Error('Al menos un campo (orden, hora_desde, hora_hasta, activo) debe estar presente para la actualización');
      }
      return true;
    }),
  
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false')
    .toBoolean(),
  
  ...validateTurnoUpdate.slice(1)
];

const validateTurnoAvailable = [
  query('fecha')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isDate()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)'),
  
  query('salon_id')
    .notEmpty()
    .withMessage('El salon_id es requerido')
    .isInt({ min: 1 })
    .withMessage('El salon_id debe ser un número entero positivo')
    .toInt()
];

// ============================================
// VALIDACIONES PARA USUARIOS
// ============================================

const validateUsuarioCreate = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
  
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .trim(),
  
  body('nombre_usuario')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail()
    .isLength({ max: 50 })
    .withMessage('El email no puede exceder 50 caracteres'),
  
  body('contrasenia')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 3, max: 50 })
    .withMessage('La contraseña debe tener entre 3 y 50 caracteres'),
  
  body('tipo_usuario')
    .notEmpty()
    .withMessage('El tipo de usuario es requerido')
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)')
    .toInt(),
  
  body('celular')
    .optional({ nullable: true })
    .isLength({ max: 20 })
    .withMessage('El celular no puede exceder 20 caracteres')
    .trim(),
  
  body('foto')
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage('La URL de la foto no puede exceder 255 caracteres')
    .trim()
];

const validateUsuarioUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  
  body('nombre')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
  
  body('apellido')
    .optional()
    .notEmpty()
    .withMessage('El apellido no puede estar vacío')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .trim(),
  
  body('nombre_usuario')
    .optional()
    .notEmpty()
    .withMessage('El email no puede estar vacío')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail()
    .isLength({ max: 50 })
    .withMessage('El email no puede exceder 50 caracteres'),
  
  body('contrasenia')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('La contraseña debe tener entre 3 y 50 caracteres'),
  
  body('tipo_usuario')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)')
    .toInt(),
  
  body('celular')
    .optional({ nullable: true })
    .isLength({ max: 20 })
    .withMessage('El celular no puede exceder 20 caracteres')
    .trim(),
  
  body('foto')
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage('La URL de la foto no puede exceder 255 caracteres')
    .trim()
];

const validateUsuarioPartialUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  
  body()
    .custom((value) => {
      const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo } = value;
      if (nombre === undefined && apellido === undefined && nombre_usuario === undefined && 
          contrasenia === undefined && tipo_usuario === undefined && celular === undefined && 
          foto === undefined && activo === undefined) {
        throw new Error('Al menos un campo debe estar presente para la actualización');
      }
      return true;
    }),
  
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false')
    .toBoolean(),
  
  ...validateUsuarioUpdate.slice(1)
];

const validateUsuarioQuery = [
  query('tipo_usuario')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)')
    .toInt()
];

export {
  // Salones
  validateSalonCreate,
  validateSalonUpdate,
  validateSalonPartialUpdate,
  validateSalonAvailable,
  
  // Turnos
  validateTurnoCreate,
  validateTurnoUpdate,
  validateTurnoPartialUpdate,
  validateTurnoAvailable,
  
  // Usuarios
  validateUsuarioCreate,
  validateUsuarioUpdate,
  validateUsuarioPartialUpdate,
  validateUsuarioQuery
};