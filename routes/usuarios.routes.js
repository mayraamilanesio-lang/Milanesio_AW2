import { Router } from 'express';
import {
  login,
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuarios.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import { validarId } from '../middlewares/validarId.middleware.js';

const router = Router();

router.post('/login', login);

// rutas publicas
router.get('/', listarUsuarios);
router.get('/:id', validarId, obtenerUsuario);

// rutas protegidas: primero pasan por verificarToken
router.post('/', verificarToken, crearUsuario);
router.put('/:id', verificarToken, validarId, actualizarUsuario);
router.delete('/:id', verificarToken, validarId, eliminarUsuario);

export default router;
