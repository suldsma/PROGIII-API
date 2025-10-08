import Turno from '../models/Turno.js';
import { createError } from '../middlewares/errorHandler.js';

class TurnosController {
    
  // Método getAll
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, includeInactive = false } = req.query;
      const canSeeInactive = req.user.tipo === 1 && includeInactive === 'true';
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        includeInactive: canSeeInactive
      };
      
      const result = await Turno.findAll(options);
      
      res.status(200).json({
        status: 'success',
        data: result.turnos,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Método getById
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const turno = req.user.tipo === 1 
        ? await Turno.findById(id)
        : await Turno.findActiveById(id);
      
      if (!turno) {
        throw createError('Turno no encontrado', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: turno
      });
    } catch (error) {
      next(error);
    }
  }

  // Método create
  static async create(req, res, next) {
    try {
      const { orden, hora_desde, hora_hasta } = req.body;
      
      const nuevoTurno = await Turno.create({
        orden: orden || null,
        hora_desde,
        hora_hasta
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Turno creado exitosamente',
        data: nuevoTurno
      });
    } catch (error) {
      if (error.message.includes('se solapa') || error.message.includes('debe ser posterior')) {
        next(createError(error.message, 400));
      } else {
        next(error);
      }
    }
  }

  // Método update (PUT - actualización completa)
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { orden, hora_desde, hora_hasta } = req.body;
      
      const turno = await Turno.findById(id);
      if (!turno) {
        throw createError('Turno no encontrado', 404);
      }
      
      const updateData = {};
      if (orden !== undefined) updateData.orden = orden;
      if (hora_desde !== undefined) updateData.hora_desde = hora_desde;
      if (hora_hasta !== undefined) updateData.hora_hasta = hora_hasta;
      
      const turnoActualizado = await turno.update(updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Turno actualizado exitosamente',
        data: turnoActualizado
      });
    } catch (error) {
      if (error.message.includes('se solapa') || error.message.includes('debe ser posterior')) {
        next(createError(error.message, 400));
      } else {
        next(error);
      }
    }
  }

  // Método delete
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const turno = await Turno.findById(id);
      if (!turno) {
        throw createError('Turno no encontrado', 404);
      }
      
      if (!turno.activo) {
        throw createError('El turno ya está eliminado', 400);
      }
      
      await turno.softDelete();
      
      res.status(200).json({
        status: 'success',
        message: 'Turno eliminado exitosamente'
      });
    } catch (error) {
      if (error.message.includes('tiene reservas activas')) {
        next(createError(error.message, 400));
      } else {
        next(error);
      }
    }
  }
  
  // Método restore
  static async restore(req, res, next) {
    try {
      const { id } = req.params;
      
      const turno = await Turno.findById(id);
      if (!turno) {
        throw createError('Turno no encontrado', 404);
      }
      
      if (turno.activo) {
        throw createError('El turno ya está activo', 400);
      }
      
      const turnoRestaurado = await turno.restore();
      
      res.status(200).json({
        status: 'success',
        message: 'Turno restaurado exitosamente',
        data: turnoRestaurado
      });
    } catch (error) {
      if (error.message.includes('se solapa')) {
        next(createError(error.message, 400));
      } else {
        next(error);
      }
    }
  }

  // Método partialUpdate (PATCH - actualización parcial)
  static async partialUpdate(req, res, next) {
    try {
      const { id } = req.params;
      const { orden, hora_desde, hora_hasta, activo } = req.body;
      
      const turno = await Turno.findById(id);
      if (!turno) {
        throw createError('Turno no encontrado', 404);
      }

      const updateData = {};
      
      if (orden !== undefined) updateData.orden = orden;
      if (hora_desde !== undefined) updateData.hora_desde = hora_desde;
      if (hora_hasta !== undefined) updateData.hora_hasta = hora_hasta;
      if (activo !== undefined) updateData.activo = activo;

      const turnoActualizado = await turno.update(updateData);

      res.status(200).json({
        status: 'success',
        message: 'Turno actualizado parcialmente exitosamente',
        data: turnoActualizado
      });
    } catch (error) {
      if (error.message.includes('se solapa') || error.message.includes('debe ser posterior')) {
        next(createError(error.message, 400));
      } else {
        next(error);
      }
    }
  }

  // Método getAvailable - obtiene turnos disponibles para fecha y salón
  static async getAvailable(req, res, next) {
    try {
      const { fecha, salon_id } = req.query;
      
      if (!fecha || !salon_id) {
        throw createError('Los parámetros fecha y salon_id son requeridos', 400);
      }
      
      const turnosDisponibles = await Turno.getAvailable(fecha, salon_id);
      
      res.status(200).json({
        status: 'success',
        message: 'Turnos disponibles obtenidos exitosamente',
        data: turnosDisponibles
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TurnosController;