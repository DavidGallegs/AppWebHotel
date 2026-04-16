import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { setAuthToken } from './api';

interface Props {
  children: React.ReactNode;
  token: string; // Recibimos el token como Prop
}

export const QueryProvider = ({ children, token }: Props) => {
  // 1. Configuramos el token en Axios nada más nacer el componente
  setAuthToken(token);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};