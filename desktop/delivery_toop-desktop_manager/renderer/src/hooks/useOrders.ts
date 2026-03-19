import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";

import { SanitizedOrderForCard } from "../@types/dashboard";
import { setupApiClient } from "../services/api";

async function getOrders(): Promise<{
	endedOrders: SanitizedOrderForCard[];
	ongoingOrders: SanitizedOrderForCard[];
}> {
	const api = setupApiClient();

	const { data } = await api.get("/v1/front/order?companyType=restaurant");

	const newOrders = data?.list?.map((item) => ({
		cartId: item?.shoppingCart?._id,
		createdAt: item.createdAt,
		customerName: item.customer.person[0]?.name,
		orderNumber: item.order_number,
		status: item.status,
		id: item._id
	})) as SanitizedOrderForCard[];

	const endedOrders = newOrders.filter(
		(order) => order.status === "CANCELED" || order.status === "FINISHED"
	);

	const ongoingOrders = newOrders.filter(
		(order) => order.status !== "CANCELED" && order.status !== "FINISHED"
	);

	return { endedOrders, ongoingOrders };
}

export function useOrders(
	options?: UseQueryOptions<
		{
			endedOrders: SanitizedOrderForCard[];
			ongoingOrders: SanitizedOrderForCard[];
		},
		unknown
	>
): UseQueryResult<
	{
		endedOrders: SanitizedOrderForCard[];
		ongoingOrders: SanitizedOrderForCard[];
	},
	unknown
> {
	return useQuery(["orderList"], () => getOrders(), {
		staleTime: 1000 * 60 * 5,
		refetchInterval: 1000 * 60 * 5,
		refetchIntervalInBackground: true,
		...options
	});
}
