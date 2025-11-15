import { Router } from 'express';
import { obtenerPacientes } from '../../Controllers/Pacientes/pacientesCobros.controller.js';

const router = Router();

router.get('/v1', obtenerPacientes);

export default router;