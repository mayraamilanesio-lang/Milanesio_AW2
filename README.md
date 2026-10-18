LUMI BAKERY - Rutas del proyecto

Para instalar y correr:
npm install
npm start
(el servidor levanta en http://localhost:3000)

===========================================
PRODUCTOS
===========================================

GET /api/productos
- Lista todos los productos
- Query opcional: ?disponible=true (o false)

GET /api/productos/:id
- Devuelve un producto por id

POST /api/productos
- Crea un producto nuevo
- Body: { "nombre": "...", "desc": "...", "precio": 1000, "disponible": true, "imagen": "..." }

PUT /api/productos/:id
- Actualiza un producto existente
- Body: los campos que quieras cambiar

DELETE /api/productos/:id
- Elimina un producto
- Si el producto está en alguna venta, no lo deja borrar (error 409)

===========================================
USUARIOS
===========================================

GET /api/usuarios
- Lista todos los usuarios (no muestra la contraseña)

GET /api/usuarios/:id
- Devuelve un usuario por id (no muestra la contraseña)

POST /api/usuarios
- Crea un usuario nuevo (dato sensible: contraseña)
- Body: { "nombre": "...", "apellido": "...", "email": "...", "contraseña": "...", "esAdmin": false }

POST /api/usuarios/login
- Login de usuario (dato sensible: email + contraseña)
- Body: { "email": "...", "contraseña": "..." }

PUT /api/usuarios/:id
- Actualiza datos de un usuario
- Body: los campos que quieras cambiar

DELETE /api/usuarios/:id
- Elimina un usuario
- Si el usuario tiene ventas asociadas, no lo deja borrar (error 409)

===========================================
VENTAS
===========================================

GET /api/ventas
- Lista todas las ventas
- Query opcional: ?pagado=true (o false)

GET /api/ventas/:id
- Devuelve una venta por id

POST /api/ventas
- Crea una venta nueva
- Valida que el usuario exista y que todos los productos existan
- El total se calcula solo, según el precio de cada producto
- Body: { "id_usuario": 1, "fecha": "2024-08-01", "direccion": "...", "pagado": false, "productos": [ { "id_producto": 201, "cantidad": 2 } ] }

PUT /api/ventas/:id
- Actualiza una venta (ej: marcar como pagada, cambiar dirección)
- Body: los campos que quieras cambiar

DELETE /api/ventas/:id
- Elimina una venta


Documento estructuralmente organizado por Claude.ai

