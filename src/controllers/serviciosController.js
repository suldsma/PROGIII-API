// src/controllers/serviciosController.js

import Servicio from '../models/Servicio.js'; 
import { createError } from '../middlewares/errorHandler.js';
// Asegúrate de que este import apunte al archivo donde definiste ROLES (ej: auth.js)
import { ROLES } from '../middlewares/auth.js'; 

class ServiciosController {
    
    // [GET] /api/servicios/stats/most-used
    // El middleware (validation.js) ya valida y convierte 'limit' a número.
    static async getMostUsed(req, res, next) {
        try {
            // El valor ya es un número gracias a 'toInt()' en el middleware
            const limit = parseInt(req.query.limit) || 5;

            const serviciosMasUsados = await Servicio.getMostUsed(limit);

            res.status(200).json({
                status: 'success',
                message: `Top ${limit} servicios más utilizados obtenidos exitosamente.`,
                data: serviciosMasUsados
            });
        } catch (error) {
            next(error);
        }
    }
    
    // [GET] /api/servicios (Browse)
    static async getAll(req, res, next) {
        try {
            // Lógica de permisos para incluir inactivos: 
            // Solo si el usuario NO es CLIENTE Y se solicitó explícitamente includeInactive=true
            const isAdminOrEmployee = req.user.tipo_usuario !== ROLES.CLIENTE;
            const includeInactive = isAdminOrEmployee && (req.query.includeInactive === 'true');
            
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search || '',
                includeInactive: includeInactive 
            };
            
            const result = await Servicio.findAll(options);
            
            res.status(200).json({
                status: 'success',
                message: 'Lista de servicios obtenida exitosamente.',
                data: result.servicios,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] /api/servicios/:id (Read)
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            let servicio;

            // CLIENTE (ROLES.CLIENTE) solo puede ver servicios activos
            if (req.user.tipo_usuario === ROLES.CLIENTE) {
                servicio = await Servicio.findActiveById(id);
            } else {
                // ADMIN/EMPLEADO pueden ver activos e inactivos
                servicio = await Servicio.findById(id);
            }
            
            if (!servicio) {
                // Not found puede significar que no existe o que está inactivo y el usuario no es Admin/Empleado
                return next(createError('Servicio no encontrado.', 404));
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Servicio obtenido exitosamente.',
                data: servicio.toJSON() // Uso consistente de .toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /api/servicios (Add)
    static async create(req, res, next) {
        try {
            // El middleware ya validó y limpió la data
            const { descripcion, importe } = req.body;
            
            const nuevoServicio = await Servicio.create({
                descripcion,
                importe
            });
            
            res.status(201).json({
                status: 'success',
                message: 'Servicio creado exitosamente.',
                data: nuevoServicio.toJSON() // Uso consistente de .toJSON()
            });
        } catch (error) {
            // El error es propagado. El Modelo debe lanzar createError(..., 409) para conflictos.
            next(error); 
        }
    }

    // [PUT] y [PATCH] /api/servicios/:id
    // Ambos métodos usan la misma lógica de actualización en el Controller, 
    // confiando en que el middleware (validation.js) filtró los datos necesarios.
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const data = req.body;
            
            const servicio = await Servicio.findById(id);
            if (!servicio) {
                return next(createError('Servicio no encontrado.', 404));
            }
            
            const servicioActualizado = await servicio.update(data);
            
            res.status(200).json({
                status: 'success',
                message: 'Servicio actualizado exitosamente.',
                data: servicioActualizado.toJSON() // Uso consistente de .toJSON()
            });
        } catch (error) {
            // El error es propagado. El Modelo debe lanzar createError(..., 409) para conflictos.
            next(error);
        }
    }

    // [PATCH] /api/servicios/:id (Actualización Parcial)
    static async partialUpdate(req, res, next) {
        // La lógica es idéntica a 'update', ya que el modelo maneja qué campos se actualizan.
        return ServiciosController.update(req, res, next);
    }
    
    // [DELETE] /api/servicios/:id (Soft Delete)
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            
            const servicio = await Servicio.findById(id);
            if (!servicio) {
                return next(createError('Servicio no encontrado.', 404));
            }
            
            if (!servicio.activo) {
                return next(createError('El servicio ya está inactivo.', 400));
            }
            
            await servicio.softDelete();
            
            res.status(200).json({
                status: 'success',
                message: 'Servicio eliminado (soft delete) exitosamente.'
            });
        } catch (error) {
            // El error es propagado. El Modelo debe lanzar createError(..., 400) si tiene reservas activas.
            next(error); 
        }
    }
    
    // [PATCH] /api/servicios/:id/restore
    static async restore(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            
            const servicio = await Servicio.findById(id);
            if (!servicio) {
                return next(createError('Servicio no encontrado.', 404));
            }
            
            if (servicio.activo) {
                return next(createError('El servicio ya está activo.', 400));
            }
            
            const servicioRestaurado = await servicio.restore();
            
            res.status(200).json({
                status: 'success',
                message: 'Servicio restaurado exitosamente.',
                data: servicioRestaurado.toJSON() // Uso consistente de .toJSON()
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ServiciosController;