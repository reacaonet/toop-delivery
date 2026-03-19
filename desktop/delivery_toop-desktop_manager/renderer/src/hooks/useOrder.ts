import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import { NewOrder } from '../@types/dashboard';
import { setupApiClient } from '../services/api';

async function getOrder(orderId: string): Promise<NewOrder> {
  const api = setupApiClient();

  if (orderId) {
    const { data } = await api.get(`/v1/front/order/${orderId}`);
    return data;
  }

  return null;
}

export function useOrder(
  orderId: string,
  options?: UseQueryOptions<NewOrder, unknown>,
): UseQueryResult<NewOrder, unknown> {
  return useQuery(['order', orderId], () => getOrder(orderId), {
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    ...options,
  });
}
