const { query, transaction } = require('../config/database');

class Servicio {
  constructor(data = {}) {
    this.servicio_id = data.servicio_id;
    this.descripcion = data.descripcion;
    this.importe = data.importe;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.creado = data.creado;
    this.modificado = data.modificado;
  }

  // Obtener todos los servicios con paginación y filtros
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
    
    if (search) {
      whereClause += ' AND descripcion LIKE ?';
      params.push(`%${search}%`);
    }
    
    // Query para obtener servicios
    const serviciosQuery = `
      SELECT servicio_id, descripcion, importe, activo, creado, modificado 
      FROM servicios 
      WHERE ${whereClause}
      ORDER BY creado DESC
      LIMIT ? OFFSET ?
    `;
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM servicios 
      WHERE ${whereClause}
    `;
    
    params.push(limit, offset);
    const countParams = params.slice(0, -2); // Remover limit y offset para el conteo
    
    const [servicios, totalResult] = await Promise.all([
      query(serviciosQuery, params),
      query(countQuery, countParams)
    ]);
    
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return {
      servicios: servicios.map(servicio => new Servicio(servicio)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Buscar servicio por ID
  static async findById(id) {
    const servicios = await query(
      'SELECT servicio_id, descripcion, importe, activo, creado, modificado FROM servicios WHERE servicio_id = ?',
      [id]
    );
    
    return servicios.length > 0 ? new Servicio(servicios[0]) : null;
  }

  // Buscar servicio activo por ID
  static async findActiveById(id) {
    const servicios = await query(
      'SELECT servicio_id, descripcion, importe, activo, creado, modificado FROM servicios WHERE servicio_id = ? AND activo = 1',
      [id]
    );
    
    return servicios.length > 0 ? new Servicio(servicios[0]) : null;
  }

  // Verificar si existe un servicio con la misma descripción
  static async existsByDescripcion(descripcion, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM servicios WHERE descripcion = ? AND activo = 1';
    let params = [descripcion];
    
    if (excludeId) {
      sql += ' AND servicio_id != ?';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result[0].count > 0;
  }

  // Crear nuevo servicio
  static async create(data) {
    const { descripcion, importe } = data;
    
    // Verificar que no existe un servicio con la misma descripción
    const exists = await Servicio.existsByDescripcion(descripcion);
    if (exists) {
      throw new Error('Ya existe un servicio con esta descripción');
    }
    
    const result = await query(
      'INSERT INTO servicios (descripcion, importe, creado, modificado) VALUES (?, ?, NOW(), NOW())',
      [descripcion, importe]
    );
    
    return Servicio.findById(result.insertId);
  }

  // Actualizar servicio
  async update(data) {
    const { descripcion, importe } = data;
    const updateFields = [];
    const params = [];
    
    if (descripcion !== undefined) {
      // Verificar que no existe otro servicio con la misma descripción
      const exists = await Servicio.existsByDescripcion(descripcion, this.servicio_id);
      if (exists) {
        throw new Error('Ya existe un servicio con esta descripción');
      }
      
      updateFields.push('descripcion = ?');
      params.push(descripcion);
    }
    
    if (importe !== undefined) {
      updateFields.push('importe = ?');
      params.push(importe);
    }
    
    if (updateFields.length === 0) {
      return this;
    }
    
    updateFields.push('modificado = NOW()');
    params.push(this.servicio_id);
    
    await query(
      `UPDATE servicios SET ${updateFields.join(', ')} WHERE servicio_id = ?`,
      params
    );
    
    return Servicio.findById(this.servicio_id);
  }

  // Soft delete - marcar como inactivo
  async softDelete() {
    // Verificar si el servicio está siendo usado en reservas activas
    const reservasActivas = await query(
      `SELECT COUNT(*) as count 
       FROM reservas_servicios rs 
       INNER JOIN reservas r ON rs.reserva_id = r.reserva_id 
       WHERE rs.servicio_id = ? AND r.activo = 1`,
      [this.servicio_id]
    );
    
    if (reservasActivas[0].count > 0) {
      throw new Error('No se puede eliminar el servicio porque está siendo usado en reservas activas');
    }
    
    await query(
      'UPDATE servicios SET activo = 0, modificado = NOW() WHERE servicio_id = ?',
      [this.servicio_id]
    );
    
    return true;
  }

  // Restaurar servicio
  async restore() {
    await query(
      'UPDATE servicios SET activo = 1, modificado = NOW() WHERE servicio_id = ?',
      [this.servicio_id]
    );
    
    return Servicio.findById(this.servicio_id);
  }

  // Convertir a JSON limpio
  toJSON() {
    return {
      servicio_id: this.servicio_id,
      descripcion: this.descripcion,
      importe: parseFloat(this.importe),
      activo: this.activo,
      creado: this.creado,
      modificado: this.modificado
    };
  }
}

module.exports = Servicio;