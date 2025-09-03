const express = require('express');
const router = express.Router();

const ServiciosController = require('../controllers/serviciosController');
const { verifyToken, requireRole, ROLES } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/errorHandler');
const {
  validateServicioCreate,
  validateServicioUpdate,
  validateServicioId,
  validatePagination
} = require('../middlewares/validation');

// Middleware de autenticación para todas las rutas de servicios
router.use(verifyToken);

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     summary: Obtener lista de servicios (Browse)
 *     description: Obtiene una lista paginada de servicios con filtros opcionales. Los clientes solo ven servicios activos, mientras que los administradores pueden incluir servicios inactivos.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// GET /api/servicios - Listar servicios (BROWSE) - Todos los roles autenticados
router.get('/',
  validatePagination,
  handleValidationErrors,
  ServiciosController.getAll
);

/**
 * @swagger
 * /api/servicios/stats/most-used:
 *   get:
 *     summary: Obtener servicios más utilizados
 *     description: Obtiene estadísticas de los servicios más utilizados en reservas activas.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// GET /api/servicios/stats/most-used - Estadísticas de servicios más usados
router.get('/stats/most-used',
  ServiciosController.getMostUsed
);

/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     summary: Obtener servicio por ID (Read)
 *     description: Obtiene un servicio específico por su ID. Los clientes solo pueden ver servicios activos.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// GET /api/servicios/:id - Obtener servicio por ID (READ) - Todos los roles autenticados
router.get('/:id',
  validateServicioId,
  handleValidationErrors,
  ServiciosController.getById
);

/**
 * @swagger
 * /api/servicios:
 *   post:
 *     summary: Crear nuevo servicio (Add)
 *     description: Crea un nuevo servicio. Solo administradores y empleados pueden crear servicios.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// POST /api/servicios - Crear servicio (ADD) - Solo administradores y empleados
router.post('/',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateServicioCreate,
  handleValidationErrors,
  ServiciosController.create
);

/**
 * @swagger
 * /api/servicios/{id}:
 *   put:
 *     summary: Actualizar servicio completo (Edit)
 *     description: Actualiza completamente un servicio existente. Solo administradores y empleados.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// PUT /api/servicios/:id - Actualizar servicio completo (EDIT) - Solo administradores y empleados
router.put('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateServicioUpdate,
  handleValidationErrors,
  ServiciosController.update
);

/**
 * @swagger
 * /api/servicios/{id}:
 *   patch:
 *     summary: Actualización parcial de servicio
 *     description: Actualiza parcialmente un servicio existente. Solo administradores y empleados.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// PATCH /api/servicios/:id - Actualización parcial - Solo administradores y empleados
router.patch('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateServicioId,
  handleValidationErrors,
  ServiciosController.partialUpdate
);

/**
 * @swagger
 * /api/servicios/{id}:
 *   delete:
 *     summary: Eliminar servicio (Delete)
 *     description: Elimina un servicio (soft delete). Solo administradores y empleados pueden eliminar servicios.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// DELETE /api/servicios/:id - Eliminar servicio (DELETE) - Solo administradores y empleados
router.delete('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateServicioId,
  handleValidationErrors,
  ServiciosController.delete
);

/**
 * @swagger
 * /api/servicios/{id}/restore:
 *   patch:
 *     summary: Restaurar servicio eliminado
 *     description: Restaura un servicio que fue eliminado (soft delete). Solo administradores.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 */
// PATCH /api/servicios/:id/restore - Restaurar servicio - Solo administradores
router.patch('/:id/restore',
  requireRole([ROLES.ADMINISTRADOR]),
  validateServicioId,
  handleValidationErrors,
  ServiciosController.restore
);

module.exports = router;