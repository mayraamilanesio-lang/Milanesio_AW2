import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productosRoutes from './routes/productos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import { conectarDB } from './config/db.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error('Falta la variable JWT_SECRET en el archivo .env');
  process.exit(1);
}

// primero me conecto a la base de datos
await conectarDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// el front esta en la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ventas', ventasRoutes);

// cualquier ruta de la API que no exista
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
