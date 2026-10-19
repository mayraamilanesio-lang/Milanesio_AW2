const BACKEND_PORT = 3000;

export const API_URL =
  location.port === String(BACKEND_PORT)
    ? '/api'
    : `http://localhost:${BACKEND_PORT}/api`;

async function request(method, url, body) {
  const opciones = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body !== undefined) opciones.body = JSON.stringify(body);

  const res = await fetch(url, opciones);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export const api = {
  listarProductos: () => request('GET', `${API_URL}/productos`),
  productosPorCategoria: (categoria) => request('GET', `${API_URL}/productos?categoria=${categoria}`),
  login: (email, contraseña) => request('POST', `${API_URL}/usuarios/login`, { email, contraseña }),
  crearVenta: (venta) => request('POST', `${API_URL}/ventas`, venta)
};
