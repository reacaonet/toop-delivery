import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

import { CartItem } from '../components/CartItem';
import { Container } from '../components/Container';
import { ManageOrder } from '../components/ManageOrder';
import { OrderCard } from '../components/OrderCard';
import { OrderDeliveryAddress } from '../components/OrderDeliveryAddress';
import { OrderDetails } from '../components/OrderDetails';
import { useAuth } from '../contexts/Auth';
import env from '../environment';
import { useOrder } from '../hooks/useOrder';
import { useOrders } from '../hooks/useOrders';
import { database } from '../services/firebase';

export default function Home(): JSX.Element {
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const { isAuthenticated, user } = useAuth();
  const {
    data: selectedOrder,
    isLoading: isLoadingOrder,
    isFetching: isFetchingOrder,
    refetch: refetchOrder,
  } = useOrder(selectedOrderId);
  const {
    data: ordersData,
    isFetching: isFetchingOrders,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useOrders();
  const router = useRouter();
  const toast = useToast();

  const scrollbarTrackColor = useColorModeValue('#EDF2F7', '#171923');
  const scrollbarColor = useColorModeValue('#CBD5E0', '#2D3748');
  const buttonBg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('green.500', 'green.700');
  let player: HTMLAudioElement;

  useEffect(() => {
    const newOrdersRef = database.ref(`newOrder/${user?.id}/`);
    const ordersRef = database.ref(`order`);

    newOrdersRef.on('child_added', async () => {
      await refetchOrders().then(() => {
        toast({
          title: 'Os pedidos foram recarregados.',
          description: 'Novos pedidos foram feitos.',
          status: 'success',
          duration: 5000,
          position: 'bottom-right',
        });
        new Audio('/alert.mp3').play();
      });
    });

    ordersRef.on('child_changed', async () => {
      console.log('Atualizacao nos pedidos');
      await refetchOrder();
      await refetchOrders();
    });

    return () => {
      newOrdersRef.off();
      ordersRef.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/home');
      return;
    }

    if (selectedOrder) {
      refetchOrder();
    }

    if (ordersData) {
      refetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    //console.log(ordersData.ongoingOrders);
  }, [ordersData?.ongoingOrders]);

  function hasPending(): boolean {
    let pending = false;
    ordersData?.ongoingOrders.forEach(order => {
      if (order.status === 'WAIT_COMPANY') {
        pending = true;
      }
    });

    return pending;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function toggleAlert(): void {
    if (hasPending()) {
      console.log('PLAY AUDIO');
      if (player.paused) {
        player.play();
      }

      player.addEventListener('ended', () => {
        if (hasPending()) {
          player.play();
        } else {
          player.pause();
        }
      });
    }
    console.log('NO PLAY AUDIO');
  }

  function handleChangeSelectedOrderId(id: string): void {
    setSelectedOrderId(id);
  }

  async function handleRefresh(): Promise<void> {
    await refetchOrders();
    await refetchOrder();
  }

  return (
    <>
      <Container
        upperContainerProps={{
          alignItems: 'unset',
          justifyContent: 'unset',
          maxHeight: '100vh',
          width: '100%',
        }}
        paddingX="2.5"
        paddingY="0"
        maxHeight="100vh"
        flexDirection="column"
        width="100%">
        <Head>
          <title>Painel — {env.name}</title>
        </Head>

        {isLoadingOrders || isFetchingOrders ? (
          <Box paddingX="3" marginX="auto" marginY="auto">
            <Spinner size="lg" color="primary.300" />
          </Box>
        ) : (
          <Tabs
            colorScheme="primary"
            isFitted
            onChange={() => setSelectedOrderId(null)}>
            <TabList>
              <Tab>Novas/Em Andamento</Tab>
              <Tab>Canceladas/Finalizadas</Tab>
            </TabList>

            <TabPanels>
              <TabPanel flexDirection={'row'}>
                <HStack
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: scrollbarTrackColor,
                      borderRadius: '24px',
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: scrollbarColor,
                      borderRadius: '24px',
                    },
                  }}
                  overflowX="scroll"
                  minHeight="40"
                  marginBottom="1.5">
                  <IconButton
                    onClick={handleRefresh}
                    aria-label={'Refetch orders'}
                    icon={
                      <Icon as={FiRefreshCw} w={9} h={9} color={iconColor} />
                    }
                    background={buttonBg}
                    marginEnd={1}
                  />

                  {ordersData?.ongoingOrders?.map((order, idx) => (
                    <OrderCard
                      key={order?.id + idx}
                      isActive={selectedOrderId === order?.id}
                      onClick={handleChangeSelectedOrderId}
                      order={order}
                    />
                  ))}
                </HStack>
              </TabPanel>
              <TabPanel>
                <HStack
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: scrollbarTrackColor,
                      borderRadius: '24px',
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: scrollbarColor,
                      borderRadius: '24px',
                    },
                  }}
                  overflowX="scroll"
                  minHeight="40"
                  marginBottom="1.5">
                  {ordersData?.endedOrders?.map((order, idx) => (
                    <OrderCard
                      key={order?.id + idx}
                      isActive={selectedOrderId === order?.id}
                      onClick={handleChangeSelectedOrderId}
                      order={order}
                    />
                  ))}
                </HStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}

        {isLoadingOrder || isFetchingOrder ? (
          <Box marginX="auto" marginY="auto">
            <Spinner color="red.600" size="xl" speed="0.65s" thickness="2px" />
          </Box>
        ) : selectedOrder ? (
          <Box marginY="1.5">
            <Heading fontWeight="normal">
              Pedido de <b>{selectedOrder?.order.customer.person[0].name}</b> -
              Nº <b>{selectedOrder?.order.order_number}</b>
            </Heading>

            <Stack
              direction={{
                base: 'column',
                lg: 'row',
              }}
              marginTop="3"
              spacing="4">
              <Box height="72" flex={1}>
                <Heading fontSize="xl" fontWeight="semibold">
                  DETALHES
                </Heading>
                <OrderDetails order={selectedOrder?.order} />
              </Box>
              <Box height="72" flex={1}>
                <Heading fontSize="xl" fontWeight="semibold">
                  ENDEREÇO DO CLIENTE
                </Heading>
                <OrderDeliveryAddress
                  companyCoordinates={
                    selectedOrder?.order.company.location.coordinates
                  }
                  customerCoordinates={
                    selectedOrder?.order.customerDelivery.location.coordinates
                  }
                  customerReferencePoint={
                    selectedOrder?.order.customerDelivery.referencePoint
                  }
                  customerAddress={
                    selectedOrder?.order.customerDelivery.address
                  }
                  customerComplement={
                    selectedOrder?.order.customerDelivery.complement
                  }
                />
              </Box>
              <Box height="72" flex={1}>
                <Heading fontSize="xl" fontWeight="semibold">
                  CONTATOS
                </Heading>
                <Flex alignItems="flex-end" flexDirection="row">
                  <Heading fontSize="lg" fontWeight="semibold">
                    Celular:
                  </Heading>
                  <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
                    {selectedOrder?.order.customer.person[0].phone
                      ? selectedOrder?.order.customer.person[0].phone
                      : 'Não informado'}
                  </Text>
                </Flex>
              </Box>
              <Box height="72" flex={1}>
                <ManageOrder
                  clearSelectedOrderId={() => setSelectedOrderId(null)}
                  refetchOrder={refetchOrder}
                  refetchOrders={refetchOrders}
                  selectedOrder={selectedOrder}
                />
              </Box>
            </Stack>

            <Heading fontSize="lg" marginY={6}>
              CARRINHO
            </Heading>
            <Stack paddingBottom="3" width="full">
              {selectedOrder?.cart?.map(item => (
                <CartItem key={item._id} item={item} />
              ))}
            </Stack>
          </Box>
        ) : (
          <Box paddingX="3" marginX="auto" marginY="auto">
            <Heading fontSize={['lg', 'lg', 'xl']}>
              Selecione um pedido.
            </Heading>
          </Box>
        )}
        <Text fontSize={10} textAlign={'end'}>
          2021.11.05 - 14:18
        </Text>
      </Container>
    </>
  );
}
