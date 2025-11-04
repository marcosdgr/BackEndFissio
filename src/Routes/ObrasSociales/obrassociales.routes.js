import { Router } from 'express';

//importo las funciones del controlador
import { actualizarObraSocial, borradoLogicoObraSocial, crearObraSocial, obtenerObraSocialActiva, obtenerObraSocialInactiva, obtenerObraSocialPorId, obtenerObrasSociales } from '../../Controllers/ObrasSociales/obrassociales.controller.js';

const router = Router();

router.get('/', obtenerObrasSociales);
router.get('/:idObraSocial', obtenerObraSocialPorId);
router.post('/crearObraSocial', crearObraSocial);
router.put('/actualizarObraSocial/:idObraSocial', actualizarObraSocial);
router.put('/borrarObraSocial/:idObraSocial', borradoLogicoObraSocial);
router.get('/activos', obtenerObraSocialActiva);
router.get('/inactivos', obtenerObraSocialInactiva);


export default router;