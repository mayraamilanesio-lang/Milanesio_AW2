import { api } from './api.js';
import { renderNavbar, getUser, getCarrito, saveCarrito, formatPrecio, showToast } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();

  const contenido = document.getElementById('carrito-contenido');
  const resumen = document.getElementById('carrito-resumen');
  const btnComprar = document.getElementById('btn-comprar');
  const error = document.getElementById('form-error');

  function mostrarCarrito() {
    const carrito = getCarrito();

    if (carrito.length === 0) {
      contenido.innerHTML = `
        <div class="carrito-vacio">
          <p style="font-size:3rem">🍰</p>
          <p>Tu carrito está vacío.</p>
          <a href="index.html">Ver productos</a>
        </div>`;
      resumen.style.display = 'none';
      return;
    }

    resumen.style.display = 'flex';

    contenido.innerHTML = carrito.map(p => `
      <div class="carrito-item">
        <img class="carrito-item-img" src="img/${p.imagen}" alt="${p.nombre}" />
        <div class="carrito-item-info">
          <p class="carrito-item-nombre">${p.nombre}</p>
          <p class="carrito-item-cat">${p.categoria}</p>
          <p class="carrito-item-precio">${formatPrecio(p.precio)} c/u</p>
        </div>
        <div class="carrito-item-qty">
          <button class="qty-btn" data-id="${p.id}" data-cambio="-1">−</button>
          <span>${p.cantidad}</span>
          <button class="qty-btn" data-id="${p.id}" data-cambio="1">+</button>
        </div>
        <p class="carrito-item-subtotal">${formatPrecio(p.precio * p.cantidad)}</p>
        <button class="btn-eliminar" data-id="${p.id}">✕</button>
      </div>`).join('');

    const total = carrito.reduce((suma, p) => suma + p.precio * p.cantidad, 0);
    document.getElementById('resumen-total').textContent = formatPrecio(total);

    contenido.querySelectorAll('.qty-btn').forEach(boton => {
      boton.addEventListener('click', () => {
        cambiarCantidad(Number(boton.dataset.id), Number(boton.dataset.cambio));
      });
    });

    contenido.querySelectorAll('.btn-eliminar').forEach(boton => {
      boton.addEventListener('click', () => eliminarProducto(Number(boton.dataset.id)));
    });
  }

  function cambiarCantidad(id, cambio) {
    const carrito = getCarrito();
    const item = carrito.find(p => p.id === id);
    item.cantidad += cambio;

    if (item.cantidad <= 0) {
      eliminarProducto(id);
      return;
    }

    saveCarrito(carrito);
    mostrarCarrito();
  }

  function eliminarProducto(id) {
    const carrito = getCarrito().filter(p => p.id !== id);
    saveCarrito(carrito);
    mostrarCarrito();
  }

  btnComprar.addEventListener('click', async () => {
    const user = getUser();

    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const direccion = document.getElementById('direccion').value.trim();

    if (!direccion) {
      error.textContent = 'Ingresá una dirección de entrega.';
      return;
    }

    const venta = {
      id_usuario: user.id,
      fecha: new Date().toISOString().slice(0, 10),
      direccion,
      productos: getCarrito().map(p => ({ id_producto: p.id, cantidad: p.cantidad }))
    };

    try {
      const { ok, data } = await api.crearVenta(venta);

      if (!ok) {
        error.textContent = data.error;
        return;
      }

      localStorage.removeItem('lumiCarrito');
      renderNavbar();
      resumen.style.display = 'none';
      contenido.innerHTML = `
        <div class="carrito-vacio">
          <p style="font-size:3rem">🎉</p>
          <p>¡Gracias por tu compra! Tu pedido es el número ${data.id}.</p>
          <p>Total: ${formatPrecio(data.total)}</p>
          <a href="index.html">Volver al inicio</a>
        </div>`;
      showToast('✓ Compra realizada');
    } catch (err) {
      console.error(err);
      error.textContent = 'No se pudo conectar con el servidor.';
    }
  });

  mostrarCarrito();
});
