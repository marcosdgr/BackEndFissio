import { Router } from 'express';

//importo las funciones del controlador
import { actualizarObraSocial, borradoLogicoObraSocial, crearObraSocial, obtenerObraSocialPorId, obtenerObrasSociales } from '../../Controllers/ObrasSociales/obrassociales.controller.js';

const router = Router();

router.get('/', obtenerObrasSociales);
router.get('/:idObraSocial', obtenerObraSocialPorId);
router.post('/crearObraSocial', crearObraSocial);
router.put('/actualizarObraSocial/:idObraSocial', actualizarObraSocial);
router.put('/borrarObraSocial/:idObraSocial', borradoLogicoObraSocial);


export default router;