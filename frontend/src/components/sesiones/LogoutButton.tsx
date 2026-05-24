import { signOut } from 'auth-astro/client';

export default function LogoutButton() {
  const handleLogout = async () => {
    // OBLIGAMOS a cerrar sesión y volver al login usando la IP/Dominio actual
    const destinoSeguro = window.location.origin + '/login';
    
    const options = { callbackUrl: destinoSeguro };
    await signOut(options as any);
  };

  return (
    <button onClick={handleLogout} className="logout-btn" aria-label="Cerrar la sesión actual">
      Cerrar Sesión
    </button>
  );
}