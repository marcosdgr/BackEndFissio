import { Router } from 'express';

//importo las funciones del controlador
import { actualizarObraSocial, cambiarEstadoObraSocial, crearObraSocial, obtenerObraSocialActiva, obtenerObraSocialInactiva, obtenerObraSocialPorId, obtenerObrasSociales } from '../../Controllers/ObrasSociales/obrassociales.controller.js';

const router = Router();

router.get('/', obtenerObrasSociales);

router.get('/activos', obtenerObraSocialActiva);
router.get('/inactivos', obtenerObraSocialInactiva);
router.get('/:idObraSocial', obtenerObraSocialPorId);
router.post('/crearObraSocial', crearObraSocial);
router.put('/actualizarObraSocial/:idObraSocial', actualizarObraSocial);
router.put('/cambiarEstadoObra/:idObraSocial', cambiarEstadoObraSocial);


export default router;