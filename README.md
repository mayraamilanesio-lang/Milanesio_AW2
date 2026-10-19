Proyecto realizado por Mayra Azul Milanesio

LUMI BAKERY - Tercera entrega

Aplicación web para realizar pedidos a una pastelería. 

Monorepo

Para instalar y correr:
npm install
npm run dev

Abrir http://localhost:3000

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
POST /api/productos
- Body: { "nombre": "...", "categoria": "...", "desc": "...", "precio": 1000, "disponible": true, "imagen": "..." }
PUT /api/productos/:id
DELETE /api/productos/:id
- Si el producto está en alguna venta, no lo deja borrar (error 409)

===========================================
USUARIOS
===========================================

POST /api/usuarios/login
- Body: { "email": "...", "contraseña": "..." }

GET /api/usuarios
GET /api/usuarios/:id
POST /api/usuarios
- Body: { "nombre": "...", "apellido": "...", "email": "...", "contraseña": "...", "esAdmin": false }
PUT /api/usuarios/:id
DELETE /api/usuarios/:id
- Si el usuario tiene ventas, no lo deja borrar (error 409)

===========================================
VENTAS
===========================================

GET /api/ventas
- Query opcional: ?pagado=true

GET /api/ventas/:id
POST /api/ventas
- Es la orden de compra que se genera desde el carrito
- Valida que exista el usuario y que los productos existan y estén disponibles
- El total se calcula en el backend
- Body: { "id_usuario": 2, "fecha": "2026-10-18", "direccion": "...", "productos": [ { "id_producto": 201, "cantidad": 2 } ] }
PUT /api/ventas/:id
DELETE /api/ventas/:id
