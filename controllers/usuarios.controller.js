import { readFile, writeFile } from 'fs/promises';

const archivoUsuarios = './data/usuarios.json';
const archivoVentas = './data/ventas.json';

const leerUsuarios = async () => {
  const data = await readFile(archivoUsuarios, 'utf-8');
  return JSON.parse(data);
};

const guardarUsuarios = async (usuarios) => {
  await writeFile(archivoUsuarios, JSON.stringify(usuarios, null, 2));
};

// POST /api/usuarios/login
export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    const usuarios = await leerUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.contraseña === contraseña);

    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'El usuario esta inactivo' });
    }

    const { contraseña: _, ...usuarioSinPass } = usuario;
    res.status(200).json({ mensaje: 'Login exitoso', usuario: usuarioSinPass });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
};

// GET /api/usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await leerUsuarios();
    const usuariosSinPass = usuarios.map(({ contraseña, ...resto }) => resto);
    res.status(200).json(usuariosSinPass);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

// GET /api/usuarios/:id
export const obtenerUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuarios = await leerUsuarios();
    const usuario = usuarios.find(u => u.id === id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { contraseña, ...usuarioSinPass } = usuario;
    res.status(200).json(usuarioSinPass);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// POST /api/usuarios
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña, esAdmin } = req.body;

    if (!nombre || !apellido || !email || !contraseña) {
      return res.status(400).json({ error: 'nombre, apellido, email y contraseña son obligatorios' });
    }

    const usuarios = await leerUsuarios();

    if (usuarios.some(u => u.email === email)) {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }

    const nuevoId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;

    const nuevoUsuario = {
      id: nuevoId,
      nombre,
      apellido,
      email,
      contraseña,
      esAdmin: esAdmin || false,
      activo: true
    };

    usuarios.push(nuevoUsuario);
    await guardarUsuarios(usuarios);

    const { contraseña: _, ...usuarioSinPass } = nuevoUsuario;
    res.status(201).json(usuarioSinPass);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// PUT /api/usuarios/:id
export const actualizarUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuarios = await leerUsuarios();
    const indice = usuarios.findIndex(u => u.id === id);

    if (indice === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    usuarios[indice] = { ...usuarios[indice], ...req.body, id };
    await guardarUsuarios(usuarios);

    const { contraseña, ...usuarioSinPass } = usuarios[indice];
    res.status(200).json(usuarioSinPass);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// DELETE /api/usuarios/:id  (no se puede borrar si tiene ventas)
export const eliminarUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuarios = await leerUsuarios();
    const indice = usuarios.findIndex(u => u.id === id);

    if (indice === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const ventas = JSON.parse(await readFile(archivoVentas, 'utf-8'));

    if (ventas.some(v => v.id_usuario === id)) {
      return res.status(409).json({ error: 'No se puede eliminar, el usuario tiene ventas' });
    }

    usuarios.splice(indice, 1);
    await guardarUsuarios(usuarios);

    res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
