import mongoose from 'mongoose';
import { opcionesSchema } from './opciones.js';

const ProductoSchema = new mongoose.Schema({
  nombre:     { type: String, required: true, trim: true },
  categoria:  { type: String, required: true, trim: true },
  desc:       { type: String, default: '' },
  precio:     { type: Number, required: true, min: 0 },
  disponible: { type: Boolean, default: true },
  imagen:     { type: String, default: '' }
}, opcionesSchema);

export const Producto = mongoose.model('Producto', ProductoSchema, 'productos');
