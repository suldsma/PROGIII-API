// Importo librerías y módulos necesarios
import jwt from 'jsonwebtoken'; // Para manejo de JSON Web Tokens
import crypto from 'crypto'; // Para hashing de contraseñas (MD5)
import { query } from '../config/database.js'; // Función para ejecutar queries a la DB
import { createError } from '../middlewares/errorHandler.js'; // Utilidad para crear errores HTTP

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para autenticación de usuarios
 */

class AuthController {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre_usuario
   *               - contrasenia
   *             properties:
   *               nombre_usuario:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *                 example: alblop@correo.com
   *               contrasenia:
   *                 type: string
   *                 description: Contraseña del usuario
   *                 example: password123
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Credenciales inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async login(req, res, next) {
    try {
      const { nombre_usuario, contrasenia } = req.body;

      // Busco el usuario activo por nombre de usuario (email)
      const usuarios = await query(
        `SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, creado, activo 
         FROM usuarios 
         WHERE nombre_usuario = ? AND activo = 1`,
        [nombre_usuario.toLowerCase()]
      );

      if (usuarios.length === 0) {
        throw createError('Credenciales inválidas', 401); // Usuario no encontrado/activo
      }

      const usuario = usuarios[0];

      // Hashing de la contraseña ingresada con MD5
      const contrasenaHash = crypto.createHash('md5').update(contrasenia).digest('hex');

      // Comparo el hash ingresado con el hash de la DB
      if (contrasenaHash !== usuario.contrasenia) {
        throw createError('Credenciales inválidas', 401);
      }

      // Defino el payload para el JWT
      const tokenPayload = {
        userId: usuario.usuario_id,
        email: usuario.nombre_usuario,
        tipo: usuario.tipo_usuario
      };

      // Genero el JWT con la clave secreta y tiempo de expiración
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          issuer: 'progiii-api'
        }
      );

      // Filtro los datos del usuario para la respuesta
      const userData = {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario,
        tipo_usuario_texto: AuthController.getTipoUsuarioTexto(usuario.tipo_usuario),
        celular: usuario.celular,
        foto: usuario.foto,
        creado: usuario.creado
      };

      // Respondo con el token y los datos del usuario
      res.status(200).json({
        status: 'success',
        message: 'Login exitoso',
        data: {
          token,
          user: userData
        }
      });

    } catch (error) {
      next(error); // Paso el error al middleware de errores
    }
  }

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Obtener información del usuario actual
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Información del usuario obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/Usuario'
   *       401:
   *         description: Token inválido o expirado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id; // ID de usuario inyectado por el middleware de autenticación (JWT)

      // Busco todos los datos del usuario activo por su ID
      const usuarios = await query(
        `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado
         FROM usuarios 
         WHERE usuario_id = ? AND activo = 1`,
        [userId]
      );

      if (usuarios.length === 0) {
        throw createError('Usuario no encontrado', 404);
      }

      const usuario = usuarios[0];

      // Estructuro los datos del usuario para la respuesta
      const userData = {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario,
        tipo_usuario_texto: AuthController.getTipoUsuarioTexto(usuario.tipo_usuario),
        celular: usuario.celular,
        foto: usuario.foto,
        creado: usuario.creado
      };

      res.status(200).json({
        status: 'success',
        data: userData
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Renovar token JWT
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token renovado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async refreshToken(req, res, next) {
    try {
      const userId = req.user.id; // Obtengo el ID del payload del token actual

      // Re-verifico que el usuario todavía exista y esté activo en la DB
      const usuarios = await query(
        'SELECT usuario_id, nombre_usuario, tipo_usuario FROM usuarios WHERE usuario_id = ? AND activo = 1',
        [userId]
      );

      if (usuarios.length === 0) {
        throw createError('Usuario no encontrado', 401); // Error si el usuario fue desactivado
      }

      const usuario = usuarios[0];

      // Defino el payload para el nuevo token
      const tokenPayload = {
        userId: usuario.usuario_id,
        email: usuario.nombre_usuario,
        tipo: usuario.tipo_usuario
      };

      // Genero el nuevo JWT
      const newToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          issuer: 'progiii-api'
        }
      );

      res.status(200).json({
        status: 'success',
        message: 'Token renovado exitosamente',
        data: {
          token: newToken
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Función auxiliar para mapear el ID de tipo de usuario a su texto
  static getTipoUsuarioTexto(tipo) {
    const tipos = {
      1: 'Administrador',
      2: 'Empleado',
      3: 'Cliente'
    };
    return tipos[tipo] || 'Desconocido';
  }
}

export default AuthController;
