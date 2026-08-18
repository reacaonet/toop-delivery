export interface Order {
	_id: string;
	orderNumber: string;
	createdAt: string;
	total: number;
	subtotal: number;
	deliveryFee: number;
	discount: number;
	status: string;
	paymentMethod: string;
	paymentStatus: string;
	notes?: string;
	items: {
		name: string;
		quantity: number;
		price: number;
		total: number;
	}[];
	company: {
		_id: string;
		name: string;
	};
	customer: {
		_id: string;
		name: string;
		email?: string;
		person?: {
			name: string;
			phone: string;
		}[];
	};
	deliveryman?: {
		_id: string;
		name: string;
	};
	deliveryAddress?: {
		street?: string;
		number?: string;
		complement?: string;
		neighborhood?: string;
		city?: string;
		state?: string;
		zipCode?: string;
	};
}
