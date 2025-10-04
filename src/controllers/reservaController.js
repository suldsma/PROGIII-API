import asyncHandler from '../middlewares/asyncHandler.js';
import Reserva from '../models/Reserva.js';
import { createError } from '../middlewares/errorHandler.js';

const CLIENTE_ROLE_ID = 3 

//CREA UNA NUEVA RESERVA PARA EL SALÓN
const createReserva = asyncHandler(async(req, res) =>{
    const { salon_id, fecha, hora_inicio, hora_fin, servicios_ids} = req.body;

    let cliente_id;
    if (req.user.rol_id === CLIENTE_ROLE_ID){
        cliente_id = req.user.user_id;
    }else{
        if (!req.body.cliente_id){
            throw createError('El rol actual requiere especificar un cliente_id en el cuerpo de la petición.',400);
        }
        cliente_id = req.body.cliente_id;
    };
    if (!cliente_id || !salon_id || !fecha || !hora_inicio) {
        throw createError('Faltan datos obligatorios para crear la reserva.', 400);
    }

const newReservaData = {
        cliente_id,
        salon_id,
        fecha,
        hora_inicio,
        hora_fin,
        servicios_ids,
        estado: 'PENDIENTE',
    };

    const newReserva = await Reserva.create(newReservaData);
    res.status(201).json({
        status: 'success',
        message: 'Reserva creada exitosamente.',
        data: newReserva.toJSON()
    });
});

//OBTIENE LOS DETALLES DE UNA RESERVA ESPECIFICA
const getReservaById = asyncHandler(async(req, res) => {
    const {id} = req.params;
    const reserva = await Reserva.findById(id);
    if (!reserva) {
        throw createError(`Reserva con ID ${id} no encontrada.`, 404);
    }
    if (req.user.rol_id === CLIENTE_ROLE_ID && reserva.cliente_id != req.user.user_id){
        throw createError('No está autorizado para ver los detalles de esta reserva.', 403);
    }
    res.status(200).json({
        status: 'success',
        data: reserva.toJSON()
    });
});

//OBTIENE TODAS LAS RESERVAS HECHAS POR EL CLIENTE AUTENTICADO
const getReservaByCliente = asyncHandler(async(req, res) => {
    const cliente_id = req.user.user_id;
    const reservas = await Reserva.findAllByClienteId(cliente_id);
    res.status(200).json ({
        status: 'success',
        results: reservas.length,
        data: reservas.map(r => r.toJSON())
    });
});

//OBTENCIÓN DE LAS RESERVAS DEL SISTEMA (ADMIN/EMPLEADO)
const getAllReservas = asyncHandler (async(req, res) => {
    const { page = 1, limit = 10, filters = {}} = req.query;
    let parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const { data: reservas, total } = await Reserva.findAll({page, limit, filters});
    res.status(200).json({
        status: 'success',
        results: reservas.length,
        page: parseInt(page),
        total_items: total,
        data: reservas.map(r => r.toJSON())
    });
});

//cancelación de una reserva(soft delate/ cambio de estado a Cancelada)
const cancelReserva = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const reserva = await Reserva.findById(id);
    if (!reserva){
        throw createError(`Reserva con ID ${id} no encontrada.`, 404);
    }
    try {
        await reserva.cancel(req.user.user_id, req.user.rol_id);
    } catch (error) {
        if (error.message.includes('autorizado')) {
            throw createError(error.message, 403); 
        }
        if (error.message.includes('estado') || error.message.includes('cancelada')) {
            throw createError(error.message, 400); 
        }
        throw error;
    }
    
    res.status(200).json({
        status: 'success',
        message: 'Reserva cancelada exitosamente.',
        data: reserva.toJSON()
    });
});

export default {
    createReserva,
    getReservaById,
    getReservaByCliente,
    getAllReservas,
    cancelReserva,
};