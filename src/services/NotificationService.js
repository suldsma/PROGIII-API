// src/services/NotificationService.js (Ejemplo de Integración)

import { compileTemplate } from '../utils/handlebarsCompiler.js';
import { createError } from '../middlewares/errorHandler.js'; 
import { query } from '../config/database.js'; // Asumiendo que existe

/**
 * Servicio encargado de generar y registrar las notificaciones.
 */
class NotificationService {

    /**
     * Procesa y registra una notificación de confirmación de reserva.
     * @param {object} reserva El objeto con todos los datos necesarios (asumido del Controller/BD)
     */
    static async sendReservationConfirmation(reserva) {
        try {
            if (!reserva || !reserva.usuario_id) {
                throw createError('Datos de reserva insuficientes para la notificación', 500);
            }

            // 1. Preparar los datos para la plantilla
            const templateData = {
                titulo: `Reserva #${reserva.reserva_id} Confirmada`,
                mensaje: `Su reserva para el evento de ${reserva.tematica} ha sido confirmada con éxito.`,
                usuarioNombre: reserva.usuario_nombre, // Se asume que estos datos vienen del JOIN de la reserva
                reservaId: reserva.reserva_id,
                fechaReserva: reserva.fecha_reserva,
                turno: reserva.turno,
                salon: reserva.salon,
                tematica: reserva.tematica,
                servicios: reserva.servicios || [],
                importeTotal: reserva.importe_total ? reserva.importe_total.toFixed(2) : '0.00',
            };

            // 2. Generar el cuerpo HTML usando Handlebars (Cumplimiento del TFI)
            const htmlBody = compileTemplate('reservaConfirmada', templateData);
            
            // 3. Registrar la notificación en la base de datos (tabla notificaciones)
            await query(
                `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_reserva) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    reserva.usuario_id,
                    'RESERVA_CONFIRMADA',
                    templateData.titulo,
                    htmlBody, // Almacena el HTML generado para futura referencia
                    JSON.stringify(reserva) // Guarda el JSON completo de la reserva como metadata
                ]
            );

            console.log(`[NOTIFICACIÓN] HTML generado y guardado para Usuario ${reserva.usuario_id}.`);
            return true;
        } catch (error) {
            // No se lanza el error (para no interrumpir la creación de la reserva), 
            // solo se registra si la notificación falla.
            console.error('[NotificationService] Error al generar/guardar notificación:', error);
            // Podrías decidir registrar un error 500 para el cliente si esto fuera crítico.
            return false;
        }
    }
}

export default NotificationService;