import { readFile, writeFile } from 'fs/promises';

const archivoProductos = './data/productos.json';
const archivoVentas = './data/ventas.json';

const leerProductos = async () => {
  const data = await readFile(archivoProductos, 'utf-8');
  return JSON.parse(data);
};

const guardarProductos = async (productos) => {
  await writeFile(archivoProductos, JSON.stringify(productos, null, 2));
};

// GET /api/productos  (se puede filtrar con ?categoria=Tortas o ?disponible=true)
export const listarProductos = async (req, res) => {
  try {
    let productos = await leerProductos();
    const { categoria, disponible } = req.query;

    if (categoria) {
      productos = productos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }

    if (disponible !== undefined) {
      productos = productos.filter(p => p.disponible === (disponible === 'true'));
    }

    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos' });
  }
};

// GET /api/productos/:id
export const obtenerProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const productos = await leerProductos();
    const producto = productos.find(p => p.id === id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// POST /api/productos
export const crearProducto = async (req, res) => {
  try {
    const { nombre, categoria, desc, precio, disponible, imagen } = req.body;

    if (!nombre || !categoria || precio === undefined) {
      return res.status(400).json({ error: 'nombre, categoria y precio son obligatorios' });
    }

    const productos = await leerProductos();
    const nuevoId = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;

    const nuevoProducto = {
      id: nuevoId,
      nombre,
      categoria,
      desc: desc || '',
      precio,
      disponible: disponible !== undefined ? disponible : true,
      imagen: imagen || ''
    };

    productos.push(nuevoProducto);
    await guardarProductos(productos);

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// PUT /api/productos/:id
export const actualizarProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const productos = await leerProductos();
    const indice = productos.findIndex(p => p.id === id);

    if (indice === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    productos[indice] = { ...productos[indice], ...req.body, id };
    await guardarProductos(productos);

    res.status(200).json(productos[indice]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// DELETE /api/productos/:id  (no se puede borrar si esta en una venta)
export const eliminarProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const productos = await leerProductos();
    const indice = productos.findIndex(p => p.id === id);

    if (indice === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const ventas = JSON.parse(await readFile(archivoVentas, 'utf-8'));
    const estaEnVenta = ventas.some(v => v.productos.some(item => item.id_producto === id));

    if (estaEnVenta) {
      return res.status(409).json({ error: 'No se puede eliminar, el producto esta en una venta' });
    }

    productos.splice(indice, 1);
    await guardarProductos(productos);

    res.status(200).json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};
