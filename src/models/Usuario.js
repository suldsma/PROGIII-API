import crypto from 'crypto';
import { query } from '../config/database.js';

class Usuario {
  constructor(data = {}) {
    this.usuario_id = data.usuario_id || null;
    this.nombre = data.nombre || '';
    this.apellido = data.apellido || '';
    this.nombre_usuario = data.nombre_usuario || '';
    this.contrasenia = data.contrasenia || '';
    this.tipo_usuario = data.tipo_usuario || 3; // Por defecto: Cliente
    this.celular = data.celular || null;
    this.foto = data.foto || null;
    this.activo = data.activo !== undefined ? Boolean(data.activo) : true;
    this.creado = data.creado || null;
    this.modificado = data.modificado || null;
  }

  /**
   * Obtener todos los usuarios con paginación y filtros
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      tipoUsuario = null,
      includeInactive = false 
    } = options;
    
    const offset = (page - 1) * limit;
    
    let whereClause = includeInactive ? '1=1' : 'activo = 1';
    let params = [];
    
    if (search && search.trim()) {
      whereClause += ' AND (nombre LIKE ? OR apellido LIKE ? OR nombre_usuario LIKE ?)';
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    if (tipoUsuario !== null && tipoUsuario !== undefined) {
      whereClause += ' AND tipo_usuario = ?';
      params.push(tipoUsuario);
    }
    
    try {
      const usuariosQuery = `
        SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, activo, creado, modificado 
        FROM usuarios 
        WHERE ${whereClause}
        ORDER BY activo DESC, apellido ASC, nombre ASC
        LIMIT ? OFFSET ?
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM usuarios 
        WHERE ${whereClause}
      `;
      
      const usuariosParams = [...params, limit, offset];
      const countParams = [...params];
      
      const [usuarios, totalResult] = await Promise.all([
        query(usuariosQuery, usuariosParams),
        query(countQuery, countParams)
      ]);
      
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        usuarios: usuarios.map(usuario => new Usuario(usuario)),
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
      throw new Error('Error al obtener usuarios');
    }
  }

  /**
   * Buscar usuario por ID (incluye inactivos)
   */
  static async findById(id) {
    try {
      const usuarios = await query(
        'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, activo, creado, modificado FROM usuarios WHERE usuario_id = ?',
        [id]
      );
      
      return usuarios.length > 0 ? new Usuario(usuarios[0]) : null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw new Error('Error al buscar usuario');
    }
  }

  /**
   * Buscar usuario activo por ID
   */
  static async findActiveById(id) {
    try {
      const usuarios = await query(
        'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, activo, creado, modificado FROM usuarios WHERE usuario_id = ? AND activo = 1',
        [id]
      );
      
      return usuarios.length > 0 ? new Usuario(usuarios[0]) : null;
    } catch (error) {
      console.error('Error en findActiveById:', error);
      throw new Error('Error al buscar usuario activo');
    }
  }

  /**
   * Buscar usuario por nombre_usuario (email)
   */
  static async findByEmail(email) {
    try {
      const usuarios = await query(
        'SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo, creado, modificado FROM usuarios WHERE nombre_usuario = ? AND activo = 1',
        [email.toLowerCase()]
      );
      
      return usuarios.length > 0 ? new Usuario(usuarios[0]) : null;
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw new Error('Error al buscar usuario por email');
    }
  }

  /**
   * Verifica si existe un usuario con el mismo email
   */
  static async existsByEmail(email, excludeId = null) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM usuarios WHERE LOWER(TRIM(nombre_usuario)) = LOWER(TRIM(?)) AND activo = 1';
      let params = [email];
      
      if (excludeId) {
        sql += ' AND usuario_id != ?';
        params.push(excludeId);
      }
      
