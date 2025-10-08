// src/controllers/serviciosController.js

import Servicio from '../models/Servicio.js'; 
import { createError } from '../middlewares/errorHandler.js';
import { ROLES } from '../middlewares/auth.js'; 

class ServiciosController {
    
    static async getMostUsed(req, res, next) {
        try {
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
    
    // [GET] /api/servicios 
    static async getAll(req, res, next) {
        try {
            // Lógica de permisos para incluir inactivos: 
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

    // [GET] /api/servicios/:id 
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            let servicio;

            // CLIENTE (ROLES.CLIENTE) solo puede ver servicios activos
            if (req.user.tipo_usuario === ROLES.CLIENTE) {
                servicio = await Servicio.findActiveById(id);
            } else {
                servicio = await Servicio.findById(id);
            }
            
            if (!servicio) {
                return next(createError('Servicio no encontrado.', 404));
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Servicio obtenido exitosamente.',
                data: servicio.toJSON() 
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /api/servicios 
    static async create(req, res, next) {
        try {
            const { descripcion, importe } = req.body;
            
            const nuevoServicio = await Servicio.create({
                descripcion,
                importe
            });
            
            res.status(201).json({
                status: 'success',
                message: 'Servicio creado exitosamente.',
                data: nuevoServicio.toJSON()
            });
        } catch (error) {
            next(error); 
        }
    }

    // [PUT] y [PATCH] /api/servicios/:id
    // Ambos métodos usan la misma lógica de actualización en el Controller, 
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
                data: servicioActualizado.toJSON() 
            });
        } catch (error) {
            next(error);
        }
    }

    // [PATCH] /api/servicios/:id 
    static async partialUpdate(req, res, next) {
        return ServiciosController.update(req, res, next);
    }
    
    // [DELETE] /api/servicios/:id 
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
                data: servicioRestaurado.toJSON() 
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ServiciosController;