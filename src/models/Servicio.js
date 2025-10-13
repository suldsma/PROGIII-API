// src/models/Servicio.js
import { query } from '../config/database.js'; // Función para ejecutar queries SQL
import { createError } from '../middlewares/errorHandler.js'; // Utilidad para crear errores HTTP

class Servicio {
  constructor(data = {}) {
    // Mapeo de campos de la base de datos a propiedades de la clase
    this.servicio_id = data.servicio_id || null;
    this.descripcion = data.descripcion || '';
    this.importe = data.importe || 0;
    // Asegura que 'activo' sea un booleano, por defecto true
    this.activo = data.activo !== undefined ? Boolean(data.activo) : true; 
    this.creado = data.creado || null;
    this.modificado = data.modificado || null;
  }

  /**
   * Obtener todos los servicios con paginación y filtros 
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, search = '', includeInactive = false } = options;
    const offset = (page - 1) * limit;
    
    // Condición base para filtrar activos, a menos que se pidan inactivos explícitamente
    let whereClause = includeInactive ? '1=1' : 'activo = 1';
    let params = [];
    
    // Filtro de búsqueda por descripción
    if (search && search.trim()) {
      whereClause += ' AND descripcion LIKE ?';
      params.push(`%${search.trim()}%`);
    }
    
    try {
      // Query de datos con ordenamiento por estado y fecha
      const serviciosQuery = `
        SELECT servicio_id, descripcion, importe, activo, creado, modificado 
        FROM servicios 
        WHERE ${whereClause}
        ORDER BY activo DESC, creado DESC
        LIMIT ? OFFSET ?
      `;
      
      // Query para el conteo total 
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM servicios 
        WHERE ${whereClause}
      `;
      
      // Ejecución paralela de ambas queries
      const [servicios, totalResult] = await Promise.all([
        query(serviciosQuery, [...params, limit, offset]),
        query(countQuery, params)
      ]);
      
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      // Formatea la respuesta
      return {
        servicios: servicios.map(servicio => new Servicio(servicio).toJSON()), 
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
      throw createError('Error al obtener servicios', 500);
    }
  }

  /**
   * Busca servicio por ID (incluye inactivos)
   */
  static async findById(id) {
    try {
      const servicios = await query(
        'SELECT servicio_id, descripcion, importe, activo, creado, modificado FROM servicios WHERE servicio_id = ?',
        [id]
      );
      
      return servicios.length > 0 ? new Servicio(servicios[0]) : null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw createError('Error al buscar servicio', 500);
    }
  }

  /**
   * Busca servicio activo por ID (solo activos)
   */
  static async findActiveById(id) {
    try {
      const servicios = await query(
        'SELECT servicio_id, descripcion, importe, activo, creado, modificado FROM servicios WHERE servicio_id = ? AND activo = 1',
        [id]
      );
      
      return servicios.length > 0 ? new Servicio(servicios[0]) : null;
    } catch (error) {
      console.error('Error en findActiveById:', error);
      throw createError('Error al buscar servicio activo', 500);
    }
  }

  /**
   * Verifica si existe un servicio activo con la misma descripción 
   */
  static async existsByDescripcion(descripcion, excludeId = null) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM servicios WHERE LOWER(TRIM(descripcion)) = LOWER(TRIM(?)) AND activo = 1';
      let params = [descripcion];
      
      if (excludeId) {
        sql += ' AND servicio_id != ?'; 
        params.push(excludeId);
      }
      
