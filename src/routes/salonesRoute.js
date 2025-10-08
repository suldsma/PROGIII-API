import express from 'express';
const router = express.Router();

import SalonesController from '../controllers/salonesController.js';
import { verifyToken, requireRole, ROLES } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/errorHandler.js';
import { validatePagination, validateId } from '../middlewares/validation.js';
import {
  validateSalonCreate,
  validateSalonUpdate,
  validateSalonPartialUpdate,
  validateSalonAvailable
} from '../middlewares/validationExtra.js';

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Salones
 *   description: BREAD completo para gestión de salones de cumpleaños
 */

/**
 * @swagger
 * /api/salones/disponibles:
 *   get:
 *     summary: Obtener salones disponibles para una fecha y turno
 *     tags: [Salones]
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
 *         name: turno_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     responses:
 *       200:
 *         description: Salones disponibles obtenidos exitosamente
 *       400:
 *         description: Parámetros faltantes o inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/disponibles',
  validateSalonAvailable,
  handleValidationErrors,
  SalonesController.getAvailable
);

/**
 * @swagger
 * /api/salones:
 *   get:
 *     summary: Obtener lista de salones (Browse)
 *     tags: [Salones]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda en título o dirección
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Incluir salones inactivos (solo admin)
 *     responses:
 *       200:
 *         description: Lista de salones obtenida exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/',
  validatePagination,
  handleValidationErrors,
  SalonesController.getAll
);

/**
 * @swagger
 * /api/salones/{id}:
 *   get:
 *     summary: Obtener salón por ID (Read)
 *     tags: [Salones]
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
 *         description: Salón obtenido exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id',
  validateId,
  handleValidationErrors,
  SalonesController.getById
);

/**
 * @swagger
 * /api/salones:
 *   post:
 *     summary: Crear nuevo salón (Add)
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - direccion
 *               - importe
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Salón Principal"
 *               direccion:
 *                 type: string
 *                 example: "San Lorenzo 1000"
 *               latitud:
 *                 type: number
 *                 nullable: true
 *                 example: -38.7183
 *               longitud:
 *                 type: number
 *                 nullable: true
 *                 example: -62.2663
 *               capacidad:
 *                 type: integer
 *                 nullable: true
 *                 example: 200
 *               importe:
 *                 type: number
 *                 example: 95000.00
 *     responses:
 *       201:
 *         description: Salón creado exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateSalonCreate,
  handleValidationErrors,
  SalonesController.create
);

/**
 * @swagger
 * /api/salones/{id}:
 *   put:
 *     summary: Actualizar salón completo (Edit)
 *     tags: [Salones]
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
 *               titulo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               capacidad:
 *                 type: integer
 *               importe:
 *                 type: number
 *     responses:
 *       200:
 *         description: Salón actualizado exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id',
  requireRole([ROLES.ADMINISTRADOR, ROLES.EMPLEADO]),
  validateSalonUpdate,
  handleValidationErrors,
  SalonesController.update
);

/**
 * @swagger
 * /api/salones/{id}:
 *   patch:
 *     summary: Actualización parcial de salón
 *     tags: [Salones]
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
 *               titulo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               capacidad:
 *                 type: integer
 *               importe:
 *                 type: number
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Salón actualizado parcialmente exitosamente
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
  validateSalonPartialUpdate,
  handleValidationErrors,
  SalonesController.partialUpdate
);

/**
 * @swagger
 * /api/salones/{id}:
 *   delete:
 *     summary: Eliminar salón (Delete - soft delete)
 *     tags: [Salones]
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
 *         description: Salón eliminado exitosamente
 *       400:
 *         description: Salón con reservas activas o ya eliminado
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
  SalonesController.delete
);

/**
 * @swagger
 * /api/salones/{id}/restore:
 *   patch:
 *     summary: Restaurar salón eliminado
 *     tags: [Salones]
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
 *         description: Salón restaurado exitosamente
 *       400:
 *         description: El salón ya está activo
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
  SalonesController.restore
);

export default router;