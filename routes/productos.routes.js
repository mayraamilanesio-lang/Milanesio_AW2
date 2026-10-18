import express from 'express';
import { readData, writeData } from '../utils/fileDB.js';

const router = express.Router();

const FILE = 'productos.json';

// GET - Lista todos los productos.
router.get('/', (req, res) => {
  const productos = readData(FILE);
  const { disponible } = req.query;

  if (disponible !== undefined) {
    const filtro = disponible === 'true';
    return res.json(productos.filter((p) => p.disponible === filtro));
  }

  res.json(productos);
});

// GET - Devuelve un producto puntual por id
router.get('/:id', (req, res) => {
  const productos = readData(FILE);
  const producto = productos.find((p) => p.id === Number(req.params.id));

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(producto);
});

// POST - Crea un nuevo producto
router.post('/', (req, res) => {
  const { nombre, desc, precio, disponible, imagen } = req.body;

  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'Los campos "nombre" y "precio" son obligatorios' });
  }

  const productos = readData(FILE);
  const nuevoId = productos.length ? Math.max(...productos.map((p) => p.id)) + 1 : 1;

  const nuevoProducto = {
    id: nuevoId,
    nombre,
    desc: desc || '',
    precio,
    disponible: disponible !== undefined ? disponible : true,
    imagen: imagen || '',
  };

  productos.push(nuevoProducto);
  writeData(FILE, productos);

  res.status(201).json(nuevoProducto);
});

// PUT - Actualiza un producto existente
router.put('/:id', (req, res) => {
  const productos = readData(FILE);
  const index = productos.findIndex((p) => p.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  productos[index] = { ...productos[index], ...req.body, id: productos[index].id };
  writeData(FILE, productos);

  res.json(productos[index]);
});

// DELETE - Elimina un producto, si el producto aparece en alguna venta, no se permite borrarlo
router.delete('/:id', (req, res) => {
  const idProducto = Number(req.params.id);
  const productos = readData(FILE);
  const index = productos.findIndex((p) => p.id === idProducto);

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const ventas = readData('ventas.json');
  const productoEnUso = ventas.some((v) =>
    v.productos.some((item) => item.id_producto === idProducto)
  );

  if (productoEnUso) {
    return res.status(409).json({
      error: 'No se puede eliminar el producto: está asociado a una o más ventas existentes',
    });
  }

  productos.splice(index, 1);
  writeData(FILE, productos);

  res.json({ mensaje: 'Producto eliminado correctamente' });
});

export default router;
