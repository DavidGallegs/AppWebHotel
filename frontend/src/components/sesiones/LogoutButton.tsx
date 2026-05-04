import { signOut } from 'auth-astro/client';

export default function LogoutButton() {
  const handleLogout = async () => {
    // 1. Preparamos las opciones
    const options = {
      callbackUrl: '/login',
    };

    // 2. Usamos 'as any' para evitar el Error 2353 de TypeScript
    await signOut(options as any);
  };

  return (
    <button 
      onClick={handleLogout} 
      className="logout-btn"
    >
      Cerrar Sesión
    </button>
  );
}