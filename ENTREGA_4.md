# LUMI BAKERY – Cuarta entrega (final)

**Alumna:** Mayra Azul Milanesio
**Materia:** Aplicaciones Web 2

| | |
|---|---|
| Repositorio | https://github.com/mayraamilanesio-lang/Milanesio_AW2 |
| Deploy (Render) | https://lumi-bakery.onrender.com |
| Video explicativo | _(pegar link del video)_ |

---

## 1. Descripción general

Lumi Bakery es una aplicación web para hacer pedidos a una pastelería. El cliente puede ver el catálogo, filtrarlo por categoría, armar un carrito y, si inició sesión, confirmar la compra con una dirección de entrega.

El proyecto es un **monorepo**: el mismo servidor Express sirve la API REST (`/api/...`) y el front estático (carpeta `public/`).

En esta entrega se agregó:

- **Encriptación de contraseñas con Bcrypt.**
- **Autenticación con JWT**: el login devuelve un token y las acciones clave (comprar, crear, editar y borrar) lo exigen.
- **Migración de JSON a MongoDB** (Atlas) usando Mongoose.

---

## 2. Tecnologías y dependencias

| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor y API REST |
| MongoDB Atlas | Base de datos no relacional en la nube |
| Mongoose | Modelos, validaciones y consultas a MongoDB |
| bcryptjs | Encriptar contraseñas (hash con 10 rondas de salt) |
| jsonwebtoken | Generar y verificar tokens JWT |
| dotenv | Leer variables de entorno desde `.env` |
| cors | Permitir pedidos desde otro origen |
| nodemon | Reiniciar el servidor en desarrollo |
| HTML + CSS + JavaScript (módulos ES) | Front: catálogo, categorías, carrito y login |
| REST Client (extensión de VS Code) | Pruebas de la API |

---

## 3. Arquitectura y estructura de carpetas

```
Milanesio_AW2/
├── config/
│   └── db.js                     ← conexión a MongoDB
├── models/                       ← esquemas de Mongoose
│   ├── Producto.js
│   ├── Usuario.js
│   ├── Venta.js
│   └── opciones.js               ← opciones comunes (timestamps, id en vez de _id)
├── controllers/                  ← lógica de cada recurso
│   ├── productos.controller.js
│   ├── usuarios.controller.js    ← incluye login con bcrypt + JWT
│   └── ventas.controller.js
├── routes/                       ← definición de endpoints
├── middlewares/
│   ├── auth.middleware.js        ← verificarToken (JWT)
│   └── validarId.middleware.js   ← valida ObjectId en la URL
├── scripts/
│   └── seed.js                   ← migra los JSON a MongoDB
├── data/                         ← JSON originales (solo se usan para el seed)
├── public/                       ← front (HTML, CSS, JS, imágenes)
├── pruebas.http                  ← pruebas de la API (REST Client)
├── .env.example
└── index.js                      ← punto de entrada
```

La arquitectura sigue el patrón **rutas → middlewares → controladores → modelos**:

1. La **ruta** define el método y la URL.
2. Los **middlewares** se ejecutan antes: `verificarToken` controla el JWT y `validarId` revisa que el id tenga formato válido.
3. El **controlador** valida los datos y aplica las reglas de negocio.
4. El **modelo** de Mongoose lee y escribe en MongoDB.

---

## 4. Instalación y ejecución

```bash
npm install
cp .env.example .env     # completar MONGO_URI y JWT_SECRET
npm run seed             # migra data/*.json a MongoDB (encripta las contraseñas)
npm run dev              # http://localhost:3000
```

Variables de entorno (`.env`):

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (3000) |
| `MONGO_URI` | URI de conexión a MongoDB Atlas |
| `JWT_SECRET` | Clave secreta para firmar los tokens |
| `JWT_EXPIRES` | Duración del token (por defecto `2h`) |

Usuarios de prueba (se crean con el seed):

| Email | Contraseña | Rol |
|---|---|---|
| admin@lumi.com | 1234 | admin |
| usuario@lumi.com | 1111 | cliente |

---

## 5. Documentación de la API

Base: `http://localhost:3000/api`
🔒 = requiere header `Authorization: Bearer <token>`

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/usuarios/login` | Body `{ "email", "contraseña" }`. Devuelve `{ mensaje, token, usuario }` |

Respuestas de error: `400` faltan datos · `401` credenciales incorrectas · `403` usuario inactivo.
Si una ruta protegida no trae token responde `401`; si el token es inválido o venció responde `403`.

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/productos` | Lista. Filtros opcionales: `?categoria=Tortas`, `?disponible=true` |
| GET | `/productos/:id` | Uno por id |
| POST 🔒 | `/productos` | Body `{ nombre, categoria, precio, desc?, disponible?, imagen? }` |
| PUT 🔒 | `/productos/:id` | Actualiza los campos enviados |
| DELETE 🔒 | `/productos/:id` | `409` si el producto está en alguna venta |

### Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Lista (nunca devuelve la contraseña) |
| GET | `/usuarios/:id` | Uno por id |
| POST 🔒 | `/usuarios` | Body `{ nombre, apellido, email, contraseña, esAdmin? }`. La contraseña se guarda encriptada. `409` si el email ya existe |
| PUT 🔒 | `/usuarios/:id` | Si se envía `contraseña` se vuelve a encriptar |
| DELETE 🔒 | `/usuarios/:id` | `409` si el usuario tiene ventas |

