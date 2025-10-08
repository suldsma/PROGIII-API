import Salon from '../models/Salon.js';
import { createError } from '../middlewares/errorHandler.js';

class SalonesController {
    
  // Método getAll
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', includeInactive = false } = req.query;
      const canSeeInactive = req.user.tipo === 1 && includeInactive === 'true';
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        includeInactive: canSeeInactive
      };
      
      const result = await Salon.findAll(options);
      
      res.status(200).json({
        status: 'success',
        data: result.salones,
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
      const salon = req.user.tipo === 1 
        ? await Salon.findById(id)
        : await Salon.findActiveById(id);
      
      if (!salon) {
        throw createError('Salón no encontrado', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: salon
      });
    } catch (error) {
      next(error);
    }
  }

  // Método create
  static async create(req, res, next) {
    try {
      const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;
      
      const nuevoSalon = await Salon.create({
        titulo: titulo.trim(),
        direccion: direccion.trim(),
        latitud: latitud || null,
        longitud: longitud || null,
        capacidad: capacidad || null,
        importe: parseFloat(importe)
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Salón creado exitosamente',
        data: nuevoSalon
      });
    } catch (error) {
      if (error.message.includes('Ya existe un salón')) {
        next(createError(error.message, 409));
      } else {
        next(error);
      }
    }
  }

  // Método update (PUT - actualización completa)
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;
      
      const salon = await Salon.findById(id);
      if (!salon) {
        throw createError('Salón no encontrado', 404);
      }
      
      const updateData = {};
      if (titulo !== undefined) updateData.titulo = titulo.trim();
      if (direccion !== undefined) updateData.direccion = direccion.trim();
      if (latitud !== undefined) updateData.latitud = latitud;
      if (longitud !== undefined) updateData.longitud = longitud;
      if (capacidad !== undefined) updateData.capacidad = capacidad;
      if (importe !== undefined) updateData.importe = parseFloat(importe);
      
      const salonActualizado = await salon.update(updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Salón actualizado exitosamente',
        data: salonActualizado
      });
    } catch (error) {
      if (error.message.includes('Ya existe un salón')) {
        next(createError(error.message, 409));
      } else {
        next(error);
      }
    }
  }

  // Método delete
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const salon = await Salon.findById(id);
      if (!salon) {
        throw createError('Salón no encontrado', 404);
      }
      
      if (!salon.activo) {
        throw createError('El salón ya está eliminado', 400);
      }
      
      await salon.softDelete();
      
      res.status(200).json({
        status: 'success',
        message: 'Salón eliminado exitosamente'
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
      
      const salon = await Salon.findById(id);
      if (!salon) {
        throw createError('Salón no encontrado', 404);
      }
      
      if (salon.activo) {
        throw createError('El salón ya está activo', 400);
      }
      
      const salonRestaurado = await salon.restore();
      
      res.status(200).json({
        status: 'success',
        message: 'Salón restaurado exitosamente',
        data: salonRestaurado
      });
    } catch (error) {
      next(error);
    }
  }

  // Método partialUpdate (PATCH - actualización parcial)
  static async partialUpdate(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, direccion, latitud, longitud, capacidad, importe, activo } = req.body;
      
      const salon = await Salon.findById(id);
      if (!salon) {
        throw createError('Salón no encontrado', 404);
      }

      const updateData = {};
      
      if (titulo !== undefined) updateData.titulo = titulo.trim();
      if (direccion !== undefined) updateData.direccion = direccion.trim();
      if (latitud !== undefined) updateData.latitud = latitud;
      if (longitud !== undefined) updateData.longitud = longitud;
      if (capacidad !== undefined) updateData.capacidad = capacidad;
      if (importe !== undefined) updateData.importe = parseFloat(importe);
      if (activo !== undefined) updateData.activo = activo;

      const salonActualizado = await salon.update(updateData);

      res.status(200).json({
        status: 'success',
        message: 'Salón actualizado parcialmente exitosamente',
        data: salonActualizado
      });
    } catch (error) {
      if (error.message.includes('Ya existe un salón')) {
        next(createError(error.message, 409));
      } else {
        next(error);
      }
    }
  }

  // Método getAvailable - obtiene salones disponibles para fecha y turno
  static async getAvailable(req, res, next) {
    try {
      const { fecha, turno_id } = req.query;
      
      if (!fecha || !turno_id) {
        throw createError('Los parámetros fecha y turno_id son requeridos', 400);
      }
      
      const salonesDisponibles = await Salon.getAvailable(fecha, turno_id);
      
      res.status(200).json({
        status: 'success',
        message: 'Salones disponibles obtenidos exitosamente',
        data: salonesDisponibles
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SalonesController;