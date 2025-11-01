import { Router } from 'express';
import { login, logout, verificarToken } from '../Controllers/auth.controller.js';
import { verificarAutenticacion } from '../Middlewares/mensajeriaInterna/autenticar.js';

const router = Router();

// Ruta pública - no requiere autenticación
router.post('/login', login);

// Rutas protegidas - requieren autenticación
router.get('/verificar', verificarAutenticacion, verificarToken);
router.post('/logout', verificarAutenticacion, logout);

export default router;
