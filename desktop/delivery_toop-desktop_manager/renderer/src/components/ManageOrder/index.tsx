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
import { ipcRenderer } from 'electron';
import path from 'path';
import React, { useRef, useState } from 'react';
import { HiOutlineChevronDoubleRight } from 'react-icons/hi';
import {
  RiCheckLine,
  RiCloseLine,
  RiEBike2Line,
  RiPrinterLine,
} from 'react-icons/ri';
import { QueryObserverResult, RefetchOptions } from 'react-query';

/* import { useReactToPrint } from "react-to-print"; */
import { NewOrder, SanitizedOrderForCard } from '../../@types/dashboard';
import { useAuth } from '../../contexts/Auth';
import { setupApiClient } from '../../services/api';
/** Util */
import { normalizeObjectAccents } from '../../utils'
import { Chat } from '../Chat';
import { NFToPrint } from '../NFToPrint';

interface ComponentProps {
  clearSelectedOrderId: () => void;
  selectedOrder: NewOrder;
  refetchOrder: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<NewOrder, unknown>>;
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
  const componentRef = useRef();
  /* const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    removeAfterPrint: true
  }); */
  const { cart, order } = selectedOrder;
  const enabled =
    selectedOrder?.order?.status !== 'CANCELED' &&
    selectedOrder?.order?.status !== 'FINISHED';

  const [modalError, setModalError] = useState(false);
  const [messageErr, setMessageErr] = useState('Não foi possível processar ação');

  async function handleCancelOrder(): Promise<void> {
    const api = setupApiClient();

    await api.put(`/payment/cancel/order/${order?._id}`).then(() => {
      Promise.allSettled([refetchOrders()]);
      clearSelectedOrderId();
    });
  }

  async function handleAcceptOrder(): Promise<void> {
    if (isAuthenticated) {
      const api = setupApiClient();

      await api
        .put(`/order/status/${order?._id}`, {
          status: 'IN_PREPARATION',
          shopper: user?.id,
        })
        .then(() => {
          //handlePrint();
          Promise.allSettled([refetchOrder(), refetchOrders()]);
        });
    }
  }

  async function handleEndOrder(): Promise<void> {
    if (isAuthenticated) {
      const api = setupApiClient();

      await api
        .put(`/order/status/${order?._id}`, {
          status: 'FINISHED',
          shopper: user?.id,
        })
        .then(() => {
          Promise.allSettled([refetchOrder(), refetchOrders()]);
        });
    }
  }

  async function handleSendOwnDelivery(): Promise<void> {
    if (isAuthenticated) {
      const api = setupApiClient();

      await api
        .put(`/order/status/${order?._id}`, {
          status: 'DISPATCH',
          shopper: user?.id,
        })
        .finally(() => {
          Promise.allSettled([refetchOrder(), refetchOrders()]);
        });
    }
  }

