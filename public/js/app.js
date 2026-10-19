// funciones que se usan en todas las paginas

export function getUser() {
  return JSON.parse(sessionStorage.getItem('lumiBakeryUser'));
}

export function getCarrito() {
  return JSON.parse(localStorage.getItem('lumiCarrito')) || [];
}

export function saveCarrito(carrito) {
  localStorage.setItem('lumiCarrito', JSON.stringify(carrito));
  actualizarContador();
}

export function formatPrecio(n) {
  return '$' + n.toLocaleString('es-AR');
}

export function showToast(mensaje) {
  const toast = document.getElementById('lumi-toast');
  toast.textContent = mensaje;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

export function renderNavbar() {
  const user = getUser();

  const sesion = user
    ? `<li><span class="nav-saludo">Hola, ${user.nombre} 🍞</span></li>
       <li><button class="btn-logout" id="btn-logout">Cerrar sesión</button></li>`
    : `<li><a href="login.html" class="btn-login">Iniciar sesión</a></li>`;

  document.getElementById('navbar-container').innerHTML = `
    <nav class="navbar">
      <div class="logo">LUMI BAKERY</div>
      <ul class="nav-links">
        <li><a href="index.html">Inicio</a></li>
        <li><a href="categorias.html">Categorías</a></li>
        <li><a href="carrito.html" class="nav-carrito-link">🛒 Carrito <span class="nav-carrito-count" id="nav-cart-count">0</span></a></li>
        ${sesion}
      </ul>
    </nav>`;

  if (user) {
    document.getElementById('btn-logout').addEventListener('click', () => {
      sessionStorage.removeItem('lumiBakeryUser');
      window.location.href = 'index.html';
    });
  }

  actualizarContador();
}

function actualizarContador() {
  const contador = document.getElementById('nav-cart-count');
  if (!contador) return;
  contador.textContent = getCarrito().reduce((total, p) => total + p.cantidad, 0);
}

// dibuja las cards de productos y les agrega el boton de carrito
export function mostrarProductos(contenedor, productos) {
  contenedor.innerHTML = `
    <div class="products-grid">
      ${productos.map(p => `
        <div class="product-card">
          <div class="card-img-wrapper">
            <img src="img/${p.imagen}" alt="${p.nombre}" class="card-img" />
          </div>
          <h3>${p.nombre}</h3>
          <p>${p.desc}</p>
          <div class="product-price">${formatPrecio(p.precio)}</div>
          ${p.disponible
            ? `<button class="btn-comprar" data-id="${p.id}">Agregar al carrito</button>`
            : `<button class="btn-comprar" disabled>Sin stock</button>`}
        </div>`).join('')}
    </div>`;

  contenedor.querySelectorAll('.btn-comprar[data-id]').forEach(boton => {
    boton.addEventListener('click', () => {
      const producto = productos.find(p => p.id === Number(boton.dataset.id));
      agregarAlCarrito(producto);
    });
  });
}

function agregarAlCarrito(producto) {
  const carrito = getCarrito();
  const item = carrito.find(p => p.id === producto.id);

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1
    });
  }

  saveCarrito(carrito);
  showToast(`✓ ${producto.nombre} agregado al carrito`);
}
