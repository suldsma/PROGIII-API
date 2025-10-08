import { query } from '../config/database.js';

class Salon {
  constructor(data = {}) {
    this.salon_id = data.salon_id || null;
    this.titulo = data.titulo || '';
    this.direccion = data.direccion || '';
    this.latitud = data.latitud || null;
    this.longitud = data.longitud || null;
    this.capacidad = data.capacidad || null;
    this.importe = data.importe || 0;
    this.activo = data.activo !== undefined ? Boolean(data.activo) : true;
    this.creado = data.creado || null;
    this.modificado = data.modificado || null;
  }

  /**
   * Obtener todos los salones con paginación y filtros
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      includeInactive = false 
    } = options;
    
    const offset = (page - 1) * limit;
    
    let whereClause = includeInactive ? '1=1' : 'activo = 1';
    let params = [];
    
    if (search && search.trim()) {
      whereClause += ' AND (titulo LIKE ? OR direccion LIKE ?)';
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam);
    }
    
    try {
      const salonesQuery = `
        SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado 
        FROM salones 
        WHERE ${whereClause}
        ORDER BY activo DESC, titulo ASC
        LIMIT ? OFFSET ?
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM salones 
        WHERE ${whereClause}
      `;
      
      const salonesParams = [...params, limit, offset];
      const countParams = [...params];
      
      const [salones, totalResult] = await Promise.all([
        query(salonesQuery, salonesParams),
        query(countQuery, countParams)
      ]);
      
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        salones: salones.map(salon => new Salon(salon)),
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
      throw new Error('Error al obtener salones');
    }
  }

  /**
   * Buscar salón por ID (incluye inactivos)
   */
  static async findById(id) {
    try {
      const salones = await query(
        'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE salon_id = ?',
        [id]
      );
      
      return salones.length > 0 ? new Salon(salones[0]) : null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw new Error('Error al buscar salón');
    }
  }

  /**
   * Buscar salón activo por ID
   */
  static async findActiveById(id) {
    try {
      const salones = await query(
        'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE salon_id = ? AND activo = 1',
        [id]
      );
      
      return salones.length > 0 ? new Salon(salones[0]) : null;
    } catch (error) {
      console.error('Error en findActiveById:', error);
      throw new Error('Error al buscar salón activo');
    }
  }

  /**
   * Verifica si existe un salón con el mismo título y dirección
   */
  static async existsByTituloAndDireccion(titulo, direccion, excludeId = null) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM salones WHERE LOWER(TRIM(titulo)) = LOWER(TRIM(?)) AND LOWER(TRIM(direccion)) = LOWER(TRIM(?)) AND activo = 1';
      let params = [titulo, direccion];
      
      if (excludeId) {
        sql += ' AND salon_id != ?';
        params.push(excludeId);
      }
      
