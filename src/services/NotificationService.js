// src/services/NotificationService.js

// Import desde carpeta utiles
import { compileTemplate } from '../utiles/handlebarsCompiler.js';
import { createError } from '../middlewares/errorHandler.js'; 
import { query } from '../config/database.js'; 

class NotificationService {

    /**
     * Procesa y registra una notificación de confirmación de reserva.
     * @param {object} reserva - Objeto con todos los datos de la reserva
     * @returns {boolean} Indica si la notificación fue registrada con éxito.
     */
    static async sendReservationConfirmation(reserva) {
        try {
            // Valida que la reserva contenga los datos necesarios
            if (!reserva || !reserva.usuario_id) {
                throw createError('Datos de reserva insuficientes para la notificación', 400);
            }

            // 1. Prepara los datos para la plantilla
            const templateData = {
                titulo: `Reserva #${reserva.reserva_id} Confirmada`,
                mensaje: `Su reserva para el evento de ${reserva.tematica || 'su celebración'} ha sido confirmada con éxito.`,
                usuarioNombre: reserva.usuario_nombre || 'Cliente', 
                reservaId: reserva.reserva_id,
                fechaReserva: reserva.fecha_reserva,
                turno: reserva.turno || { hora_desde: 'N/A', hora_hasta: 'N/A' },
                salon: reserva.salon || { nombre: 'N/A' },
                tematica: reserva.tematica || 'Sin temática especificada',
                servicios: reserva.servicios || [],
                importeTotal: reserva.importe_total || 0,
            };

            // 2. Compila la plantilla HTML
            const htmlBody = compileTemplate('reservaConfirmada', templateData);
            
            // 3. Guarda la notificación en la base de datos
            await query(
                `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_reserva, leida) 
                 VALUES (?, ?, ?, ?, ?, 0)`,
                [
                    reserva.usuario_id,
                    'RESERVA_CONFIRMADA',
                    templateData.titulo,
                    htmlBody, 
                    JSON.stringify(reserva) 
                ]
            );

            console.log(`[NOTIFICACIÓN] ✅ HTML generado y guardado para Usuario ID: ${reserva.usuario_id}`);
            return true;
            
        } catch (error) {
            console.error('[NotificationService] ❌ Error al generar/guardar notificación:', error.message);
            // No lanzamos el error para que no afecte el flujo principal
            return false;
        }
    }

    /**
     * Obtiene todas las notificaciones de un usuario
     * @param {number} usuarioId - ID del usuario
     * @param {boolean} soloNoLeidas - Si es true, solo retorna notificaciones no leídas
     * @returns {Array} Array de notificaciones
     */
    static async getByUsuario(usuarioId, soloNoLeidas = false) {
        try {
            let sql = `
                SELECT notificacion_id, usuario_id, tipo, titulo, mensaje, 
                       datos_reserva, leida, creado, modificado
                FROM notificaciones 
                WHERE usuario_id = ?
            `;
            
            const params = [usuarioId];
            
            if (soloNoLeidas) {
                sql += ' AND leida = 0';
            }
            
            sql += ' ORDER BY creado DESC';
            
            const notificaciones = await query(sql, params);
            return notificaciones;
            
        } catch (error) {
            console.error('[NotificationService] Error al obtener notificaciones:', error);
            throw createError('Error al obtener notificaciones', 500);
        }
    }

    /**
     * Marca una notificación como leída
     * @param {number} notificacionId - ID de la notificación
     * @param {number} usuarioId - ID del usuario (para validar permisos)
     * @returns {boolean}
     */
    static async marcarComoLeida(notificacionId, usuarioId) {
        try {
            const result = await query(
                `UPDATE notificaciones 
                 SET leida = 1, modificado = NOW() 
                 WHERE notificacion_id = ? AND usuario_id = ?`,
                [notificacionId, usuarioId]
            );
            
            return result.affectedRows > 0;
            
        } catch (error) {
            console.error('[NotificationService] Error al marcar como leída:', error);
            throw createError('Error al actualizar notificación', 500);
        }
    }
}

export default NotificationService;