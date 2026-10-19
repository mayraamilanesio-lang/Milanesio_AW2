import { api } from './api.js';
import { renderNavbar, mostrarProductos } from './app.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();

  const contenedor = document.getElementById('products-container');

  try {
    const { ok, data } = await api.listarProductos();
    if (!ok) throw new Error(data.error);
    mostrarProductos(contenedor, data);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = '<p class="mensaje">No se pudieron cargar los productos.</p>';
  }
});