      const result = await query(sql, params);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error en existsByTituloAndDireccion:', error);
      throw new Error('Error al verificar existencia del salón');
    }
  }

  /**
   * Crea nuevo salón
   */
  static async create(data) {
    const { titulo, direccion, latitud, longitud, capacidad, importe } = data;
    
    try {
      // Verifica que no existe un salón con el mismo título y dirección
      const exists = await Salon.existsByTituloAndDireccion(titulo, direccion);
      if (exists) {
        throw new Error('Ya existe un salón con este título y dirección');
      }
      
      const result = await query(
        `INSERT INTO salones (titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado) 
         VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          titulo.trim(), 
          direccion.trim(), 
          latitud || null, 
          longitud || null, 
          capacidad || null, 
          parseFloat(importe)
        ]
      );
      
      return await Salon.findById(result.insertId);
    } catch (error) {
      console.error('Error en create:', error);
      if (error.message.includes('Ya existe un salón')) {
        throw error;
      }
      throw new Error('Error al crear salón');
    }
  }

  /**
   * Actualiza salón
   */
  async update(data) {
    const { titulo, direccion, latitud, longitud, capacidad, importe, activo } = data;
    const updateFields = [];
    const params = [];
    
    try {
      if (titulo !== undefined && titulo !== null) {
        const trimmedTitulo = titulo.trim();
        const trimmedDireccion = direccion !== undefined ? direccion.trim() : this.direccion;
        
        if (trimmedTitulo !== this.titulo || trimmedDireccion !== this.direccion) {
          const exists = await Salon.existsByTituloAndDireccion(trimmedTitulo, trimmedDireccion, this.salon_id);
          if (exists) {
            throw new Error('Ya existe un salón con este título y dirección');
          }
        }
        
        updateFields.push('titulo = ?');
        params.push(trimmedTitulo);
      }
      
      if (direccion !== undefined && direccion !== null) {
        updateFields.push('direccion = ?');
        params.push(direccion.trim());
      }
      
      if (latitud !== undefined) {
        updateFields.push('latitud = ?');
        params.push(latitud);
      }
      
      if (longitud !== undefined) {
        updateFields.push('longitud = ?');
        params.push(longitud);
      }
      
      if (capacidad !== undefined) {
        updateFields.push('capacidad = ?');
        params.push(capacidad);
      }
      
      if (importe !== undefined && importe !== null) {
        updateFields.push('importe = ?');
        params.push(parseFloat(importe));
      }
      
      if (activo !== undefined && activo !== null) {
        updateFields.push('activo = ?');
        params.push(Boolean(activo));
      }
      
      if (updateFields.length === 0) {
        return this;
      }
      
      updateFields.push('modificado = NOW()');
      params.push(this.salon_id);
      
      await query(
        `UPDATE salones SET ${updateFields.join(', ')} WHERE salon_id = ?`,
        params
      );
      
      return await Salon.findById(this.salon_id);
    } catch (error) {
      console.error('Error en update:', error);
      if (error.message.includes('Ya existe un salón')) {
        throw error;
      }
      throw new Error('Error al actualizar salón');
    }
  }

  /**
   * Soft delete - marcar como inactivo
   */
  async softDelete() {
    try {
      // Verifica si el salón está siendo usado en reservas activas
      const reservasActivas = await query(
        'SELECT COUNT(*) as count FROM reservas WHERE salon_id = ? AND activo = 1',
        [this.salon_id]
      );
      
      if (reservasActivas[0].count > 0) {
        throw new Error('No se puede eliminar el salón porque tiene reservas activas');
      }
      
      await query(
        'UPDATE salones SET activo = 0, modificado = NOW() WHERE salon_id = ?',
        [this.salon_id]
      );
      
      this.activo = false;
      return true;
    } catch (error) {
      console.error('Error en softDelete:', error);
      if (error.message.includes('tiene reservas activas')) {
        throw error;
      }
      throw new Error('Error al eliminar salón');
    }
  }

  /**
   * Restaura salón eliminado
   */
  async restore() {
    try {
      await query(
        'UPDATE salones SET activo = 1, modificado = NOW() WHERE salon_id = ?',
        [this.salon_id]
      );
      
      return await Salon.findById(this.salon_id);
    } catch (error) {
      console.error('Error en restore:', error);
      throw new Error('Error al restaurar salón');
    }
  }

  /**
   * Verifica si el salón está activo
   */
  isActive() {
    return Boolean(this.activo);
  }

  /**
   * Obtiene salones disponibles para una fecha y turno específicos
   */
  static async getAvailable(fecha, turnoId) {
    try {
      const salones = await query(`
        SELECT s.salon_id, s.titulo, s.direccion, s.capacidad, s.importe
        FROM salones s
        WHERE s.activo = 1
        AND s.salon_id NOT IN (
          SELECT salon_id 
          FROM reservas 
          WHERE fecha_reserva = ? 
          AND turno_id = ? 
          AND activo = 1
        )
        ORDER BY s.titulo ASC
      `, [fecha, turnoId]);
      
      return salones.map(salon => new Salon(salon));
    } catch (error) {
      console.error('Error en getAvailable:', error);
      throw new Error('Error al obtener salones disponibles');
    }
  }

  /**
   * Convertir a JSON limpio para respuestas de API
   */
  toJSON() {
    return {
      salon_id: this.salon_id,
      titulo: this.titulo,
      direccion: this.direccion,
      latitud: this.latitud ? parseFloat(this.latitud) : null,
      longitud: this.longitud ? parseFloat(this.longitud) : null,
      capacidad: this.capacidad,
      importe: parseFloat(this.importe),
      activo: Boolean(this.activo),
      creado: this.creado,
      modificado: this.modificado
    };
  }
}

export default Salon;