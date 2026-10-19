import { readFile, writeFile } from 'fs/promises';

const archivoVentas = './data/ventas.json';
const archivoUsuarios = './data/usuarios.json';
const archivoProductos = './data/productos.json';

const leerVentas = async () => {
  const data = await readFile(archivoVentas, 'utf-8');
  return JSON.parse(data);
};

const guardarVentas = async (ventas) => {
  await writeFile(archivoVentas, JSON.stringify(ventas, null, 2));
};

// GET /api/ventas  (se puede filtrar con ?pagado=true)
export const listarVentas = async (req, res) => {
  try {
    let ventas = await leerVentas();
    const { pagado } = req.query;

    if (pagado !== undefined) {
      ventas = ventas.filter(v => v.pagado === (pagado === 'true'));
    }

    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar ventas' });
  }
};

// GET /api/ventas/:id
export const obtenerVenta = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ventas = await leerVentas();
    const venta = ventas.find(v => v.id === id);

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.status(200).json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
};

// POST /api/ventas  (la orden de compra que manda el carrito)
export const crearVenta = async (req, res) => {
  try {
    const { id_usuario, fecha, direccion, productos } = req.body;

    if (!id_usuario || !fecha || !productos || productos.length === 0) {
      return res.status(400).json({ error: 'id_usuario, fecha y productos son obligatorios' });
    }

    const usuarios = JSON.parse(await readFile(archivoUsuarios, 'utf-8'));

    if (!usuarios.some(u => u.id === id_usuario)) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }

    const catalogo = JSON.parse(await readFile(archivoProductos, 'utf-8'));
    let total = 0;

    for (const item of productos) {
      const producto = catalogo.find(p => p.id === item.id_producto);

      if (!producto) {
        return res.status(404).json({ error: `El producto ${item.id_producto} no existe` });
      }

      if (!producto.disponible) {
        return res.status(400).json({ error: `${producto.nombre} no esta disponible` });
      }

      total += producto.precio * item.cantidad;
    }

    const ventas = await leerVentas();
    const nuevoId = ventas.length ? Math.max(...ventas.map(v => v.id)) + 1 : 1001;

    const nuevaVenta = {
      id: nuevoId,
      id_usuario,
      fecha,
      direccion: direccion || '',
      pagado: false,
      productos,
      total
    };

    ventas.push(nuevaVenta);
    await guardarVentas(ventas);

    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la venta' });
  }
};

// PUT /api/ventas/:id
export const actualizarVenta = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ventas = await leerVentas();
    const indice = ventas.findIndex(v => v.id === id);

    if (indice === -1) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    ventas[indice] = { ...ventas[indice], ...req.body, id };
    await guardarVentas(ventas);

    res.status(200).json(ventas[indice]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la venta' });
  }
};

// DELETE /api/ventas/:id
export const eliminarVenta = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ventas = await leerVentas();
    const indice = ventas.findIndex(v => v.id === id);

    if (indice === -1) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    ventas.splice(indice, 1);
    await guardarVentas(ventas);

    res.status(200).json({ mensaje: 'Venta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
};
