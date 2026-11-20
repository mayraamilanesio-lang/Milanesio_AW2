import { Router } from 'express';
import {
  listarVentas,
  obtenerVenta,
  crearVenta,
  actualizarVenta,
  eliminarVenta
} from '../controllers/ventas.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import { validarId } from '../middlewares/validarId.middleware.js';

const router = Router();

// rutas publicas
router.get('/', listarVentas);
router.get('/:id', validarId, obtenerVenta);

// rutas protegidas: primero pasan por verificarToken
router.post('/', verificarToken, crearVenta);
router.put('/:id', verificarToken, validarId, actualizarVenta);
router.delete('/:id', verificarToken, validarId, eliminarVenta);

export default router;
