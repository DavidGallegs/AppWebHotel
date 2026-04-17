// test_prueba.js
import fetch from 'node-fetch';

const reserva = {
  
 
  fechaEntrada: "2026-05-01",
  fechaSalida: "2026-05-05",
   numHabitaciones: 1,
   numPersonas: 2,
   tipoPago: "EFECT",
  titular: {
    nombre: "Guille",
    apellido1: "Niebla",
    apellido2: "Pérez",
    fechaNacimiento: "1990-05-12",
    nacionalidad: "ESP",
    direccion: "Calle Falsa 123",
    codigoMunicipio: "41001",
    nombreMunicipio: "Sevilla",
    localidad: "Sevilla",
    codigoPostal: "41001",
    telefono: "600123456",
    correo: "guille@example.com",
    tipoDocumento: "DNI",
    numeroDocumento: "54882182L",
    soporteDocumento: "AE8765674"
  }
};

fetch('http://localhost:8000/api/reservas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(reserva)
})
.then(async res => {
  const data = await res.json();
  console.log("Respuesta del backend:", data);
})
.catch(err => console.error("Error:", err));