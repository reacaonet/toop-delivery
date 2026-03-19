export interface OrderCart {
	totalItens: number;
	subTotal: number;
	subTotalNormal: number;
	deliveryFee: number;
	minPriceDeliveryFee: number;
	cart: [
		{
			_id: string;
			amount: number;
			check: [];
			radio: [];
			price: number;
			comment: string;
			product: {
				_id: string;
				images: [string];
				position: number;
				amountPeople: number;
				name: string;
				category: string;
				description: string;
				price: number;
				company: string;
				codPdv: string;
			};
			cartItemId: string;
			cartId: string;
		}
	];
	valueTip: number;
}
