const fs = require('fs');
const path = require('path');

// Lee un archivo JSON de la carpeta /data y devuelve su contenido parseado
function readData(fileName) {
  const filePath = path.join(__dirname, '..', 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Escribe (sobrescribe) un archivo JSON de la carpeta /data
function writeData(fileName, data) {
  const filePath = path.join(__dirname, '..', 'data', fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readData, writeData };
