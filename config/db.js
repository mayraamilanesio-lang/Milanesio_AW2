import mongoose from 'mongoose';
import 'dotenv/config';

export const conectarDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Falta la variable MONGO_URI en el archivo .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};
