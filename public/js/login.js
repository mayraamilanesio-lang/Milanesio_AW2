import { api } from './api.js';
import { renderNavbar, getCarrito } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();

  const form = document.getElementById('form-login');
  const error = document.getElementById('form-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const contraseña = document.getElementById('password').value;

    if (!email || !contraseña) {
      error.textContent = 'Completá todos los campos.';
      return;
    }

    try {
      const { ok, data } = await api.login(email, contraseña);

      if (!ok) {
        error.textContent = data.error;
        return;
      }

      sessionStorage.setItem('lumiBakeryUser', JSON.stringify(data.usuario));
      window.location.href = getCarrito().length > 0 ? 'carrito.html' : 'index.html';
    } catch (err) {
      console.error(err);
      error.textContent = 'No se pudo conectar con el servidor.';
    }
  });
});
