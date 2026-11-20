import { Producto } from '../models/Producto.js';
import { Venta } from '../models/Venta.js';

// GET /api/productos
export const listarProductos = async (req, res) => {
  try {
    const { categoria, disponible } = req.query;
    const filtro = {};

    if (categoria) {
      // sin importar mayusculas/minusculas
      const texto = categoria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filtro.categoria = new RegExp(`^${texto}$`, 'i');
    }

    if (disponible !== undefined) {
      filtro.disponible = disponible === 'true';
    }

    const productos = await Producto.find(filtro);
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos' });
  }
};

// GET /api/productos/:id
export const obtenerProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// POST /api/productos  (requiere token)
export const crearProducto = async (req, res) => {
  try {
    const { nombre, categoria, desc, precio, disponible, imagen } = req.body;

    if (!nombre || !categoria || precio === undefined) {
      return res.status(400).json({ error: 'nombre, categoria y precio son obligatorios' });
    }

    if (typeof precio !== 'number' || precio < 0) {
      return res.status(400).json({ error: 'El precio debe ser un numero mayor o igual a 0' });
    }

    const nuevoProducto = await Producto.create({ nombre, categoria, desc, precio, disponible, imagen });
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// PUT /api/productos/:id  (requiere token)
export const actualizarProducto = async (req, res) => {
  try {
    const camposEditables = ['nombre', 'categoria', 'desc', 'precio', 'disponible', 'imagen'];
    const cambios = {};

    for (const campo of camposEditables) {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    }

    if (cambios.precio !== undefined && (typeof cambios.precio !== 'number' || cambios.precio < 0)) {
      return res.status(400).json({ error: 'El precio debe ser un numero mayor o igual a 0' });
    }

    const producto = await Producto.findByIdAndUpdate(req.params.id, cambios, { new: true, runValidators: true });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// DELETE /api/productos/:id  (requiere token - no se puede borrar si esta en una venta)
export const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const estaEnVenta = await Venta.exists({ 'productos.id_producto': producto._id });

    if (estaEnVenta) {
      return res.status(409).json({ error: 'No se puede eliminar, el producto esta en una venta' });
    }

    await producto.deleteOne();
    res.status(200).json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};
