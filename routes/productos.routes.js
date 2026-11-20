import { Router } from 'express';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from '../controllers/productos.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import { validarId } from '../middlewares/validarId.middleware.js';

const router = Router();

// rutas publicas
router.get('/', listarProductos);
router.get('/:id', validarId, obtenerProducto);

// rutas protegidas: primero pasan por verificarToken
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, validarId, actualizarProducto);
router.delete('/:id', verificarToken, validarId, eliminarProducto);

export default router;
