export interface Cart {
	_id: string;
	amount: number;
	comment: string;
	complements: {
		foodProductComplement: {
			name: string;
		};
		name: string;
		price: number;
		_id: string;
	}[];
	foodProduct: {
		name: string;
		description: string;
		images: string[];
	};
	price: number;
	pricePromotion: number;
}
