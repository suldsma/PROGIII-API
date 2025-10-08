import express from 'express';
const router = express.Router();

import UsuariosController from '../controllers/usuariosController.js';
import { verifyToken, requireRole, ROLES } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/errorHandler.js';
import { validatePagination, validateId } from '../middlewares/validation.js';
import {
  validateUsuarioCreate,
  validateUsuarioUpdate,
  validateUsuarioPartialUpdate,
  validateUsuarioQuery
} from '../middlewares/validationExtra.js';

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// Todas las rutas de usuarios requieren rol de ADMINISTRADOR
router.use(requireRole([ROLES.ADMINISTRADOR]));

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: BREAD completo para gestión de usuarios (Solo Administrador)
 */

/**
 * @swagger
 * /api/usuarios/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de usuarios por tipo
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipo_usuario:
 *                         type: integer
 *                       tipo_texto:
 *                         type: string
 *                       total:
 *                         type: integer
 *                       activos:
 *                         type: integer
 *                       inactivos:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/estadisticas',
  UsuariosController.getStatsByType
);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener lista de usuarios (Browse)
 *     tags: [Usuarios]
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
 *         description: Búsqueda en nombre, apellido o email
 *       - in: query
 *         name: tipo_usuario
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         description: Filtrar por tipo de usuario (1=Admin, 2=Empleado, 3=Cliente)
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Incluir usuarios inactivos
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/',
  validatePagination,
  validateUsuarioQuery,
  handleValidationErrors,
  UsuariosController.getAll
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID (Read)
 *     tags: [Usuarios]
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
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario_id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     nombre_usuario:
 *                       type: string
 *                     tipo_usuario:
 *                       type: integer
 *                     tipo_usuario_texto:
 *                       type: string
 *                     celular:
 *                       type: string
 *                     foto:
 *                       type: string
 *                     activo:
 *                       type: boolean
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/:id',
  validateId,
  handleValidationErrors,
  UsuariosController.getById
);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario (Add)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *               - tipo_usuario
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Pérez"
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *                 example: "juanperez@correo.com"
 *               contrasenia:
 *                 type: string
 *                 minLength: 3
 *                 example: "password123"
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: 1=Admin, 2=Empleado, 3=Cliente
 *                 example: 3
 *               celular:
 *                 type: string
 *                 nullable: true
 *                 example: "+54 291 1234567"
 *               foto:
 *                 type: string
 *                 nullable: true
 *                 example: "https://example.com/foto.jpg"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/',
  validateUsuarioCreate,
  handleValidationErrors,
  UsuariosController.create
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario completo (Edit)
 *     tags: [Usuarios]
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
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *               contrasenia:
 *                 type: string
 *                 description: Solo si se desea cambiar
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *               celular:
 *                 type: string
 *               foto:
 **                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
  validateUsuarioUpdate,
  handleValidationErrors,
  UsuariosController.update
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   patch:
 *     summary: Actualización parcial de usuario
 *     tags: [Usuarios]
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
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *               contrasenia:
 *                 type: string
 *               tipo_usuario:
 *                 type: integer
 *               celular:
 *                 type: string
 *               foto:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado parcialmente exitosamente
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
  validateUsuarioPartialUpdate,
  handleValidationErrors,
  UsuariosController.partialUpdate
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (Delete - soft delete)
 *     tags: [Usuarios]
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
 *         description: Usuario eliminado exitosamente
 *       400:
 *         description: Usuario con reservas activas o ya eliminado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id',
  validateId,
  handleValidationErrors,
  UsuariosController.delete
);

/**
 * @swagger
 * /api/usuarios/{id}/restore:
 *   patch:
 *     summary: Restaurar usuario eliminado
 *     tags: [Usuarios]
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
 *         description: Usuario restaurado exitosamente
 *       400:
 *         description: El usuario ya está activo o hay conflicto de email
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/restore',
  validateId,
  handleValidationErrors,
  UsuariosController.restore
);

export default router;