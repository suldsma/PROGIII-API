import express from 'express';
const router = express.Router();

import TurnosController from '../controllers/turnosController.js';
import { verifyToken, requireRole, ROLES } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/errorHandler.js';
import { validatePagination, validateId } from '../middlewares/validation.js';
import {
  validateTurnoCreate,
  validateTurnoUpdate,
  validateTurnoPartialUpdate,
  validateTurnoAvailable
} from '../middlewares/validationExtra.js';

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: BREAD completo para gestión de turnos
 */

/**
 * @swagger
 * /api/turnos/disponibles:
 *   get:
 *     summary: Obtener turnos disponibles para una fecha y salón
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de la reserva (YYYY-MM-DD)
 *       - in: query
 *         name: salon_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón
 *     responses:
 *       200:
 *         description: Turnos disponibles obtenidos exitosamente
 *       400:
 *         description: Parámetros faltantes o inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/disponibles',
  validateTurnoAvailable,
  handleValidationErrors,
  TurnosController.getAvailable
);

/**
 * @swagger
 * /api/turnos:
 *   get:
 *     summary: Obtener lista de turnos (Browse)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Incluir turnos inactivos (solo admin)
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  TurnosController.getAll
);

/**
 * @swagger
 * /api/turnos/{id}:
 *   get:
 *     summary: Obtener turno por ID (Read)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno obtenido exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id',
  validateId,
  handleValidationErrors,
  TurnosController.getById
);

/**
 * @swagger
 * /api/turnos:
 *   post:
 *     summary: Crear nuevo turno (Add)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hora_desde
 *               - hora_hasta
 *             properties:
 *               orden:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *                 description: Orden del turno (se autogenera si no se proporciona)
 *               hora_desde:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 example: "12:00"
 *               hora_hasta:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 example: "14:00"
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Horarios inválidos o solapamiento con otro turno
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateTurnoCreate,
  handleValidationErrors,
  TurnosController.create
);

/**
 * @swagger
 * /api/turnos/{id}:
 *   put:
 *     summary: Actualizar turno completo (Edit)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 1
 *               hora_desde:
 *                 type: string
 *                 example: "12:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "14:00"
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *       400:
 *         description: Horarios inválidos o solapamiento
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateTurnoUpdate,
  handleValidationErrors,
  TurnosController.update
);

/**
 * @swagger
 * /api/turnos/{id}:
 *   patch:
 *     summary: Actualización parcial de turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *               hora_desde:
 *                 type: string
 *               hora_hasta:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Turno actualizado parcialmente exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateTurnoPartialUpdate,
  handleValidationErrors,
  TurnosController.partialUpdate
);

/**
 * @swagger
 * /api/turnos/{id}:
 *   delete:
 *     summary: Eliminar turno (Delete - soft delete)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno eliminado exitosamente
 *       400:
 *         description: Turno con reservas activas o ya eliminado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateId,
  handleValidationErrors,
  TurnosController.delete
);

/**
 * @swagger
 * /api/turnos/{id}/restore:
 *   patch:
 *     summary: Restaurar turno eliminado
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno restaurado exitosamente
 *       400:
 *         description: El turno ya está activo o hay solapamiento
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/restore',
  requireRole([ROLES.ADMINISTRADOR]),
  validateId,
  handleValidationErrors,
  TurnosController.restore
);

export default router;