import mongoose from 'mongoose';

// revisa que el :id de la URL tenga formato de ObjectId de Mongo
export const validarId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'El id no es valido' });
  }
  next();
};
