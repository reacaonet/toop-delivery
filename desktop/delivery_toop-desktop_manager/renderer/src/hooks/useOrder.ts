import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import { Order } from '../@types/order';
import { setupApiClient } from '../services/api';

async function getOrder(orderId: string): Promise<Order> {
  const api = setupApiClient();

  if (orderId) {
    const { data: response } = await api.get(`/orders/${orderId}`);
    return response?.data || response;
  }

  return null;
}

export function useOrder(
  orderId: string,
  options?: UseQueryOptions<Order, unknown>,
): UseQueryResult<Order, unknown> {
  return useQuery(['order', orderId], () => getOrder(orderId), {
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    ...options,
  });
}
