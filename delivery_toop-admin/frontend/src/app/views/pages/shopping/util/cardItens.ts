import moment from "moment";

export const getItemEdit = (item: any, type: string) => {
	try {
		const cardItem = {
			amount: item.amount,
			price: 0,
			product: null,
			type: type,
			action: "edit",
		};

		cardItem.price = formatPriceToDouble(item.price);
		cardItem.product = item.product;

		return cardItem;
	} catch (err) {
		console.log("falhou getItemEdit", err);
	}
};

export const formatPriceToDouble = (price: string) => {
	try {
		let strPrice = `${price}`.replace("R$", "").trim().replace(",", ".");

		return parseFloat(strPrice);
	} catch (err) {
		return 0;
	}
};

export const subTotalCart = (cartDetails) => {
	let subTotal = cartDetails.cart.reduce(
		(accumulator, product) =>
			accumulator + product.price.toFixed(2) * product.amount,
		0
	);

	subTotal = Number(subTotal).toFixed(2);
	return Number(subTotal);
};

export const totalDiscount = (cartDetails) => {
	let totalDiscount = cartDetails.cart.reduce((accumulator, product) => {
		let discount = 0;

		if (product.pricePromotion && product.pricePromotion > 0) {
			discount = product.price - product.pricePromotion;
		}

		if (product.amount && product.amount > 1) {
			discount = discount * product.amount;
		}

		return accumulator + discount;
	}, 0);

	return totalDiscount;
};

export const totalComplements = (cartDetails) => {
	let totalComplements: Number = 0;

	for (var i = 0; i < cartDetails.cart.length; i++) {
		let amount = 1;
		let itemCurrent = cartDetails.cart[i];

		if (itemCurrent && itemCurrent.amount) {
			amount = itemCurrent.amount;
		}

		const result = cartDetails.cart[i].complements.reduce(
			(accumulator, product) => {
				let complements = 0;

				// if (product?._id) {
				if (product.price && product.price > 0) {
					complements = amount * product.price;
				}
				// }
				return accumulator + complements;
			},
			0
		);
		totalComplements = totalComplements + result;
	}

	return totalComplements;
};

export const schedule = (cartDetails) => {
	let startHour = `${cartDetails.order.shoppingCart.schedule.startHour}`;
	let endHour = `${cartDetails.order.shoppingCart.schedule.endHour}`;
	let scheduleDate = moment(
		cartDetails.order.shoppingCart.schedule.deliveryDate
	)
		.utc()
		.subtract(3, "hours")
		.format("DD/MM/YYYY");

	startHour =
		startHour.slice(0, startHour.length > 3 ? 2 : 1) +
		":" +
		startHour.slice(startHour.length > 3 ? 2 : 1, 5);
	endHour =
		endHour.slice(0, endHour.length > 3 ? 2 : 1) +
		":" +
		endHour.slice(endHour.length > 3 ? 2 : 1, 5);

	if (
		moment(cartDetails.order.shoppingCart.schedule.deliveryDate).isSame(
			moment(),
			"day"
		)
	) {
		return `Hoje as ${startHour} até ${endHour}`;
	}

	return `${scheduleDate} das ${startHour} até ${endHour}`;
};

export const couponPrice = (cartDetails) => {
	if (cartDetails.order && cartDetails.order.payment.couponPrice) {
		return cartDetails.order.payment.couponPrice;
	}

	return 0;
};

export const priceDelivery = (cartDetails) => {
	if (cartDetails.order && cartDetails.order.payment.priceDelivery) {
		return cartDetails.order.payment.priceDelivery;
	}

	return 0;
};

export const getFreeShippingBonus = (cartDetails) => {
	if (cartDetails.order && cartDetails.order.payment.freeShippingBonus) {
		return cartDetails.order.payment.freeShippingBonus;
	}

	return 0;
};

export const customer = (cartDetails) => {
	if (
		cartDetails.order &&
		cartDetails.order.customer &&
		cartDetails.order.customer.person &&
		cartDetails.order.customer.person[0] &&
		cartDetails.order.customer.person[0].name
	) {
		return cartDetails.order.customer.person[0].name;
	}

	return "Não identificado";
};

export const totalOrder = (
	subtotal,
	complements,
	serviceCharge,
	valueTip,
	priceDelivery,
	couponPrice,
	discount,
	freeShippingBonus
) => {
	let total = 0;
	total += subtotal;
	total += complements;
	total += serviceCharge;
	total += valueTip;
	total += priceDelivery;
	total -= freeShippingBonus;
	total -= couponPrice;
	total -= discount;

	return total;
};

export const customerId = (cartDetails) => {
	if (
		cartDetails.order &&
		cartDetails.order.customer &&
		cartDetails.order.customer._id
	) {
		return cartDetails.order.customer._id;
	}

	return null;
};

export const phoneCustomer = (cartDetails) => {
	if (
		cartDetails.order &&
		cartDetails.order.customer &&
		cartDetails.order.customer.person &&
		cartDetails.order.customer.person[0] &&
		cartDetails.order.customer.person[0].phone
	) {
		const phoneString = cartDetails.order.customer.person[0].phone.toString();

		return `(${phoneString.substring(2, 4)}) ${phoneString.substring(
			4,
			9
		)}-${phoneString.substring(9, 13)}`;
	}

	return null;
};

export const address = (cartDetails) => {
	if (
		cartDetails.order &&
		cartDetails.order.customerDelivery &&
		cartDetails.order.customerDelivery.address
	) {
		return cartDetails.order.customerDelivery.address;
	}

	return "Não identificado";
};

export const number = (cartDetails) => {
	if (
		cartDetails.order &&
		cartDetails.order.customerDelivery &&
		cartDetails.order.customerDelivery.streetNumber
	) {
		return cartDetails.order.customerDelivery.streetNumber;
	} else if (
		cartDetails.order &&
		cartDetails.order.customerDelivery &&
		cartDetails.order.customerDelivery.number
	) {
		return cartDetails.order.customerDelivery.number;
	}

	return "SN";
};

export const addressComplement = (cartDetails) => {
	try {
		return cartDetails.order.customerDelivery.complement;
	} catch (err) {
		return null;
	}
};
