async function login() {
  try {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'melanie@ejemplo.com',
        password: 'password123'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Error login:', data);
      return;
    }

    console.log('✅ Login correcto');
    console.log('User:', data.user);
    console.log('Token:', data.token);

    // Guardar token (opcional)
    localStorage.setItem('token', data.token);

  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

login();