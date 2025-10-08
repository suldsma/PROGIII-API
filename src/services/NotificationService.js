// src/services/NotificationService.js

import { compileTemplate } from '../utils/handlebarsCompiler.js';
import { createError } from '../middlewares/errorHandler.js'; 
import { query } from '../config/database.js'; 

class NotificationService {

    /**
     * Procesa y registra una notificación de confirmación de reserva.
     * @param {object} reserva 
     * @returns {boolean} Indica si la notificación fue registrada con éxito.
     */
    static async sendReservationConfirmation(reserva) {
        try {
            // Validar que la reserva contenga los datos necesarios
            if (!reserva || !reserva.usuario_id) {
                throw createError('Datos de reserva insuficientes para la notificación', 400);
            }

            // 1. Prepara los datos para la plantilla
            const templateData = {
                titulo: `Reserva #${reserva.reserva_id} Confirmada`,
                mensaje: `Su reserva para el evento de ${reserva.tematica} ha sido confirmada con éxito.`,
                usuarioNombre: reserva.usuario_nombre, 
                reservaId: reserva.reserva_id,
                fechaReserva: reserva.fecha_reserva,
                turno: reserva.turno,
                salon: reserva.salon,
                tematica: reserva.tematica,
                servicios: reserva.servicios || [],
                importeTotal: reserva.importe_total ? reserva.importe_total.toFixed(2) : '0.00',
            };

            const htmlBody = compileTemplate('reservaConfirmada', templateData);
            
            await query(
                `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_reserva) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    reserva.usuario_id,
                    'RESERVA_CONFIRMADA',
                    templateData.titulo,
                    htmlBody, 
                    JSON.stringify(reserva) 
                ]
            );

            console.log(`[NOTIFICACIÓN] HTML generado y guardado para Usuario ${reserva.usuario_id}.`);
            return true;
        } catch (error) {
            console.error('[NotificationService] Error al generar/guardar notificación:', error);
            return false;
        }
    }
}

export default NotificationService;
