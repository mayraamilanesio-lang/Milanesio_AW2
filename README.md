Proyecto realizado por Mayra Azul Milanesio

LUMI BAKERY - Cuarta entrega (final)

Documentación completa de la entrega: ver ENTREGA_4.md

Aplicación web para realizar pedidos a una pastelería. 

Monorepo

Tecnologías: Node.js, Express, MongoDB (Mongoose), bcryptjs, jsonwebtoken

Para instalar y correr:
npm install
copiar .env.example como .env y completar MONGO_URI y JWT_SECRET
npm run seed      (migra los JSON de data/ a MongoDB, una sola vez)
npm run dev

Abrir http://localhost:3000

Las contraseñas se guardan encriptadas con bcrypt.
El login devuelve un token JWT. Las rutas POST, PUT y DELETE necesitan el header:
Authorization: Bearer <token>
Los ids ahora son ObjectId de MongoDB (ej: 6aff70d6c4d4305b12598f4d).

Usuarios para probar:
admin@lumi.com / 1234
usuario@lumi.com / 1111

===========================================
PÁGINAS
===========================================

index.html       Listado de todos los productos
categorias.html  Filtro de productos por categoría
carrito.html     Carrito guardado en localStorage y botón para comprar
login.html       Inicio de sesión (necesario para comprar)

===========================================
PRODUCTOS
===========================================

GET /api/productos
- Lista todos los productos
- Query opcional: ?categoria=Tortas  ?disponible=true

GET /api/productos/:id
POST /api/productos  (requiere token)
- Body: { "nombre": "...", "categoria": "...", "desc": "...", "precio": 1000, "disponible": true, "imagen": "..." }
PUT /api/productos/:id  (requiere token)
DELETE /api/productos/:id  (requiere token)
- Si el producto está en alguna venta, no lo deja borrar (error 409)

===========================================
USUARIOS
===========================================

POST /api/usuarios/login
- Body: { "email": "...", "contraseña": "..." }
- Devuelve { mensaje, token, usuario }

GET /api/usuarios
GET /api/usuarios/:id
POST /api/usuarios  (requiere token)
- Body: { "nombre": "...", "apellido": "...", "email": "...", "contraseña": "...", "esAdmin": false }
PUT /api/usuarios/:id  (requiere token)
DELETE /api/usuarios/:id  (requiere token)
- Si el usuario tiene ventas, no lo deja borrar (error 409)

===========================================
VENTAS
===========================================

GET /api/ventas
- Query opcional: ?pagado=true

GET /api/ventas/:id
POST /api/ventas  (requiere token)
- Es la orden de compra que se genera desde el carrito
- El usuario se toma del token
- Valida que los productos existan y estén disponibles
- El total se calcula en el backend
- Body: { "direccion": "...", "productos": [ { "id_producto": "<id del producto>", "cantidad": 2 } ] }
PUT /api/ventas/:id  (requiere token)
DELETE /api/ventas/:id  (requiere token)
