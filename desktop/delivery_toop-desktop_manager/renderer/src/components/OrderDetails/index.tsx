import { Flex, Heading, Stack, Text } from '@chakra-ui/react';
import React from 'react';

import { Order } from '../../@types/order';
import { humanReadableStatus } from '../../utils/orderStatuses';

interface OrderDetailsProps {
  order: Order;
}

const paymentMethodLabel: Record<string, string> = {
  credit_card: 'CARTÃO',
  debit_card: 'CARTÃO DE DÉBITO',
  money: 'DINHEIRO',
  pix: 'PIX',
  CARD: 'CARTÃO',
  MONEY: 'DINHEIRO',
  PIX: 'PIX',
  PAGARME: 'Pelo App',
  BRASPAG: 'Pelo App',
};

export function OrderDetails({ order }: OrderDetailsProps): JSX.Element {
  return (
    <Stack marginTop="2" spacing="1.5">
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Taxa de entrega:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {new Intl.NumberFormat('pt-BR', {
            currency: 'BRL',
            minimumFractionDigits: 2,
            style: 'currency',
          }).format(order?.deliveryFee || 0)}
        </Text>
      </Flex>
      {order?.discount > 0 && (
        <Flex alignItems="flex-end" flexDirection="row">
          <Heading fontSize="lg" fontWeight="semibold">
            Desconto:
          </Heading>
          <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
            -{new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.discount)}
          </Text>
        </Flex>
      )}
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Preço base:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {new Intl.NumberFormat('pt-BR', {
            currency: 'BRL',
            minimumFractionDigits: 2,
            style: 'currency',
          }).format(order?.subtotal || 0)}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Preço total:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {new Intl.NumberFormat('pt-BR', {
            currency: 'BRL',
            minimumFractionDigits: 2,
            style: 'currency',
          }).format(order?.total || 0)}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Método de Pagamento:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {paymentMethodLabel[order?.paymentMethod] || order?.paymentMethod || 'Não informado'}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Status:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {humanReadableStatus[order?.status] || order?.status}
        </Text>
      </Flex>
      {order?.notes && (
        <Flex alignItems="flex-end" flexDirection="row">
          <Heading fontSize="lg" fontWeight="semibold">
            Observações:
          </Heading>
          <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
            {order?.notes}
          </Text>
        </Flex>
      )}
    </Stack>
  );
}
