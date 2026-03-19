export type orderStatus = {
	status: string;
	order_number: string;
	payment: string;
	company: string;
	shoppingCart: string;
	shopper: string;
};


export type orderStatusUpdate = {
	status?: string;
	companyDelivery?: string;
	shopper?: string;
	shoppingCart?: string;
	acceptedDateShopper?: Date;
	deliveryMan?: string;
	acceptedDateDeliveryMan?: Date;
	finishDateDeliveryMan?: Date;
};

export type orderMessage = {
	message: string;
	type: string;
};
