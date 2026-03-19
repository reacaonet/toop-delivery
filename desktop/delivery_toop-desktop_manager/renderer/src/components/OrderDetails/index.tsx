/* eslint-disable prettier/prettier */
import { Flex, Heading, Stack, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { Order } from '../../@types/order';
import { OrderCart } from '../../@types/orderCart';
import { getCart } from '../../services/order/cart/getCart';
import { humanReadableStatus } from '../../utils/orderStatuses';

interface OrderDetails {
  order: Order;
}

export function OrderDetails({ order }: OrderDetails): JSX.Element {
  const [orderCart, setOrderCart] = useState<OrderCart | null>(null);

  useEffect(() => {
    (async () => {
      const cart = await getCart(order?.shoppingCart?._id);
      setOrderCart(cart);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.shoppingCart?._id]);

  return (
    <Stack marginTop="2" spacing="1.5">
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Cupom:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {new Intl.NumberFormat('pt-BR', {
            currency: 'BRL',
            minimumFractionDigits: 2,
            style: 'currency',
          }).format(order?.payment?.couponPrice || 0)}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Taxa de entrega:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {new Intl.NumberFormat('pt-BR', {
            currency: 'BRL',
            minimumFractionDigits: 2,
            style: 'currency',
          }).format(orderCart?.deliveryFee || 0)}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Gorjeta:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {new Intl.NumberFormat('pt-BR', {
            currency: 'BRL',
            minimumFractionDigits: 2,
            style: 'currency',
          }).format(orderCart?.valueTip || 0)}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Preço base:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {new Intl.NumberFormat('pt-BR', {
            currency: 'BRL',
            minimumFractionDigits: 2,
            style: 'currency',
          }).format(orderCart?.subTotal || 0)}
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
          }).format(
            orderCart?.subTotal +
            orderCart?.deliveryFee || 0 +
            orderCart?.valueTip || 0 -
            order?.payment?.couponPrice || 0
          )}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Método de Pagamento:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {order?.typePayment === 'CARD' ? 'CARTÃO' : ''}
          {order?.typePayment === 'MONEY' ? 'Dinheiro' : ''}
          {order?.typePayment === 'BRASPAG' ? 'Pelo App' : ''}
          {order?.typePayment === 'PAGARME' ? 'Pelo App' : ''}
          {order?.typePayment === 'PIX' ? 'PIX' : ''}
        </Text>
      </Flex>
      {order?.typePayment === 'MONEY' && (
        <Flex alignItems="flex-end" flexDirection="row">
          <Heading fontSize="lg" fontWeight="semibold">
            Troco para:
          </Heading>
          <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
            {new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              minimumFractionDigits: 2,
              style: 'currency',
            }).format(order?.payment?.cashChange || 0)}
          </Text>
        </Flex>
      )}
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Retirada:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {order?.typeSchedule}
        </Text>
      </Flex>
      <Flex alignItems="flex-end" flexDirection="row">
        <Heading fontSize="lg" fontWeight="semibold">
          Status:
        </Heading>
        <Text fontSize="sm" lineHeight="shorter" marginLeft="1">
          {humanReadableStatus[order?.status]}
        </Text>
      </Flex>
    </Stack>
  );
}