  async function handleSendDelivery(): Promise<void> {
    if (isAuthenticated) {
      const api = setupApiClient();

      await api
        .put(`/order/status/${order?._id}`, {
          status: 'WAIT_DELIVERYMAN',
          shopper: user?.id,
        })
        .finally(() => {
          Promise.allSettled([refetchOrder(), refetchOrders()]);
        });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleDispatchDelivery(): Promise<void> {
    if (isAuthenticated) {
      const api = setupApiClient();

      await api
        .put(`/order/status/${order?._id}`, {
          status: 'RELEASE_SHOPPER',
          shopper: user?.id,
        })
        .finally(() => {
          Promise.allSettled([refetchOrder(), refetchOrders()]);
        });
    }
  }

  async function callExternalPrint(): Promise<void> {
    try {
      const file = path.resolve('.', 'orderData.json');
      const p = path.resolve('.', 'libs', 'PRINT-COUPON.EXE');

      // console.log(`Executando: ${p}`);

      selectedOrder = await normalizeObjectAccents(selectedOrder);

      ipcRenderer.sendSync('printFile', {
        file,
        object: JSON.stringify(selectedOrder),
        action: p,
      });
    } catch (err) {
      setMessageErr(`Não foi possível abrir a impressora: Err ${err.message}`);
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
            <Button colorScheme='blue' mr={3} onClick={() => { setModalError(false) }}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box display="none">
        <NFToPrint data={{ cart, order }} ref={componentRef} />
      </Box>
      <VStack spacing={2}>
        <Chat
          userId={user?.id}
          cartId={selectedOrder?.order?.shoppingCart?._id}
          customerName={selectedOrder?.order.customer.person[0].name}
          customerId={selectedOrder?.order.customer._id}
          shoppingCartId={selectedOrder?.order.shoppingCart._id}
          orderNumber={selectedOrder?.order.order_number}
          companyName={selectedOrder?.order?.company?.name}
          enabled={enabled}
        />
        <Button
          colorScheme="yellow"
          leftIcon={<Icon as={RiPrinterLine} height={6} width={6} />}
          onClick={() => {
            callExternalPrint()
          }}
          width="100%"
        >
          Imprimir Cupom Fiscal
        </Button>
        {enabled && (
          <>
            {order?.status === 'DISPATCH' ? (
              <Button
                colorScheme="green"
                leftIcon={<Icon as={RiCheckLine} height={6} width={6} />}
                onClick={handleEndOrder}
                width="100%"
              >
                Finalizar
              </Button>
            ) : (
              <Button
                colorScheme="green"
                disabled={!(order?.status === 'WAIT_COMPANY')}
                leftIcon={<Icon as={RiCheckLine} height={6} width={6} />}
                onClick={handleAcceptOrder}
                width="100%"
              >
                Aceitar
              </Button>
            )}
            <Button
              colorScheme="blue"
              disabled={
                order?.status === 'WAIT_COMPANY' ||
                order?.status === 'FINISHED' ||
                order?.status === 'CANCELED' ||
                order?.status === 'WAIT_DELIVERYMAN' ||
                order?.status === 'ACCEPT_DELIVERYMAN' ||
                order?.status === 'DISPATCH' ||
                order?.status === 'DELIVERY_ROUTE' ||
                !user?.hasOwnDelivery
              }
              leftIcon={
                <Icon as={HiOutlineChevronDoubleRight} height={6} width={6} />
              }
              onClick={handleSendOwnDelivery}
              width="100%"
            >
              Enviar Entregador Próprio
            </Button>
            <Button
              colorScheme="blue"
              disabled={
                order?.status === 'WAIT_COMPANY' ||
                order?.status === 'FINISHED' ||
                order?.status === 'CANCELED' ||
                order?.status === 'WAIT_DELIVERYMAN' ||
                order?.status === 'ACCEPT_DELIVERYMAN' ||
                order?.status === 'DISPATCH' ||
                order?.status === 'DELIVERY_ROUTE'
              }
              leftIcon={
                <Icon as={HiOutlineChevronDoubleRight} height={6} width={6} />
              }
              onClick={handleSendDelivery}
              width="100%"
            >
              Buscar Entregador do Toop
            </Button>
            <Button
              colorScheme="orange"
              disabled={order?.status !== 'ACCEPT_DELIVERYMAN'}
              leftIcon={<Icon as={RiEBike2Line} height={6} width={6} />}
              onClick={handleDispatchDelivery}
              width="100%"
            >
              Liberar Entregador
            </Button>
            <Button
              colorScheme="red"
              disabled={
                order?.status === 'FINISHED' ||
                order?.status === 'CANCELED' ||
                order?.status === 'ACCEPT_DELIVERYMAN' ||
                order?.status === 'DISPATCH' ||
                order?.status === 'DELIVERY_ROUTE'
              }
              leftIcon={<Icon as={RiCloseLine} height={6} width={6} />}
              onClick={handleCancelOrder}
              width="100%"
            >
              Cancelar
            </Button>
          </>
        )}
      </VStack>
    </>
  );
}
