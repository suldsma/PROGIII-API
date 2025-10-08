import Usuario from '../models/Usuario.js';
import { createError } from '../middlewares/errorHandler.js';

class UsuariosController {
    
  // Método getAll
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', tipo_usuario = null, includeInactive = false } = req.query;
      const canSeeInactive = includeInactive === 'true';
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        tipoUsuario: tipo_usuario ? parseInt(tipo_usuario) : null,
        includeInactive: canSeeInactive
      };
      
      const result = await Usuario.findAll(options);
      
      res.status(200).json({
        status: 'success',
        data: result.usuarios,
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
      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Método create
  static async create(req, res, next) {
    try {
      const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;
      
      const nuevoUsuario = await Usuario.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        nombre_usuario: nombre_usuario.trim(),
        contrasenia,
        tipo_usuario: parseInt(tipo_usuario),
        celular: celular || null,
        foto: foto || null
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Usuario creado exitosamente',
        data: nuevoUsuario
      });
    } catch (error) {
      if (error.message.includes('Ya existe un usuario') || error.message.includes('Tipo de usuario inválido')) {
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
      const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;
      
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }
      
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (apellido !== undefined) updateData.apellido = apellido.trim();
      if (nombre_usuario !== undefined) updateData.nombre_usuario = nombre_usuario.trim();
      if (contrasenia !== undefined && contrasenia.trim() !== '') updateData.contrasenia = contrasenia;
      if (tipo_usuario !== undefined) updateData.tipo_usuario = parseInt(tipo_usuario);
      if (celular !== undefined) updateData.celular = celular;
      if (foto !== undefined) updateData.foto = foto;
      
      const usuarioActualizado = await usuario.update(updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      if (error.message.includes('Ya existe un usuario') || error.message.includes('Tipo de usuario inválido')) {
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
      
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }
      
      if (!usuario.activo) {
        throw createError('El usuario ya está eliminado', 400);
      }
      
      await usuario.softDelete();
      
      res.status(200).json({
        status: 'success',
        message: 'Usuario eliminado exitosamente'
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
      
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }
      
      if (usuario.activo) {
        throw createError('El usuario ya está activo', 400);
      }
      
      const usuarioRestaurado = await usuario.restore();
      
      res.status(200).json({
        status: 'success',
        message: 'Usuario restaurado exitosamente',
        data: usuarioRestaurado
      });
    } catch (error) {
      if (error.message.includes('ya existe un usuario')) {
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
      const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo } = req.body;
      
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      const updateData = {};
      
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (apellido !== undefined) updateData.apellido = apellido.trim();
      if (nombre_usuario !== undefined) updateData.nombre_usuario = nombre_usuario.trim();
      if (contrasenia !== undefined && contrasenia.trim() !== '') updateData.contrasenia = contrasenia;
      if (tipo_usuario !== undefined) updateData.tipo_usuario = parseInt(tipo_usuario);
      if (celular !== undefined) updateData.celular = celular;
      if (foto !== undefined) updateData.foto = foto;
      if (activo !== undefined) updateData.activo = activo;

      const usuarioActualizado = await usuario.update(updateData);

      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado parcialmente exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      if (error.message.includes('Ya existe un usuario') || error.message.includes('Tipo de usuario inválido')) {
        next(createError(error.message, 400));
      } else {
        next(error);
      }
    }
  }

  // Método getStatsByType - obtiene estadísticas de usuarios por tipo
  static async getStatsByType(req, res, next) {
    try {
      const stats = await Usuario.getStatsByType();
      
      res.status(200).json({
        status: 'success',
        message: 'Estadísticas de usuarios obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UsuariosController;