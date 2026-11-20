import mongoose from 'mongoose';
import { opcionesSchema } from './opciones.js';

const UsuarioSchema = new mongoose.Schema({
  nombre:     { type: String, required: true, trim: true },
  apellido:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  contraseña: { type: String, required: true }, // se guarda encriptada con bcrypt
  esAdmin:    { type: Boolean, default: false },
  activo:     { type: Boolean, default: true }
}, {
  ...opcionesSchema,
  toJSON: {
    ...opcionesSchema.toJSON,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      delete ret.contraseña; // nunca se devuelve la contraseña
      return ret;
    }
  }
});

export const Usuario = mongoose.model('Usuario', UsuarioSchema, 'usuarios');
