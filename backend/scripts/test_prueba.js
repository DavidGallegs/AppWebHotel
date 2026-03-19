// test_prueba.js
import fetch from 'node-fetch';

const reserva = {
  nombre: "Guille",
  apellido1: "Niebla",
  apellido2: "Pérez",
  fechaNacimiento: "1990-05-12",
  nacionalidad: "ES",
  direccion: "Calle Falsa 123",
  codigoMunicipio: "41001",
  nombreMunicipio: "Sevilla",
  localidad: "Sevilla",
  cp: "41001",
  pais: "España",
  telefono: "600123456",
  correo: "guille@example.com",
  sexo: "M",
  tipoDocumento: "DNI",
  documento: "12345678A",
  soporteDocumento: "DNI",
  personas: 2
};

fetch('http://localhost:8000/api/reservas', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'  // <- Esto indica que quieres JSON de vuelta
  },
  body: JSON.stringify(reserva)
})
.then(res => res.text()) // <-- aquí conviertes la respuesta a texto
.then(text => {
    console.log("Respuesta cruda del backend:", text);
    try {
        const data = JSON.parse(text); // intentamos parsear JSON si es posible
        console.log("Respuesta parseada:", data);
    } catch(e) {
        console.error("No es JSON válido:", e);
    }
})
.catch(err => console.error("Error de fetch:", err));