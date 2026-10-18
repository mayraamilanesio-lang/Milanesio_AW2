import express from 'express';
import { readData, writeData } from '../utils/fileDB.js';

const router = express.Router();

const FILE = 'usuarios.json';

function quitarContraseña(usuario) {
  const { contraseña, ...resto } = usuario;
  return resto;
}

// GET - Lista todos los usuarios (sin exponer contraseñas)
router.get('/', (req, res) => {
  const usuarios = readData(FILE);
  res.json(usuarios.map(quitarContraseña));
});

// GET - Devuelve un usuario puntual (sin contraseña)
router.get('/:id', (req, res) => {
  const usuarios = readData(FILE);
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json(quitarContraseña(usuario));
});

// POST - Crea un nuevo usuario
router.post('/', (req, res) => {
  const { nombre, apellido, email, contraseña, esAdmin } = req.body;

  if (!nombre || !apellido || !email || !contraseña) {
    return res
      .status(400)
      .json({ error: 'nombre, apellido, email y contraseña son obligatorios' });
  }

  const usuarios = readData(FILE);

  if (usuarios.some((u) => u.email === email)) {
    return res.status(409).json({ error: 'Ya existe un usuario registrado con ese email' });
  }

  const nuevoId = usuarios.length ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
  const nuevoUsuario = {
    id: nuevoId,
    nombre,
    apellido,
    email,
    contraseña,
    esAdmin: esAdmin || false,
    activo: true,
  };

  usuarios.push(nuevoUsuario);
  writeData(FILE, usuarios);

  res.status(201).json(quitarContraseña(nuevoUsuario));
});

// POST - Autentica un usuario
router.post('/login', (req, res) => {
  const { email, contraseña } = req.body;

  if (!email || !contraseña) {
    return res.status(400).json({ error: 'email y contraseña son obligatorios' });
  }

  const usuarios = readData(FILE);
  const usuario = usuarios.find((u) => u.email === email && u.contraseña === contraseña);

  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  if (!usuario.activo) {
    return res.status(403).json({ error: 'El usuario está inactivo' });
  }

  res.json({ mensaje: 'Login exitoso', usuario: quitarContraseña(usuario) });
});

// PUT - Actualiza datos de un usuario existente
router.put('/:id', (req, res) => {
  const usuarios = readData(FILE);
  const index = usuarios.findIndex((u) => u.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  usuarios[index] = { ...usuarios[index], ...req.body, id: usuarios[index].id };
  writeData(FILE, usuarios);

  res.json(quitarContraseña(usuarios[index]));
});

// DELETE - Elimina un usuario, pero antes valida integridad referencial
router.delete('/:id', (req, res) => {
  const idUsuario = Number(req.params.id);
  const usuarios = readData(FILE);
  const index = usuarios.findIndex((u) => u.id === idUsuario);

  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const ventas = readData('ventas.json');
  const tieneVentas = ventas.some((v) => v.id_usuario === idUsuario);

  if (tieneVentas) {
    return res.status(409).json({
      error:
        'No se puede eliminar el usuario: tiene ventas asociadas. Elimine o reasigne esas ventas primero.',
    });
  }

  usuarios.splice(index, 1);
  writeData(FILE, usuarios);

  res.json({ mensaje: 'Usuario eliminado correctamente' });
});

export default router;
