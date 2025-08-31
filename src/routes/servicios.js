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

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/servicios - Listar servicios (todos los roles)
router.get('/',
  validatePagination,
  handleValidationErrors,
  ServiciosController.getAll
);

// GET /api/servicios/:id - Obtener servicio por ID (todos los roles)
router.get('/:id',
  validateServicioId,
  handleValidationErrors,
  ServiciosController.getById
);

// POST /api/servicios - Crear servicio (solo administradores y empleados)
router.post('/',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateServicioCreate,
  handleValidationErrors,
  ServiciosController.create
);

// PUT /api/servicios/:id - Actualizar servicio (solo administradores y empleados)
router.put('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateServicioUpdate,
  handleValidationErrors,
  ServiciosController.update
);

// DELETE /api/servicios/:id - Eliminar servicio (solo administradores y empleados)
router.delete('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateServicioId,
  handleValidationErrors,
  ServiciosController.delete
);

// PATCH /api/servicios/:id/restore - Restaurar servicio (solo administradores)
router.patch('/:id/restore',
  requireRole([ROLES.ADMINISTRADOR]),
  validateServicioId,
  handleValidationErrors,
  ServiciosController.restore
);

module.exports = router;