### Ventas (compras)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/ventas` | Lista con datos del usuario y de los productos (`populate`). Filtro `?pagado=true` |
| GET | `/ventas/:id` | Una por id |
| POST 🔒 | `/ventas` | **Comprar.** Body `{ direccion, productos: [{ id_producto, cantidad }] }` |
| PUT 🔒 | `/ventas/:id` | Actualiza `fecha`, `direccion` o `pagado` |
| DELETE 🔒 | `/ventas/:id` | Elimina la venta |

Al comprar:

- El **usuario se toma del token**, no del body, así nadie puede comprar a nombre de otro.
- Se valida que cada producto exista y esté disponible.
- El **precio unitario y el total se calculan en el backend** con el precio real del producto, y el precio queda guardado en la venta.

Errores generales: `400` id con formato inválido o datos incorrectos · `404` recurso o ruta inexistente · `500` error del servidor.

---

## 6. Mejoras implementadas en esta entrega

### Seguridad: Bcrypt
- Las contraseñas se guardan como hash (`bcrypt.hash(contraseña, 10)`), nunca en texto plano.
- El login compara con `bcrypt.compare`.
- El hash se recalcula cuando se cambia la contraseña (PUT).
- El modelo `Usuario` quita la contraseña de toda respuesta JSON.

### Autenticación: JWT
- El login genera un token firmado con `JWT_SECRET` que vence en 2 horas. El payload lleva `id`, `email` y `esAdmin`.
- El middleware `verificarToken` protege todas las rutas POST, PUT y DELETE. Las GET quedan públicas para poder ver el catálogo.
- En el front el token se guarda en `sessionStorage` y se manda en el header `Authorization` al comprar.
- Si el token venció, el front cierra la sesión y redirige al login.

### Base de datos: MongoDB
- Hay tres colecciones (`productos`, `usuarios`, `ventas`) con esquemas y validaciones de Mongoose.
- Las ventas **referencian** a usuarios y productos por `ObjectId`, y se usa `populate` para traer sus datos.
- `scripts/seed.js` migra los JSON originales: convierte los ids numéricos a `ObjectId`, mantiene las relaciones entre ventas, usuarios y productos y encripta las contraseñas.
- Todos los documentos guardan `createdAt` y `updatedAt` automáticamente.

### Otras mejoras
- El middleware `validarId` devuelve `400` cuando el id de la URL no tiene formato válido.
- Los PUT solo permiten editar campos definidos, así no se pueden pisar `id`, `total` ni la contraseña sin encriptar.
- Hay validaciones de email, precio y cantidad, y el email se compara sin distinguir mayúsculas.
- Cualquier ruta inexistente de `/api` responde `404` en JSON.
- `.env` está en `.gitignore` y se agregó `.env.example`.
- Se agregó el archivo `pruebas.http` con todas las pruebas de la API. El login guarda el token automáticamente para el resto de los pedidos.

---

## 7. Pruebas

- **REST Client (VS Code):** el archivo `pruebas.http` tiene todas las pruebas; se ejecutan con el botón *Send Request* que aparece arriba de cada una. Primero se hace el login y el token se usa automáticamente en el resto. Cubre el CRUD completo de los tres recursos, login correcto e incorrecto, una petición sin token (401) y el borrado bloqueado de un producto con ventas (409).
- **Navegador:** agregar productos al carrito, ir a comprar sin sesión (redirige al login), iniciar sesión y confirmar la compra. La venta aparece en `GET /api/ventas` y en MongoDB Atlas.

---

## 8. Deploy

Como el proyecto es un **monorepo** (Express sirve la API y el front juntos), se publica con **un solo deploy** en [Render](https://render.com) como *Web Service*:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Variables de entorno:** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES` (las mismas del `.env`; Render asigna `PORT` solo)
- En MongoDB Atlas → *Network Access* se habilitó `0.0.0.0/0` para que Render pueda conectarse.

El front llama a la API con la ruta `/api`, así funciona igual en local (`localhost:3000`) y en Render. La página se abre siempre desde el servidor de Express, no con Live Server.

---

## 9. Reflexiones

- Dificultades: la parte más difícil fue la migración a MongoDB. En los JSON las ventas guardaban el id numérico del usuario y de cada producto, y al pasar a Mongo esos ids cambian por `ObjectId`. Tuve que armar el seed para que primero cargue productos y usuarios, guarde la equivalencia entre el id viejo y el nuevo, y recién después cargue las ventas con las referencias correctas. También me costó entender al principio la diferencia entre `401` (no mandaste token) y `403` (el token es inválido o venció).

- Aprendizajes: entendí por qué nunca hay que guardar contraseñas en texto plano y cómo bcrypt permite verificar una contraseña sin poder leerla. Aprendí qué es y cómo funciona un token JWT: el servidor lo firma con una clave secreta, el front lo guarda y lo manda en cada pedido protegido, y un middleware lo verifica antes de dejar pasar. También aprendí a separar los datos sensibles en el `.env` y a no subirlos al repositorio.

- Lo que más disfruté: ver el flujo completo funcionando: agregar productos al carrito, que la página me pida iniciar sesión, comprar y ver la venta aparecer en MongoDB Atlas con los datos del usuario y los productos.

- Mejoras a futuro: registro de usuarios desde el front, un panel de administración para cargar productos y ver ventas, permisos por rol (que solo un admin pueda crear o borrar productos), control de stock por cantidad y un historial de compras para cada cliente.
