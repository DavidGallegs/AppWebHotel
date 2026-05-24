import { signOut } from 'auth-astro/client';

export default function LogoutButton() {

  const handleLogout = async () => {
  await fetch('http://localhost:8000/api/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    localStorage.removeItem('token');

    await signOut();

    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="logout-btn"
      aria-label="Cerrar la sesión actual"
    >
      Cerrar Sesión
    </button>
  );
}