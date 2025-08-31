const Servicio = require('../models/Servicio');
const { createError } = require('../middlewares/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Gestión de servicios para reservas
 */

class ServiciosController {
  
  /**
   * @swagger
   * /api/servicios:
   *   get:
   *     summary: Obtener lista de servicios
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Elementos por página
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Buscar por descripción
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Incluir servicios inactivos (solo administradores)
   *     responses:
   *       200:
   *         description: Lista de servicios obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Servicio'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     currentPage:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     totalItems:
   *                       type: integer
   *                     itemsPerPage:
   *                       type: integer
   *                     hasNext:
   *                       type: boolean
   *                     hasPrev:
   *                       type: boolean
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', includeInactive = false } = req.query;
      
      // Solo administradores pueden ver servicios inactivos
      const canSeeInactive = req.user.tipo === 1 && includeInactive === 'true';
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        includeInactive: canSeeInactive
      };
      
      const result = await Servicio.findAll(options);
      
      res.status(200).json({
        status: 'success',
        data: result.servicios,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/servicios/{id}:
   *   get:
   *     summary: Obtener un servicio por ID
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio
   *     responses:
   *       200:
   *         description: Servicio encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/Servicio'
   *       404:
   *         description: Servicio no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Administradores pueden ver servicios inactivos
      const servicio = req.user.tipo === 1 
        ? await Servicio.findById(id)
        : await Servicio.findActiveById(id);
      
      if (!servicio) {
        throw createError('Servicio no encontrado', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: servicio
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/servicios:
   *   post:
   *     summary: Crear un nuevo servicio
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ServicioInput'
   *     responses:
   *       201:
   *         description: Servicio creado exitosamente
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
   *                   example: Servicio creado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Servicio'
   *       400:
   *         description: Datos inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: El servicio ya existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async create(req, res, next) {
    try {
      const { descripcion, importe } = req.body;
      
      const nuevoServicio = await Servicio.create({
        descripcion: descripcion.trim(),
        importe: parseFloat(importe)
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Servicio creado exitosamente',
        data: nuevoServicio
      });
    } catch (error) {
      if (error.message.includes('Ya existe un servicio')) {
        next(createError(error.message, 409));
      } else {
        next(error);
      }
    }
  }

  /**
   * @swagger
   * /api/servicios/{id}:
   *   put:
   *     summary: Actualizar un servicio
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ServicioInput'
   *     responses:
   *       200:
   *         description: Servicio actualizado exitosamente
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
   *                   example: Servicio actualizado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Servicio'
   *       404:
   *         description: Servicio no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { descripcion, importe } = req.body;
      
      const servicio = await Servicio.findById(id);
      if (!servicio) {
        throw createError('Servicio no encontrado', 404);
      }
      
      const updateData = {};
      if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
      if (importe !== undefined) updateData.importe = parseFloat(importe);
      
      const servicioActualizado = await servicio.update(updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Servicio actualizado exitosamente',
        data: servicioActualizado
      });
    } catch (error) {
      if (error.message.includes('Ya existe un servicio')) {
        next(createError(error.message, 409));
      } else {
        next(error);
      }
    }
  }

  /**
   * @swagger
   * /api/servicios/{id}:
   *   delete:
   *     summary: Eliminar un servicio (soft delete)
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio
   *     responses:
   *       200:
   *         description: Servicio eliminado exitosamente
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
   *                   example: Servicio eliminado exitosamente
   *       404:
   *         description: Servicio no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       400:
   *         description: No se puede eliminar el servicio
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const servicio = await Servicio.findById(id);
      if (!servicio) {
        throw createError('Servicio no encontrado', 404);
      }
      
      if (!servicio.activo) {
        throw createError('El servicio ya está eliminado', 400);
      }
      
      await servicio.softDelete();
      
      res.status(200).json({
        status: 'success',
        message: 'Servicio eliminado exitosamente'
      });
    } catch (error) {
      if (error.message.includes('está siendo usado')) {
        next(createError(error.message, 400));
      } else {
        next(error);
      }
    }
  }

  /**
   * @swagger
   * /api/servicios/{id}/restore:
   *   patch:
   *     summary: Restaurar un servicio eliminado
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio
   *     responses:
   *       200:
   *         description: Servicio restaurado exitosamente
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
   *                   example: Servicio restaurado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Servicio'
   *       404:
   *         description: Servicio no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async restore(req, res, next) {
    try {
      const { id } = req.params;
      
      const servicio = await Servicio.findById(id);
      if (!servicio) {
        throw createError('Servicio no encontrado', 404);
      }
      
      if (servicio.activo) {
        throw createError('El servicio ya está activo', 400);
      }
      
      const servicioRestaurado = await servicio.restore();
      
      res.status(200).json({
        status: 'success',
        message: 'Servicio restaurado exitosamente',
        data: servicioRestaurado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiciosController;