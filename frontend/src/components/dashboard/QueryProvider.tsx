import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { setAuthToken } from './api';

interface Props {
  children: React.ReactNode;
  token: string;
}

export const QueryProvider = ({ children, token }: Props) => {
  // 1. Configuramos el token en Axios nada más nacer el componente
  setAuthToken(token);

  // 2. Iniciamos el cliente de React Query
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  // 3. Proveemos toda esta configuración a los componentes "hijos"
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};