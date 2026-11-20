import mongoose from 'mongoose';
import { opcionesSchema } from './opciones.js';

// cada item de la venta guarda el producto, la cantidad y el precio que tenia en el momento de la compra
const ItemVentaSchema = new mongoose.Schema({
  id_producto:     { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad:        { type: Number, required: true, min: 1 },
  precio_unitario: { type: Number, required: true }
}, { _id: false });

const VentaSchema = new mongoose.Schema({
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fecha:      { type: String, required: true },
  direccion:  { type: String, default: '' },
  pagado:     { type: Boolean, default: false },
  productos:  { type: [ItemVentaSchema], required: true },
  total:      { type: Number, required: true }
}, opcionesSchema);

export const Venta = mongoose.model('Venta', VentaSchema, 'ventas');
