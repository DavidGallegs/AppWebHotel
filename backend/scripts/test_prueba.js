// test_prueba.js
import fetch from 'node-fetch';

const reserva = {
  nombre: "Guille",
  apellido1: "Niebla",
  apellido2: "Pérez",
  fechaNacimiento: "1990-05-12",
  nacionalidad: "ESP",
  direccion: "Calle Falsa 123",
  codigoMunicipio: "41001",
  nombreMunicipio: "Sevilla",
  localidad: "Sevilla",
  cp: "41001",
  pais: "ESP",
  telefono: "600123456",
  correo: "guille@example.com",
  sexo: "M",
  tipoDocumento: "DNI",
  documento: "12345678A",
  soporteDocumento: "DNI"
};

fetch('http://localhost:8000/api/reservas', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'  // <- Esto indica que quieres JSON de vuelta
  },
  body: JSON.stringify(reserva)
})
.then(res => res.json())
.then(data => console.log("Respuesta del backend:", data))
.catch(err => console.error("Error:", err));