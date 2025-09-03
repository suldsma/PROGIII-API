const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');
const { createError } = require('../middlewares/errorHandler');

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
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                   example: Login exitoso
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                       description: JWT token
   *                     user:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                         nombre:
   *                           type: string
   *                         apellido:
   *                           type: string
   *                         nombre_usuario:
   *                           type: string
   *                         tipo_usuario:
   *                           type: integer
   *                           description: 1=Admin, 2=Empleado, 3=Cliente
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

      // Buscar usuario por nombre_usuario (email)
      const usuarios = await query(
        `SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, activo 
         FROM usuarios 
         WHERE nombre_usuario = ? AND activo = 1`,
        [nombre_usuario.toLowerCase()]
      );

      if (usuarios.length === 0) {
        throw createError('Credenciales inválidas', 401);
      }

      const usuario = usuarios[0];

      // Verificar contraseña usando MD5 
      const contrasenaHash = crypto.createHash('md5').update(contrasenia).digest('hex');
      
      if (contrasenaHash !== usuario.contrasenia) {
        throw createError('Credenciales inválidas', 401);
      }

      // Generar JWT token
      const tokenPayload = {
        userId: usuario.usuario_id,
        email: usuario.nombre_usuario,
        tipo: usuario.tipo_usuario
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          issuer: 'progiii-api'
        }
      );

      // Preparar datos del usuario para la respuesta (sin contraseña)
      const userData = {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario,
        tipo_usuario_texto: AuthController.getTipoUsuarioTexto(usuario.tipo_usuario)
      };

      res.status(200).json({
        status: 'success',
        message: 'Login exitoso',
        data: {
          token,
          user: userData
        }
      });

    } catch (error) {
      next(error);
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
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     nombre:
   *                       type: string
   *                     apellido:
   *                       type: string
   *                     nombre_usuario:
   *                       type: string
   *                     tipo_usuario:
   *                       type: integer
   *                     tipo_usuario_texto:
   *                       type: string
   *                     celular:
   *                       type: string
   *                     foto:
   *                       type: string
   *       401:
   *         description: Token inválido o expirado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

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
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                   example: Token renovado exitosamente
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                       description: Nuevo JWT token
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async refreshToken(req, res, next) {
    try {
      const userId = req.user.id;

      // Verificar que el usuario aún existe y está activo
      const usuarios = await query(
        'SELECT usuario_id, nombre_usuario, tipo_usuario FROM usuarios WHERE usuario_id = ? AND activo = 1',
        [userId]
      );

      if (usuarios.length === 0) {
        throw createError('Usuario no encontrado', 401);
      }

      const usuario = usuarios[0];

      // Generar nuevo token
      const tokenPayload = {
        userId: usuario.usuario_id,
        email: usuario.nombre_usuario,
        tipo: usuario.tipo_usuario
      };

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

  // Método helper para obtener el texto del tipo de usuario
  static getTipoUsuarioTexto(tipo) {
    const tipos = {
      1: 'Administrador',
      2: 'Empleado',
      3: 'Cliente'
    };
    return tipos[tipo] || 'Desconocido';
  }
}

module.exports = AuthController;