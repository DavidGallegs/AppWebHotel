fetch('http://localhost:8000/api/reservas/1/confirmar', {
  method: 'POST'
})
.then(response => response.json())
.then(data => {
    console.log('Respuesta del servidor:', data);
})
.catch(error => {
    console.error('Error:', error);
});