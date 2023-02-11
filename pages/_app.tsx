import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { useRef } from 'react';
import { AuthUserProvider } from '@/contexts/auth_user.context';

function MyApp({ Component, pageProps }: AppProps) {
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }
  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ChakraProvider>
        <AuthUserProvider>
          <Component {...pageProps} />
        </AuthUserProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
