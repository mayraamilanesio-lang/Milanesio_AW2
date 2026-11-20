import mongoose from 'mongoose';
import { Venta } from '../models/Venta.js';
import { Producto } from '../models/Producto.js';

// trae los datos del usuario y de los productos en vez de solo el id
const conDetalle = (consulta) => consulta
  .populate('id_usuario', 'nombre apellido email')
  .populate('productos.id_producto', 'nombre categoria');

// GET /api/ventas
export const listarVentas = async (req, res) => {
  try {
    const { pagado } = req.query;
    const filtro = {};

    if (pagado !== undefined) {
      filtro.pagado = pagado === 'true';
    }

    const ventas = await conDetalle(Venta.find(filtro).sort({ createdAt: -1 }));
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar ventas' });
  }
};

// GET /api/ventas/:id
export const obtenerVenta = async (req, res) => {
  try {
    const venta = await conDetalle(Venta.findById(req.params.id));

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.status(200).json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
};

// POST /api/ventas  (requiere token: es la compra que manda el carrito)
// el usuario se toma del token, no del body
export const crearVenta = async (req, res) => {
  try {
    const { direccion, productos } = req.body;
    const fecha = req.body.fecha || new Date().toISOString().slice(0, 10);

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'La venta tiene que tener al menos un producto' });
    }

    let total = 0;
    const items = [];

    for (const item of productos) {
      if (!mongoose.isValidObjectId(item.id_producto)) {
        return res.status(400).json({ error: `El id de producto ${item.id_producto} no es valido` });
      }

      if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
        return res.status(400).json({ error: 'La cantidad tiene que ser un numero entero mayor a 0' });
      }

      const producto = await Producto.findById(item.id_producto);

      if (!producto) {
        return res.status(404).json({ error: `El producto ${item.id_producto} no existe` });
      }

      if (!producto.disponible) {
        return res.status(400).json({ error: `${producto.nombre} no esta disponible` });
      }

      // el precio y el total se calculan en el backend con el precio real del producto
      total += producto.precio * item.cantidad;
      items.push({ id_producto: producto._id, cantidad: item.cantidad, precio_unitario: producto.precio });
    }

    const nuevaVenta = await Venta.create({
      id_usuario: req.usuario.id,
      fecha,
      direccion: direccion || '',
      productos: items,
      total
    });

    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la venta' });
  }
};

// PUT /api/ventas/:id  (requiere token: por ejemplo para marcarla como pagada)
export const actualizarVenta = async (req, res) => {
  try {
    const camposEditables = ['fecha', 'direccion', 'pagado'];
    const cambios = {};

    for (const campo of camposEditables) {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    }

    const venta = await Venta.findByIdAndUpdate(req.params.id, cambios, { new: true, runValidators: true });

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.status(200).json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la venta' });
  }
};

// DELETE /api/ventas/:id  (requiere token)
export const eliminarVenta = async (req, res) => {
  try {
    const venta = await Venta.findByIdAndDelete(req.params.id);

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.status(200).json({ mensaje: 'Venta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
};
