import { signOut } from 'auth-astro/client';

export default function LogoutButton() {
  const handleLogout = async () => {
    // 1. Preparamos las opciones
    const options = {
      callbackUrl: '/login',
    };

    // 2. Usamos 'as any' para evitar el Error 2353 de TypeScript
    // auth-astro pasará esto a NextAuth, que sí sabe qué hacer con el callbackUrl
    await signOut(options as any);
  };

  return (
    <button 
      onClick={handleLogout} 
      className="logout-btn" 
      style={{ cursor: 'pointer' }}
    >
      Cerrar Sesión
    </button>
  );
}