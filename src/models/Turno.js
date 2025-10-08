import { query } from '../config/database.js';

class Turno {
  constructor(data = {}) {
    this.turno_id = data.turno_id || null;
    this.orden = data.orden || null;
    this.hora_desde = data.hora_desde || null;
    this.hora_hasta = data.hora_hasta || null;
    this.activo = data.activo !== undefined ? Boolean(data.activo) : true;
    this.creado = data.creado || null;
    this.modificado = data.modificado || null;
  }

  /**
   * Obtener todos los turnos con paginación y filtros
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      includeInactive = false 
    } = options;
    
    const offset = (page - 1) * limit;
    
    const whereClause = includeInactive ? '1=1' : 'activo = 1';
    
    try {
      const turnosQuery = `
        SELECT turno_id, orden, hora_desde, hora_hasta, activo, creado, modificado 
        FROM turnos 
        WHERE ${whereClause}
        ORDER BY activo DESC, orden ASC
        LIMIT ? OFFSET ?
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM turnos 
        WHERE ${whereClause}
      `;
      
      const [turnos, totalResult] = await Promise.all([
        query(turnosQuery, [limit, offset]),
        query(countQuery, [])
      ]);
      
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        turnos: turnos.map(turno => new Turno(turno)),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error en findAll:', error);
      throw new Error('Error al obtener turnos');
    }
  }

  /**
   * Buscar turno por ID (incluye inactivos)
   */
  static async findById(id) {
    try {
      const turnos = await query(
        'SELECT turno_id, orden, hora_desde, hora_hasta, activo, creado, modificado FROM turnos WHERE turno_id = ?',
        [id]
      );
      
      return turnos.length > 0 ? new Turno(turnos[0]) : null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw new Error('Error al buscar turno');
    }
  }

  /**
   * Buscar turno activo por ID
   */
  static async findActiveById(id) {
    try {
      const turnos = await query(
        'SELECT turno_id, orden, hora_desde, hora_hasta, activo, creado, modificado FROM turnos WHERE turno_id = ? AND activo = 1',
        [id]
      );
      
      return turnos.length > 0 ? new Turno(turnos[0]) : null;
    } catch (error) {
      console.error('Error en findActiveById:', error);
      throw new Error('Error al buscar turno activo');
    }
  }

  /**
   * Verifica si existe un turno con solapamiento de horarios
   */
  static async hasOverlap(horaDesde, horaHasta, excludeId = null) {
    try {
      let sql = `
        SELECT COUNT(*) as count 
        FROM turnos 
        WHERE activo = 1
        AND (
          (hora_desde < ? AND hora_hasta > ?)
          OR (hora_desde < ? AND hora_hasta > ?)
          OR (hora_desde >= ? AND hora_hasta <= ?)
        )
      `;
      let params = [horaHasta, horaDesde, horaHasta, horaHasta, horaDesde, horaHasta];
      
      if (excludeId) {
        sql += ' AND turno_id != ?';
        params.push(excludeId);
      }
      
      const result = await query(sql, params);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error en hasOverlap:', error);
      throw new Error('Error al verificar solapamiento de turnos');
    }
  }

  /**
   * Obtiene el siguiente número de orden disponible
   */
  static async getNextOrden() {
    try {
      const result = await query(
        'SELECT COALESCE(MAX(orden), 0) + 1 as nextOrden FROM turnos'
      );
      return result[0].nextOrden;
    } catch (error) {
      console.error('Error en getNextOrden:', error);
      throw new Error('Error al obtener siguiente orden');
    }
  }

