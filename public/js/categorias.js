import { api } from './api.js';
import { renderNavbar, mostrarProductos } from './app.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();

  const filtros = document.getElementById('filtros');
  const contenedor = document.getElementById('products-container');

  try {
    const { data } = await api.listarProductos();

    // armo un boton por cada categoria sin repetir
    const categorias = [...new Set(data.map(p => p.categoria))];

    filtros.innerHTML = categorias
      .map(cat => `<button class="filtro-btn" data-categoria="${cat}">${cat}</button>`)
      .join('');

    mostrarProductos(contenedor, data);

    filtros.querySelectorAll('.filtro-btn').forEach(boton => {
      boton.addEventListener('click', async () => {
        filtros.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');

        const respuesta = await api.productosPorCategoria(boton.dataset.categoria);
        mostrarProductos(contenedor, respuesta.data);
      });
    });
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = '<p class="mensaje">No se pudieron cargar los productos.</p>';
  }
});
