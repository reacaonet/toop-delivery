import { Cart } from "./cart";
import { Order } from "./order";

export interface NewOrder {
	order: Order;
	cart: Cart[];
}

export interface SanitizedOrderForCard {
	cartId: string;
	createdAt: string;
	customerName: string;
	orderNumber: number;
	status: string;
	id: string;
}
