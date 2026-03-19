const nextOrderStatus = (status: string) => {
	try {
		let list: any = [];

		list.push({
			status: "WAIT_COMPANY",
		});

		// list.push({
		//   status: 'ACCEPT_SHOPPER',
		// });

		list.push({
			status: "IN_PREPARATION",
		});

		// list.push({
		//   status: 'FINISH_PREPARATION',
		// });

		list.push({
			status: "WAIT_DELIVERYMAN",
		});

		list.push({
			status: "ACCEPT_DELIVERYMAN",
		});

		list.push({
			status: "RELEASE_SHOPPER",
		});

		list.push({
			status: "DELIVERY_ROUTE",
		});

		let index = list.findIndex((item: any) => item.status === status);

		if (index > -1) {
			return list[index + 1].status;
		}
		return "";
	} catch (err) {
		return "";
	}
};

export { nextOrderStatus };
