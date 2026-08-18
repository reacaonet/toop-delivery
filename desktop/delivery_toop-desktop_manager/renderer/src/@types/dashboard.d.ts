import { Order } from "./order";

export interface SanitizedOrderForCard {
	orderNumber: string;
	customerName: string;
	status: string;
	total: number;
	id: string;
	createdAt: string;
}
