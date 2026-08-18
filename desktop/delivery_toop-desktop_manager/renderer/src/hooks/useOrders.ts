import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import { SanitizedOrderForCard } from '../@types/dashboard';
import { setupApiClient } from '../services/api';

interface OrdersResponse {
	endedOrders: SanitizedOrderForCard[];
	ongoingOrders: SanitizedOrderForCard[];
}

function sanitizeOrders(orders: any[]): SanitizedOrderForCard[] {
	return orders.map(order => ({
		id: order._id,
		orderNumber: order.orderNumber,
		customerName: order.customer?.name || order.customer?.person?.[0]?.name || 'Cliente',
		status: order.status,
		total: order.total,
		createdAt: order.createdAt,
	}));
}

async function getOrders(): Promise<OrdersResponse> {
	const api = setupApiClient();
	const { data: response } = await api.get('/orders', { params: { limit: 200 } });

	const orders = response?.data?.data || [];

	const ongoingOrders = sanitizeOrders(
		orders.filter((o: any) => o.status !== 'cancelled' && o.status !== 'delivered')
	);
	const endedOrders = sanitizeOrders(
		orders.filter((o: any) => o.status === 'cancelled' || o.status === 'delivered')
	);

	return { ongoingOrders, endedOrders };
}

export function useOrders(
	options?: UseQueryOptions<OrdersResponse, unknown>,
): UseQueryResult<OrdersResponse, unknown> {
	return useQuery('orders', getOrders, {
		staleTime: 1000 * 30,
		refetchInterval: 1000 * 30,
		refetchIntervalInBackground: true,
		...options,
	});
}
