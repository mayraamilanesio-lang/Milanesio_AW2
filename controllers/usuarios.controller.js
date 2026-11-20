import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Usuario } from '../models/Usuario.js';
import { Venta } from '../models/Venta.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LARGO_MINIMO_PASS = 4;

// POST /api/usuarios/login  (publica)
export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'email y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() });

    const passValida = usuario && await bcrypt.compare(contraseña, usuario.contraseña);

    if (!passValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'El usuario esta inactivo' });
    }
    // genera el token JWT con los datos del usuario, duracion de 2 horas
    const payload = { id: usuario.id, email: usuario.email, esAdmin: usuario.esAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '2h' });

    res.status(200).json({ mensaje: 'Login exitoso', token, usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
};

// GET /api/usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

// GET /api/usuarios/:id
export const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// POST /api/usuarios  (requiere token)
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña, esAdmin } = req.body;

    if (!nombre || !apellido || !email || !contraseña) {
      return res.status(400).json({ error: 'nombre, apellido, email y contraseña son obligatorios' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El email no tiene un formato valido' });
    }

    if (contraseña.length < LARGO_MINIMO_PASS) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${LARGO_MINIMO_PASS} caracteres` });
    }

    if (await Usuario.exists({ email: email.toLowerCase() })) {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }

    // la contraseña se guarda encriptada
    const hash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      contraseña: hash,
      esAdmin: esAdmin || false
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// PUT /api/usuarios/:id  (requiere token)
export const actualizarUsuario = async (req, res) => {
  try {
    const camposEditables = ['nombre', 'apellido', 'email', 'esAdmin', 'activo'];
    const cambios = {};

    for (const campo of camposEditables) {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    }

    if (cambios.email !== undefined) {
      if (!emailRegex.test(cambios.email)) {
        return res.status(400).json({ error: 'El email no tiene un formato valido' });
      }

      const otro = await Usuario.findOne({ email: cambios.email.toLowerCase(), _id: { $ne: req.params.id } });
      if (otro) {
        return res.status(409).json({ error: 'El email ya esta registrado' });
      }
    }

    // si cambia la contraseña, se vuelve a encriptar
    if (req.body.contraseña !== undefined) {
      if (req.body.contraseña.length < LARGO_MINIMO_PASS) {
        return res.status(400).json({ error: `La contraseña debe tener al menos ${LARGO_MINIMO_PASS} caracteres` });
      }
      cambios.contraseña = await bcrypt.hash(req.body.contraseña, 10);
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, cambios, { new: true, runValidators: true });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// DELETE /api/usuarios/:id  (requiere token, no se puede borrar si tiene ventas)
export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (await Venta.exists({ id_usuario: usuario._id })) {
      return res.status(409).json({ error: 'No se puede eliminar, el usuario tiene ventas' });
    }

    await usuario.deleteOne();
    res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
