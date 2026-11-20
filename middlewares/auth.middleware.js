import jwt from 'jsonwebtoken';
import 'dotenv/config';

// verifica que la peticion traiga un token valido en el header:
// Authorization: Bearer <token>
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // si el token es valido guarda los datos del usuario en la request
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalido o vencido.' });
  }
};
