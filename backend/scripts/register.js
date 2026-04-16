import fetch from 'node-fetch';

const user = {
  name: "Melanie Lozada",
  email: "melanie@ejemplo.com",
  password: "password123",
  password_confirmation: "password123"
};

fetch('http://localhost:8000/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(user)
})
.then(async (res) => {
  const text = await res.text(); 
    console.log("STATUS:", res.status);
  try {
    const data = JSON.parse(text);
    console.log("Respuesta backend:", data);
  } catch (e) {
    console.log("Respuesta NO JSON:", text);
  }
})
.catch(err => console.error("Error:", err));