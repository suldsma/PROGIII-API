const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/errorHandler');
const { validateLogin } = require('../middlewares/validation');

// POST /api/auth/login - Iniciar sesión
router.post('/login',
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// GET /api/auth/me - Obtener perfil del usuario actual (requiere autenticación)
router.get('/me',
  verifyToken,
  AuthController.getProfile
);

// POST /api/auth/refresh - Renovar token (requiere autenticación)
router.post('/refresh',
  verifyToken,
  AuthController.refreshToken
);

module.exports = router;