      const result = await query(sql, params);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error en existsByEmail:', error);
      throw new Error('Error al verificar existencia del usuario');
    }
  }

  /**
   * Hash de contraseña usando MD5
   */
  static hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  /**
   * Verifica contraseña
   */
  verifyPassword(password) {
    const hashedPassword = Usuario.hashPassword(password);
    return hashedPassword === this.contrasenia;
  }

  /**
   * Crea nuevo usuario
   */
  static async create(data) {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = data;
    
    try {
      // Verifica que no existe un usuario con el mismo email
     const exists = await Usuario.existsByEmail(nombre_usuario);
      if (exists) {
        throw new Error('Ya existe un usuario con este email');
      }
      
      // Validar tipo de usuario
      if (![1, 2, 3].includes(tipo_usuario)) {
        throw new Error('Tipo de usuario inválido. Debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)');
      }
      
      // Hash de contraseña
      const contraseniaHash = Usuario.hashPassword(contrasenia);
      
      const result = await query(
        `INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo, creado, modificado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          nombre.trim(), 
          apellido.trim(), 
          nombre_usuario.toLowerCase().trim(), 
          contraseniaHash,
          tipo_usuario,
          celular || null,
          foto || null
        ]
      );
      
      return await Usuario.findById(result.insertId);
    } catch (error) {
      console.error('Error en create:', error);
      if (error.message.includes('Ya existe un usuario')) {
        throw error;
      }
      throw new Error('Error al crear usuario');
    }
  }

  /**
   * Actualiza usuario
   */
  async update(data) {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo } = data;
    const updateFields = [];
    const params = [];
    
    try {
      if (nombre !== undefined && nombre !== null) {
        updateFields.push('nombre = ?');
        params.push(nombre.trim());
      }
      
      if (apellido !== undefined && apellido !== null) {
        updateFields.push('apellido = ?');
        params.push(apellido.trim());
      }
      
      if (nombre_usuario !== undefined && nombre_usuario !== null) {
        const trimmedEmail = nombre_usuario.toLowerCase().trim();
        if (trimmedEmail !== this.nombre_usuario) {
          const exists = await Usuario.existsByEmail(trimmedEmail, this.usuario_id);
          if (exists) {
            throw new Error('Ya existe un usuario con este email');
          }
        }
        
        updateFields.push('nombre_usuario = ?');
        params.push(trimmedEmail);
      }
      
      if (contrasenia !== undefined && contrasenia !== null && contrasenia.trim() !== '') {
        const contraseniaHash = Usuario.hashPassword(contrasenia);
        updateFields.push('contrasenia = ?');
        params.push(contraseniaHash);
      }
      
      if (tipo_usuario !== undefined && tipo_usuario !== null) {
        if (![1, 2, 3].includes(tipo_usuario)) {
          throw new Error('Tipo de usuario inválido. Debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)');
        }
        updateFields.push('tipo_usuario = ?');
        params.push(tipo_usuario);
      }
      
      if (celular !== undefined) {
        updateFields.push('celular = ?');
        params.push(celular);
      }
      
      if (foto !== undefined) {
        updateFields.push('foto = ?');
        params.push(foto);
      }
      
      if (activo !== undefined && activo !== null) {
        updateFields.push('activo = ?');
        params.push(Boolean(activo));
      }
      
      if (updateFields.length === 0) {
        return this;
      }
      
      updateFields.push('modificado = NOW()');
      params.push(this.usuario_id);
      
      await query(
        `UPDATE usuarios SET ${updateFields.join(', ')} WHERE usuario_id = ?`,
        params
      );
      
      return await Usuario.findById(this.usuario_id);
    } catch (error) {
      console.error('Error en update:', error);
      if (error.message.includes('Ya existe un usuario') || error.message.includes('Tipo de usuario inválido')) {
        throw error;
      }
      throw new Error('Error al actualizar usuario');
    }
  }

  /**
   * Soft delete - marcar como inactivo
   */
  async softDelete() {
    try {
      // Verifica si el usuario tiene reservas activas
      const reservasActivas = await query(
        'SELECT COUNT(*) as count FROM reservas WHERE usuario_id = ? AND activo = 1',
        [this.usuario_id]
      );
      
      if (reservasActivas[0].count > 0) {
        throw new Error('No se puede eliminar el usuario porque tiene reservas activas');
      }
      
      await query(
        'UPDATE usuarios SET activo = 0, modificado = NOW() WHERE usuario_id = ?',
        [this.usuario_id]
      );
      
      this.activo = false;
      return true;
    } catch (error) {
      console.error('Error en softDelete:', error);
      if (error.message.includes('tiene reservas activas')) {
        throw error;
      }
      throw new Error('Error al eliminar usuario');
    }
  }

  /**
   * Restaura usuario eliminado
   */
  async restore() {
    try {
      // Verifica que no haya conflicto de email al restaurar
      const exists = await Usuario.existsByEmail(this.nombre_usuario, this.usuario_id);
      if (exists) {
        throw new Error('No se puede restaurar: ya existe un usuario activo con este email');
      }
      
      await query(
        'UPDATE usuarios SET activo = 1, modificado = NOW() WHERE usuario_id = ?',
        [this.usuario_id]
      );
      
      return await Usuario.findById(this.usuario_id);
    } catch (error) {
      console.error('Error en restore:', error);
      if (error.message.includes('ya existe un usuario')) {
        throw error;
      }
      throw new Error('Error al restaurar usuario');
    }
  }

  /**
   * Verifica si el usuario está activo
   */
  isActive() {
    return Boolean(this.activo);
  }

  /**
   * Obtiene el texto del tipo de usuario
   */
  getTipoUsuarioTexto() {
    const tipos = {
      1: 'Administrador',
      2: 'Empleado',
      3: 'Cliente'
    };
    return tipos[this.tipo_usuario] || 'Desconocido';
  }

  /**
   * Obtiene estadísticas de usuarios por tipo
   */
  static async getStatsByType() {
    try {
      const stats = await query(`
        SELECT 
          tipo_usuario,
          COUNT(*) as total,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos
        FROM usuarios
        GROUP BY tipo_usuario
        ORDER BY tipo_usuario ASC
      `);
      
      return stats.map(stat => ({
        tipo_usuario: stat.tipo_usuario,
        tipo_texto: stat.tipo_usuario === 1 ? 'Administrador' : 
                    stat.tipo_usuario === 2 ? 'Empleado' : 'Cliente',
        total: stat.total,
        activos: stat.activos,
        inactivos: stat.inactivos
      }));
    } catch (error) {
      console.error('Error en getStatsByType:', error);
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }

  /**
   * Convertir a JSON limpio para respuestas de API (sin contraseña)
   */
  toJSON() {
    return {
      usuario_id: this.usuario_id,
      nombre: this.nombre,
      apellido: this.apellido,
      nombre_usuario: this.nombre_usuario,
      tipo_usuario: this.tipo_usuario,
      tipo_usuario_texto: this.getTipoUsuarioTexto(),
      celular: this.celular,
      foto: this.foto,
      activo: Boolean(this.activo),
      creado: this.creado,
      modificado: this.modificado
    };
  }

  /**
   * Valida datos antes de operaciones
   */
  static validateData(data, isUpdate = false) {
    const errors = [];
    
    if (!isUpdate || data.nombre !== undefined) {
      if (!data.nombre || typeof data.nombre !== 'string') {
        errors.push('El nombre es requerido y debe ser texto');
      } else if (data.nombre.trim().length < 2 || data.nombre.trim().length > 50) {
        errors.push('El nombre debe tener entre 2 y 50 caracteres');
      }
    }
    
    if (!isUpdate || data.apellido !== undefined) {
      if (!data.apellido || typeof data.apellido !== 'string') {
        errors.push('El apellido es requerido y debe ser texto');
      } else if (data.apellido.trim().length < 2 || data.apellido.trim().length > 50) {
        errors.push('El apellido debe tener entre 2 y 50 caracteres');
      }
    }
    
    if (!isUpdate || data.nombre_usuario !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.nombre_usuario || !emailRegex.test(data.nombre_usuario)) {
        errors.push('El email es requerido y debe ser válido');
      }
    }
    
    if (!isUpdate && !data.contrasenia) {
      errors.push('La contraseña es requerida');
    }
    
    if (data.contrasenia && data.contrasenia.length < 3) {
      errors.push('La contraseña debe tener al menos 3 caracteres');
    }
    
    if (!isUpdate || data.tipo_usuario !== undefined) {
      if (![1, 2, 3].includes(data.tipo_usuario)) {
        errors.push('El tipo de usuario debe ser 1 (Admin), 2 (Empleado) o 3 (Cliente)');
      }
    }
    
    return errors;
  }
}

export default Usuario;