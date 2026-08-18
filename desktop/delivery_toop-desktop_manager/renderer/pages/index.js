import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

function Home() {
  return (
    <Box p={8}>
      <Heading as="h1" mb={4}>
        ToopDelivery Manager
      </Heading>
      <Text fontSize="xl" mb={6}>
        Gestor de pedidos para restaurantes
      </Text>
      <Box>
        <Text mb={4}>
          Status: 🟢 Sistema Online
        </Text>
        <Text mb={4}>
          Versão: 0.3.2
        </Text>
        <Button colorScheme="blue" mr={4}>
          Ver Pedidos
        </Button>
        <Button colorScheme="green" mr={4}>
          Novo Pedido
        </Button>
        <Button colorScheme="orange">
          Configurações
        </Button>
      </Box>
    </Box>
  );
}

export default Home;
