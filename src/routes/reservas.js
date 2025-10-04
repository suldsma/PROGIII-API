import { Router } from "express";
import reservaController from '../controllers/reservaController.js';
import { verifyToken, requireRole } from "../../src/middlewares/auth.js";
import { validate, validateReservaId, validateReservaCreate } from "../middlewares/validation.js";

const router = Router();

//Crear una nueva reserva

router.post(
    '/',
    verifyToken,
    requireRole([1, 2, 3]),
    validate(validateReservaCreate),
    reservaController.createReserva
);

//Listar reservas del cliente autenticado

router.get(
    '/me',
    verifyToken,
    requireRole([3]),
    reservaController.getReservaByCliente
);

//Listar todas las reservas

router.get(
    '/',
    verifyToken,
    requireRole([1, 2]),
    reservaController.getAllReservas
);

//Obtener detalles de reserva específica

router.get(
    '/:id',
    verifyToken,
    requireRole([1, 2, 3]),
    validate(validateReservaId),
    reservaController.getReservaById
);

//Cancelar reserva

router.delete(
    '/:id',
    verifyToken,
    requireRole([1, 2, 3]),
    validate(validateReservaId),
    reservaController.cancelReserva

);


export default router;