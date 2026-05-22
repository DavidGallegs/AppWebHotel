import { signOut } from 'auth-astro/client';
export default function LogoutButton() {
  const handleLogout = async () => {
    const options = { callbackUrl: '/login' };
    await signOut(options as any);
  };
  return <button onClick={handleLogout} className="logout-btn" aria-label="Cerrar la sesión actual">Cerrar Sesión</button>;
}