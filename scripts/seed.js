// carga los datos de data/*.json en MongoDB (borra lo que haya antes)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFile } from 'fs/promises';
import 'dotenv/config';
import { Producto } from '../models/Producto.js';
import { Usuario } from '../models/Usuario.js';
import { Venta } from '../models/Venta.js';

const leerJSON = async (archivo) => JSON.parse(await readFile(new URL(`../data/${archivo}`, import.meta.url), 'utf-8'));

const migrar = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB para el seed');

    const productosJSON = await leerJSON('productos.json');
    const usuariosJSON = await leerJSON('usuarios.json');
    const ventasJSON = await leerJSON('ventas.json');

    await Promise.all([Producto.deleteMany({}), Usuario.deleteMany({}), Venta.deleteMany({})]);
    console.log('Colecciones limpias');

    // 1. productos: guarda la relacion id viejo -> _id nuevo de Mongo
    const idsProductos = {};
    const preciosProductos = {};
    for (const { id, ...datos } of productosJSON) {
      const producto = await Producto.create(datos);
      idsProductos[id] = producto._id;
      preciosProductos[id] = producto.precio;
    }
    console.log(`${productosJSON.length} productos migrados`);

    // 2. usuarios: la contraseña se encripta con bcrypt antes de guardarla
    const idsUsuarios = {};
    for (const { id, contraseña, ...datos } of usuariosJSON) {
      const hash = await bcrypt.hash(contraseña, 10);
      const usuario = await Usuario.create({ ...datos, contraseña: hash });
      idsUsuarios[id] = usuario._id;
    }
    console.log(`${usuariosJSON.length} usuarios migrados (contraseñas encriptadas)`);

    // 3. ventas: reemplazo los ids viejos por los _id nuevos
    for (const { id, id_usuario, productos, ...datos } of ventasJSON) {
      await Venta.create({
        ...datos,
        id_usuario: idsUsuarios[id_usuario],
        productos: productos.map(item => ({
          id_producto: idsProductos[item.id_producto],
          cantidad: item.cantidad,
          precio_unitario: preciosProductos[item.id_producto]
        }))
      });
    }
    console.log(`${ventasJSON.length} ventas migradas`);

    console.log('Migracion terminada');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error en la migracion:', error.message);
    process.exit(1);
  }
};

migrar();
