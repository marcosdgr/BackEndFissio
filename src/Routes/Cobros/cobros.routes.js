import { Router } from 'express';
import {
  obtenerCobros,
  obtenerCobroPorId,
  crearCobro,
  actualizarCobro,
  eliminarCobro,
  cambiarEstadoCobro
} from '../../Controllers/Cobros/cobros.controller.js';

const router = Router();

// RUTAS PRINCIPALES
router.get('/', obtenerCobros);         
router.get('/:idCobro', obtenerCobroPorId); 

router.post('/', crearCobro);             

router.put('/:idCobro', actualizarCobro); 
router.put('/cambiarEstado/:idCobro', cambiarEstadoCobro); 

router.delete('/:idCobro', eliminarCobro); 

export default router;