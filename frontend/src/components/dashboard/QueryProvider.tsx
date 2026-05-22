import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { setAuthToken } from './api';

interface Props {
  children: React.ReactNode;
  token: string;
}

/* * COMPONENTE: QueryProvider
 * Propósito: Envuelve tu aplicación (o la parte del Dashboard) para darle superpoderes de caché.
 * React Query evita que hagamos peticiones al backend todo el tiempo; guarda los datos
 * temporalmente y los actualiza en segundo plano para que la app se sienta ultra rápida.
 */
export const QueryProvider = ({ children, token }: Props) => {
  // 1. Lo primero que hacemos al cargar el Dashboard es decirle a Axios: "Toma, aquí está el pase VIP (Token)".
  setAuthToken(token);

  // 2. Iniciamos el cliente de React Query.
  // Lo guardamos en un estado (useState) para asegurarnos de que no se reinicie 
  // por accidente si este componente se vuelve a renderizar.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // refetchOnWindowFocus: false -> Evita que recargue los datos del servidor solo por cambiar de pestaña en el navegador.
        refetchOnWindowFocus: false,
        retry: 1, // Si falla una petición, lo intentará una vez más automáticamente.
      },
    },
  }));

  // 3. Compartimos esta configuración con todos los componentes "hijos".
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};