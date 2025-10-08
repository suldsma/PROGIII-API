import express from 'express';
const router = express.Router();

import AuthController from '../controllers/authController.js';
import { verifyToken } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/errorHandler.js';
import { validateLogin } from '../middlewares/validation.js';

// POST /api/auth/login - Iniciar sesión
router.post('/login',
  validateLogin, 
  handleValidationErrors, 
  AuthController.login 
);

// GET /api/auth/me - Obtiene perfil del usuario actual
router.get('/me',
  verifyToken, 
  AuthController.getProfile 
);

// POST /api/auth/refresh - Renovar token 
router.post('/refresh',
  verifyToken, 
  AuthController.refreshToken 
);

// Manejo de rutas no encontradas (Error 404) para autenticación
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
    availableEndpoints: {
      login: 'POST /api/auth/login - Iniciar sesión',
      me: 'GET /api/auth/me - Obtener perfil del usuario actual',
      refresh: 'POST /api/auth/refresh - Renovar token'
    },
    documentation: `http://localhost:${process.env.PORT || 3000}/api-docs`
  });
});

export default router;
