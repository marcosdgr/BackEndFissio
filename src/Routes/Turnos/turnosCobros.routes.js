import { Router } from 'express';
import { obtenerTurnos } from '../../Controllers/Turnos/turnosCobros.controller.js';

const router = Router();

router.get('/v1', obtenerTurnos);

export default router;