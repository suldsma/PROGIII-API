// Importo librerías y módulos
import jwt from 'jsonwebtoken'; // Para JWT
import { query } from '../config/database.js'; // Función de query a la DB
import { createError } from './errorHandler.js'; // Utilidad para crear errores HTTP

// Middleware para verificar JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Compruebo el formato del encabezado "Bearer token"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('Token de acceso requerido', 401));
    }

    const token = authHeader.substring(7); // Extraigo solo el token

    // Verifico y decodifico el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifico que el usuario del token exista en la DB y esté activo
    const usuarios = await query(
      'SELECT usuario_id, nombre, apellido, tipo_usuario FROM usuarios WHERE usuario_id = ? AND activo = 1',
      [decoded.userId]
    );

    if (usuarios.length === 0) {
      return next(createError('Usuario no encontrado o inactivo', 401));
    }

  
    // Adjunto la info del usuario al objeto de la solicitud (req.user)
    req.user = {
      id: usuarios[0].usuario_id,
      nombre: usuarios[0].nombre,
      apellido: usuarios[0].apellido,
      tipo_usuario: usuarios[0].tipo_usuario  
    };

    next(); // Continúo al siguiente middleware/controlador
  } catch (error) {
    // Manejo específico de errores de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Token inválido', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError('Token expirado', 401));
    }
    next(createError('Error al verificar el token', 500));
  }
};

// Middleware para verificar si el usuario tiene un rol permitido
const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Usuario no autenticado', 401));
    }

    if (!rolesPermitidos.includes(req.user.tipo_usuario)) {
      return next(createError('No tienes permisos para acceder a este recurso', 403)); // Prohibido
    }

    next();
  };
};

// Roles del sistema 
const ROLES = {
  ADMINISTRADOR: 1,
  EMPLEADO: 2,
  CLIENTE: 3
};

export {
  verifyToken,
  requireRole,
  ROLES
};