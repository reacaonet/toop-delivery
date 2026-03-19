import '../styles/CFStyles.css';

import { ChakraProvider, Flex } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { WithSubnavigation } from '../components/Navbar';
import { AuthProvider } from '../contexts/Auth';
import { queryClient } from '../services/reactQuery/client';
import { theme } from '../styles/theme';

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Loading — Toop</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <Flex direction={'column'} minHeight={'100vh'}>
              <WithSubnavigation />
              <Flex flexGrow={1}>
                <Component {...pageProps} />
              </Flex>
            </Flex>
          </AuthProvider>
        </ChakraProvider>

        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </>
  );
}
