/* eslint-disable prettier/prettier */
import {
  Box,
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri';
import { QueryObserverResult, RefetchOptions } from 'react-query';

import { SanitizedOrderForCard } from '../../@types/dashboard';
import { Order } from '../../@types/order';
import { useAuth } from '../../contexts/Auth';
import { setupApiClient } from '../../services/api';

interface ComponentProps {
  clearSelectedOrderId: () => void;
  selectedOrder: Order;
  refetchOrder: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Order, unknown>>;
  refetchOrders: (options?: RefetchOptions) => Promise<
    QueryObserverResult<
      {
        endedOrders: SanitizedOrderForCard[];
        ongoingOrders: SanitizedOrderForCard[];
      },
      unknown
    >
  >;
}

export function ManageOrder({
  clearSelectedOrderId,
  refetchOrder,
  refetchOrders,
  selectedOrder,
}: ComponentProps): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const order = selectedOrder;

  const [modalError, setModalError] = useState(false);
  const [messageErr, setMessageErr] = useState('Não foi possível processar ação');

  const isFinishedOrCancelled =
    order?.status === 'cancelled' || order?.status === 'delivered';

  async function handleCancelOrder(): Promise<void> {
    if (!isAuthenticated) return;
    const api = setupApiClient();
    try {
      await api.put(`/orders/${order?._id}/cancel`);
      Promise.allSettled([refetchOrder(), refetchOrders()]);
      clearSelectedOrderId();
    } catch (err: any) {
      setMessageErr(`Não foi possível cancelar: ${err?.response?.data?.message || err.message}`);
      setModalError(true);
    }
  }

  async function handleAcceptOrder(): Promise<void> {
    if (!isAuthenticated) return;
    const api = setupApiClient();
    try {
      await api.put(`/orders/${order?._id}/status`, { status: 'confirmed' });
      Promise.allSettled([refetchOrder(), refetchOrders()]);
    } catch (err: any) {
      setMessageErr(`Não foi possível aceitar: ${err?.response?.data?.message || err.message}`);
      setModalError(true);
    }
  }

  async function handlePreparing(): Promise<void> {
    if (!isAuthenticated) return;
    const api = setupApiClient();
    try {
      await api.put(`/orders/${order?._id}/status`, { status: 'preparing' });
      Promise.allSettled([refetchOrder(), refetchOrders()]);
    } catch (err: any) {
      setMessageErr(`Não foi possível iniciar preparação: ${err?.response?.data?.message || err.message}`);
      setModalError(true);
    }
  }

  async function handleReady(): Promise<void> {
    if (!isAuthenticated) return;
    const api = setupApiClient();
    try {
      await api.put(`/orders/${order?._id}/status`, { status: 'ready' });
      Promise.allSettled([refetchOrder(), refetchOrders()]);
    } catch (err: any) {
      setMessageErr(`Não foi possível marcar como pronto: ${err?.response?.data?.message || err.message}`);
      setModalError(true);
    }
  }

  async function handleDelivering(): Promise<void> {
    if (!isAuthenticated) return;
    const api = setupApiClient();
    try {
      await api.put(`/orders/${order?._id}/status`, { status: 'delivering' });
      Promise.allSettled([refetchOrder(), refetchOrders()]);
    } catch (err: any) {
      setMessageErr(`Não foi possível enviar para entrega: ${err?.response?.data?.message || err.message}`);
      setModalError(true);
    }
  }

  async function handleDelivered(): Promise<void> {
    if (!isAuthenticated) return;
    const api = setupApiClient();
    try {
      await api.put(`/orders/${order?._id}/status`, { status: 'delivered' });
      Promise.allSettled([refetchOrder(), refetchOrders()]);
    } catch (err: any) {
      setMessageErr(`Não foi possível finalizar: ${err?.response?.data?.message || err.message}`);
      setModalError(true);
    }
  }

  return (
    <>
      <Modal isOpen={modalError} onClose={() => setModalError(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Toop Delivery</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>{messageErr}</div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={() => setModalError(false)}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <VStack spacing={2}>
        {!isFinishedOrCancelled && (
          <>
            {order?.status === 'pending' && (
              <Button
                colorScheme="green"
                leftIcon={<Icon as={RiCheckLine} height={6} width={6} />}
                onClick={handleAcceptOrder}
                width="100%"
              >
                Aceitar Pedido
              </Button>
            )}
            {order?.status === 'confirmed' && (
              <Button
                colorScheme="orange"
                leftIcon={<Icon as={RiCheckLine} height={6} width={6} />}
                onClick={handlePreparing}
                width="100%"
              >
                Iniciar Preparação
              </Button>
            )}
            {order?.status === 'preparing' && (
              <Button
                colorScheme="yellow"
                leftIcon={<Icon as={RiCheckLine} height={6} width={6} />}
                onClick={handleReady}
                width="100%"
              >
                Marcar como Pronto
              </Button>
            )}
            {order?.status === 'ready' && (
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={RiCheckLine} height={6} width={6} />}
                onClick={handleDelivering}
                width="100%"
              >
                Enviar para Entrega
              </Button>
            )}
            {order?.status === 'delivering' && (
              <Button
                colorScheme="green"
                leftIcon={<Icon as={RiCheckLine} height={6} width={6} />}
                onClick={handleDelivered}
                width="100%"
              >
                Finalizar Entrega
              </Button>
            )}
            {order?.status !== 'pending' && (
              <Button
                colorScheme="red"
                leftIcon={<Icon as={RiCloseLine} height={6} width={6} />}
                onClick={handleCancelOrder}
                width="100%"
              >
                Cancelar
              </Button>
            )}
          </>
        )}
      </VStack>
    </>
  );
}