      const result = await query(sql, params);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error en existsByDescripcion:', error);
      throw createError('Error al verificar existencia del servicio', 500);
    }
  }

  /**
   * Crea un nuevo servicio en la DB
   */
  static async create(data) {
    const { descripcion, importe } = data;
    
    try {
      // Validación de unicidad antes de insertar
      const exists = await Servicio.existsByDescripcion(descripcion);
      if (exists) {
        throw createError('Ya existe un servicio activo con esta descripción.', 409); // Conflict
      }
      
      // Inserción en la base de datos
      const result = await query(
        'INSERT INTO servicios (descripcion, importe, activo, creado, modificado) VALUES (?, ?, 1, NOW(), NOW())',
        [descripcion.trim(), parseFloat(importe)]
      );
      
      return await Servicio.findById(result.insertId); 
    } catch (error) {
      console.error('Error en create:', error);
      if (error.status === 409) throw error; 
      throw createError('Error al crear servicio', 500);
    }
  }

  /**
   * Actualiza los datos del servicio actual
   */
  async update(data) {
    const { descripcion, importe, activo } = data;
    const updateFields = [];
    const params = [];
    
    try {
      // Lógica para actualizar la descripción 
      if (descripcion !== undefined && descripcion !== null) {
        const trimmedDesc = descripcion.trim();
        // Solo valida unicidad si la descripción ha cambiado
        if (trimmedDesc.toLowerCase() !== this.descripcion.toLowerCase()) {  
          const exists = await Servicio.existsByDescripcion(trimmedDesc, this.servicio_id); 
          if (exists) {
            throw createError('Ya existe otro servicio activo con esta descripción.', 409);
          }
        }
        updateFields.push('descripcion = ?');
        params.push(trimmedDesc);
      }
      
      // Lógica para actualizar el importe
      if (importe !== undefined && importe !== null) {
        updateFields.push('importe = ?');
        params.push(parseFloat(importe));
      }
      
      // Lógica para actualizar el estado de activo/inactivo
      if (activo !== undefined && activo !== null) {
        updateFields.push('activo = ?');
        params.push(Boolean(activo));
      }
      
      if (updateFields.length === 0) {
        return this; // No hay nada que actualizar
      }
      
      updateFields.push('modificado = NOW()');
      params.push(this.servicio_id);
      
      // Ejecución de la actualización
      await query(
        `UPDATE servicios SET ${updateFields.join(', ')} WHERE servicio_id = ?`,
        params
      );
      
      return await Servicio.findById(this.servicio_id);
    } catch (error) {
      console.error('Error en update:', error);
      if (error.status === 409) throw error; 
      throw createError('Error al actualizar servicio', 500);
    }
  }

  /**
   * Soft delete - marca el servicio como inactivo (activo = 0)
   */
  async softDelete() {
    try {
      // Validación de negocio: no se puede eliminar si está en reservas activas
      const reservasActivas = await query(
        `SELECT COUNT(*) as count 
         FROM reservas_servicios rs 
         INNER JOIN reservas r ON rs.reserva_id = r.reserva_id 
         WHERE rs.servicio_id = ? AND r.activo = 1`,
        [this.servicio_id]
      );
      
      if (reservasActivas[0].count > 0) {
        throw createError('No se puede eliminar el servicio porque está siendo usado en reservas activas.', 400); // Bad Request
      }
      
      // Actualización del estado
      await query(
        'UPDATE servicios SET activo = 0, modificado = NOW() WHERE servicio_id = ?',
        [this.servicio_id]
      );
      
      this.activo = false;
      return true;
    } catch (error) {
      console.error('Error en softDelete:', error);
      if (error.status === 400) throw error;
      throw createError('Error al eliminar servicio', 500);
    }
  }

  /**
   * Restaura servicio (activo = 1)
   */
  async restore() {
    try {
      await query(
        'UPDATE servicios SET activo = 1, modificado = NOW() WHERE servicio_id = ?',
        [this.servicio_id]
      );
      
      return await Servicio.findById(this.servicio_id); // Devuelve la instancia restaurada
    } catch (error) {
      console.error('Error en restore:', error);
      throw createError('Error al restaurar servicio', 500);
    }
  }

  /**
   * Obtiene el ranking de servicios activos más utilizados
   */
  static async getMostUsed(limit = 5) {
    try {
      const servicios = await query(`
        SELECT 
          s.servicio_id, s.descripcion, s.importe, s.activo, s.creado, s.modificado,
          COUNT(rs.servicio_id) as uso_count // Conteo de cuántas veces aparece en reservas
        FROM servicios s
        LEFT JOIN reservas_servicios rs ON s.servicio_id = rs.servicio_id
        LEFT JOIN reservas r ON rs.reserva_id = r.reserva_id AND r.activo = 1 // Solo cuenta en reservas activas
        WHERE s.activo = 1 // Solo servicios activos
        GROUP BY s.servicio_id
        ORDER BY uso_count DESC, s.descripcion ASC
        LIMIT ?
      `, [limit]);
      
      return servicios.map(servicio => ({
        ...new Servicio(servicio).toJSON(), 
        uso_count: servicio.uso_count
      }));
    } catch (error) {
      console.error('Error en getMostUsed:', error);
      throw createError('Error al obtener servicios más utilizados', 500);
    }
  }

  /**
   * Formato de objeto para respuestas de API
   */
  toJSON() {
    return {
      servicio_id: this.servicio_id,
      descripcion: this.descripcion,
      importe: parseFloat(this.importe), // Asegura formato numérico
      activo: Boolean(this.activo),
      creado: this.creado,
      modificado: this.modificado
    };
  }
}

export default Servicio;