import { Router } from 'express';
import {
  listarVentas,
  obtenerVenta,
  crearVenta,
  actualizarVenta,
  eliminarVenta
} from '../controllers/ventas.controller.js';

const router = Router();

router.get('/', listarVentas);
router.get('/:id', obtenerVenta);
router.post('/', crearVenta);
router.put('/:id', actualizarVenta);
router.delete('/:id', eliminarVenta);

export default router;