  /**
   * Crea nuevo turno
   */
  static async create(data) {
    const { orden, hora_desde, hora_hasta } = data;
    
    try {
      // Verifica que hora_hasta sea posterior a hora_desde
      if (hora_desde >= hora_hasta) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio');
      }
      
      // Verifica solapamiento de horarios
      const hasOverlap = await Turno.hasOverlap(hora_desde, hora_hasta);
      if (hasOverlap) {
        throw new Error('El horario se solapa con otro turno existente');
      }
      
      // Si no se proporciona orden, obtiene el siguiente disponible
      const ordenFinal = orden || await Turno.getNextOrden();
      
      const result = await query(
        'INSERT INTO turnos (orden, hora_desde, hora_hasta, activo, creado, modificado) VALUES (?, ?, ?, 1, NOW(), NOW())',
        [ordenFinal, hora_desde, hora_hasta]
      );
      
      return await Turno.findById(result.insertId);
    } catch (error) {
      console.error('Error en create:', error);
      if (error.message.includes('se solapa') || error.message.includes('debe ser posterior')) {
        throw error;
      }
      throw new Error('Error al crear turno');
    }
  }

  /**
   * Actualiza turno
   */
  async update(data) {
    const { orden, hora_desde, hora_hasta, activo } = data;
    const updateFields = [];
    const params = [];
    
    try {
      // Si se actualizan los horarios, verifica validez y solapamiento
      const newHoraDesde = hora_desde !== undefined ? hora_desde : this.hora_desde;
      const newHoraHasta = hora_hasta !== undefined ? hora_hasta : this.hora_hasta;
      
      if (hora_desde !== undefined || hora_hasta !== undefined) {
        if (newHoraDesde >= newHoraHasta) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }
        
        const hasOverlap = await Turno.hasOverlap(newHoraDesde, newHoraHasta, this.turno_id);
        if (hasOverlap) {
          throw new Error('El horario se solapa con otro turno existente');
        }
      }
      
      if (orden !== undefined && orden !== null) {
        updateFields.push('orden = ?');
        params.push(orden);
      }
      
      if (hora_desde !== undefined && hora_desde !== null) {
        updateFields.push('hora_desde = ?');
        params.push(hora_desde);
      }
      
      if (hora_hasta !== undefined && hora_hasta !== null) {
        updateFields.push('hora_hasta = ?');
        params.push(hora_hasta);
      }
      
      if (activo !== undefined && activo !== null) {
        updateFields.push('activo = ?');
        params.push(Boolean(activo));
      }
      
      if (updateFields.length === 0) {
        return this;
      }
      
      updateFields.push('modificado = NOW()');
      params.push(this.turno_id);
      
      await query(
        `UPDATE turnos SET ${updateFields.join(', ')} WHERE turno_id = ?`,
        params
      );
      
      return await Turno.findById(this.turno_id);
    } catch (error) {
      console.error('Error en update:', error);
      if (error.message.includes('se solapa') || error.message.includes('debe ser posterior')) {
        throw error;
      }
      throw new Error('Error al actualizar turno');
    }
  }

  /**
   * Soft delete - marcar como inactivo
   */
  async softDelete() {
    try {
      // Verifica si el turno está siendo usado en reservas activas
      const reservasActivas = await query(
        'SELECT COUNT(*) as count FROM reservas WHERE turno_id = ? AND activo = 1',
        [this.turno_id]
      );
      
      if (reservasActivas[0].count > 0) {
        throw new Error('No se puede eliminar el turno porque tiene reservas activas');
      }
      
      await query(
        'UPDATE turnos SET activo = 0, modificado = NOW() WHERE turno_id = ?',
        [this.turno_id]
      );
      
      this.activo = false;
      return true;
    } catch (error) {
      console.error('Error en softDelete:', error);
      if (error.message.includes('tiene reservas activas')) {
        throw error;
      }
      throw new Error('Error al eliminar turno');
    }
  }

  /**
   * Restaura turno eliminado
   */
  async restore() {
    try {
      // Verifica que no haya solapamiento al restaurar
      const hasOverlap = await Turno.hasOverlap(this.hora_desde, this.hora_hasta, this.turno_id);
      if (hasOverlap) {
        throw new Error('No se puede restaurar: el horario se solapa con otro turno activo');
      }
      
      await query(
        'UPDATE turnos SET activo = 1, modificado = NOW() WHERE turno_id = ?',
        [this.turno_id]
      );
      
      return await Turno.findById(this.turno_id);
    } catch (error) {
      console.error('Error en restore:', error);
      if (error.message.includes('se solapa')) {
        throw error;
      }
      throw new Error('Error al restaurar turno');
    }
  }

  /**
   * Verifica si el turno está activo
   */
  isActive() {
    return Boolean(this.activo);
  }

  /**
   * Obtiene turnos disponibles para una fecha y salón específicos
   */
  static async getAvailable(fecha, salonId) {
    try {
      const turnos = await query(`
        SELECT t.turno_id, t.orden, t.hora_desde, t.hora_hasta
        FROM turnos t
        WHERE t.activo = 1
        AND t.turno_id NOT IN (
          SELECT turno_id 
          FROM reservas 
          WHERE fecha_reserva = ? 
          AND salon_id = ? 
          AND activo = 1
        )
        ORDER BY t.orden ASC
      `, [fecha, salonId]);
      
      return turnos.map(turno => new Turno(turno));
    } catch (error) {
      console.error('Error en getAvailable:', error);
      throw new Error('Error al obtener turnos disponibles');
    }
  }

  /**
   * Formatea hora para mostrar (HH:MM)
   */
  formatHora(hora) {
    if (!hora) return null;
    // hora viene como "HH:MM:SS" de MySQL
    return hora.substring(0, 5); // retorna "HH:MM"
  }

  /**
   * Convertir a JSON limpio para respuestas de API
   */
  toJSON() {
    return {
      turno_id: this.turno_id,
      orden: this.orden,
      hora_desde: this.formatHora(this.hora_desde) || this.hora_desde,
      hora_hasta: this.formatHora(this.hora_hasta) || this.hora_hasta,
      activo: Boolean(this.activo),
      creado: this.creado,
      modificado: this.modificado
    };
  }
}

export default Turno;