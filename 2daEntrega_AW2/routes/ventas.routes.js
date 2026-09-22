const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/fileDB');

const FILE = 'ventas.json';

// GET - Lista todas las ventas
router.get('/', (req, res) => {
  const ventas = readData(FILE);
  const { pagado } = req.query;

  if (pagado !== undefined) {
    const filtro = pagado === 'true';
    return res.json(ventas.filter((v) => v.pagado === filtro));
  }

  res.json(ventas);
});

// GET - Devuelve una venta puntual por id
router.get('/:id', (req, res) => {
  const ventas = readData(FILE);
  const venta = ventas.find((v) => v.id === Number(req.params.id));

  if (!venta) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }

  res.json(venta);
});

// POST - Crea una nueva venta. Valida que el usuario y todos los productos existan,
// y calcula el total en base al precio real de cada producto
router.post('/', (req, res) => {
  const { id_usuario, fecha, direccion, pagado, productos: itemsVenta } = req.body;

  if (!id_usuario || !fecha || !Array.isArray(itemsVenta) || itemsVenta.length === 0) {
    return res
      .status(400)
      .json({ error: 'id_usuario, fecha y productos (array no vacío) son obligatorios' });
  }

  const usuarios = readData('usuarios.json');
  const usuarioExiste = usuarios.some((u) => u.id === id_usuario);

  if (!usuarioExiste) {
    return res.status(404).json({ error: 'El usuario indicado no existe' });
  }

  const catalogoProductos = readData('productos.json');
  let total = 0;

  for (const item of itemsVenta) {
    const producto = catalogoProductos.find((p) => p.id === item.id_producto);
    if (!producto) {
      return res.status(404).json({ error: `El producto con id ${item.id_producto} no existe` });
    }
    total += producto.precio * item.cantidad;
  }

  const ventas = readData(FILE);
  const nuevoId = ventas.length ? Math.max(...ventas.map((v) => v.id)) + 1 : 1001;

  const nuevaVenta = {
    id: nuevoId,
    id_usuario,
    fecha,
    direccion: direccion || '',
    pagado: pagado || false,
    productos: itemsVenta,
    total,
  };

  ventas.push(nuevaVenta);
  writeData(FILE, ventas);

  res.status(201).json(nuevaVenta);
});

// PUT /api/ventas/:id
// Actualiza una venta existente (ej: marcar como pagada, cambiar dirección)
router.put('/:id', (req, res) => {
  const ventas = readData(FILE);
  const index = ventas.findIndex((v) => v.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }

  ventas[index] = { ...ventas[index], ...req.body, id: ventas[index].id };
  writeData(FILE, ventas);

  res.json(ventas[index]);
});

// DELETE /api/ventas/:id
// Elimina una venta. Al ser la venta el registro "dependiente" (no la referenciada),
// no rompe integridad de otras estructuras
router.delete('/:id', (req, res) => {
  const ventas = readData(FILE);
  const index = ventas.findIndex((v) => v.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }

  ventas.splice(index, 1);
  writeData(FILE, ventas);

  res.json({ mensaje: 'Venta eliminada correctamente' });
});

module.exports = router;
