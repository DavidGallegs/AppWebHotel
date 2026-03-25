// test_prueba.js
import fetch from 'node-fetch';

const reserva = {
  viajeros: [
    {
      rol: "TI",
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
      documento: "54882182L",
      soporteDocumento: "AE8765674"
    },
    {
      rol: "VI",
      parentesco: "HJ",
      nombre: "Ana",
      apellido1: "López",
      apellido2: "Martín",
      fechaNacimiento: "1992-08-20",
      nacionalidad: "ESP",
      direccion: "Calle Falsa 123",
      codigoMunicipio: "41001",
      nombreMunicipio: "Sevilla",
      localidad: "Sevilla",
      cp: "41001",
      pais: "ESP",
      telefono: "600987654",
      correo: "ana@example.com",
      sexo: "F",
      tipoDocumento: "DNI",
      documento: "43511981Y",
      soporteDocumento: "BB1234567"
    }
  ]
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