export const getProducts = async (cart: any) => {
	try {
		const list = [];

		for await (const item of cart) {
			const prod = {
				_id: null,
				product: "-",
				image: undefined,
				amount: 0,
				barcode: undefined,
				price: undefined,
				subtotal: undefined,
				comment: undefined,
				pricePromotion: 1,
				havePricePromotion: false,
				complements: undefined,
				subtotalPricePromotion: undefined,
			};

			if (item.type === "restaurant") {
				let productResponse = await getProductRestaurant(item, prod);
				list.push(productResponse);
			} else if (item.type === "accessories") {
				let productResponse = await getAccessories(item, prod);
				list.push(productResponse);
			} else if (item.type === "supermarket") {
				let productResponse = await getProductSupermarket(item, prod);
				list.push(productResponse);
			} else {
				list.push(prod);
			}
		}

		return list;
	} catch (err) {
		return [];
	}
};

const getProductRestaurant = async (item, prod) => {
	try {
		if (item._id) {
			prod._id = item._id;
		}

		if (item.foodProduct && item.foodProduct._id) {
			prod.productId = item.foodProduct._id;
		}

		if (item.foodProduct && item.foodProduct.name) {
			prod.product = item.foodProduct.name;
		}

		prod.image =
			item.foodProduct &&
			item.foodProduct.images &&
			Array.isArray(item.foodProduct.images) &&
			item.foodProduct.images[0]
				? item.foodProduct.images[0]
				: undefined;

		if (item.amount && item.amount >= 0) {
			prod.amount = item.amount;
		} else {
			prod.amount = 1;
		}

		prod.price =
			item.price && typeof item.price === "number"
				? item.price.toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		prod.pricePromotion =
			item.pricePromotion && typeof item.pricePromotion === "number"
				? item.pricePromotion.toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		prod.havePricePromotion =
			item.pricePromotion && typeof item.pricePromotion === "number"
				? true
				: false;

		if (prod.havePricePromotion) {
			prod.subtotalPricePromotion =
				item.price > 0 && item.amount > 0
					? (item.pricePromotion * item.amount).toLocaleString("pt-br", {
							style: "currency",
							currency: "BRL",
					  })
					: (0).toLocaleString("pt-br", {
							style: "currency",
							currency: "BRL",
					  });
		}

		prod.subtotal =
			item.price > 0 && item.amount > 0
				? (item.price * item.amount).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		if (item.comment) {
			prod.comment = item.comment;
		}

		if (item.complements && Array.isArray(item.complements)) {
			prod.complements = [];
			for await (const comp of item.complements) {
				let compAmount = 1;

				if (comp.amount >= 0) {
					compAmount = comp.amount;
				}

				let payloadCompl = {
					title: undefined,
					name: undefined,
					description: undefined,
					amount: compAmount,
					amountFormat: comp.amount,
					code: "teste cod",
					price: undefined,
					subTotal: undefined,
				};

				payloadCompl.title =
					comp.foodProductComplement && comp.foodProductComplement.name
						? comp.foodProductComplement.name
						: undefined;

				payloadCompl.name = comp.name ? comp.name : undefined;

				payloadCompl.description = comp.description
					? comp.description
					: undefined;

				payloadCompl.price =
					comp.price && typeof comp.price === "number"
						? comp.price.toLocaleString("pt-br", {
								style: "currency",
								currency: "BRL",
						  })
						: (0).toLocaleString("pt-br", {
								style: "currency",
								currency: "BRL",
						  });

				payloadCompl.subTotal = comp.price * compAmount;
				if (comp.price > 0) {
					payloadCompl.subTotal = payloadCompl.subTotal.toLocaleString(
						"pt-br",
						{
							style: "currency",
							currency: "BRL",
						}
					);
				} else {
					payloadCompl.subTotal = "R$ 0,00";
				}

				prod.complements.push(payloadCompl);
			}
		}

		return prod;
	} catch (err) {
		return {};
	}
};

const getAccessories = async (item, prod) => {
	try {
		if (item._id) {
			prod._id = item._id;
		}

		if (item.accessoriesProduct && item.accessoriesProduct._id) {
			prod.productId = item.accessoriesProduct._id;
		}

		if (item.accessoriesProduct && item.accessoriesProduct.name) {
			prod.product = item.accessoriesProduct.name;
		}

		prod.image =
			item.accessoriesProduct &&
			item.accessoriesProduct.images &&
			Array.isArray(item.accessoriesProduct.images) &&
			item.accessoriesProduct.images[0]
				? item.accessoriesProduct.images[0]
				: undefined;

		if (item.amount && item.amount >= 0) {
			prod.amount = item.amount;
		} else {
			prod.amount = 1;
		}

		prod.price =
			item.price && typeof item.price === "number"
				? item.price.toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		prod.pricePromotion =
			item.pricePromotion && typeof item.pricePromotion === "number"
				? item.pricePromotion.toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		prod.havePricePromotion =
			item.pricePromotion && typeof item.pricePromotion === "number"
				? true
				: false;

		if (prod.havePricePromotion) {
			prod.subtotalPricePromotion =
				item.price > 0 && item.amount > 0
					? (item.pricePromotion * item.amount).toLocaleString("pt-br", {
							style: "currency",
							currency: "BRL",
					  })
					: (0).toLocaleString("pt-br", {
							style: "currency",
							currency: "BRL",
					  });
		}

		prod.subtotal =
			item.price > 0 && item.amount > 0
				? (item.price * item.amount).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		if (item.comment) {
			prod.comment = item.comment;
		}

		if (item.complements && Array.isArray(item.complements)) {
			prod.complements = [];
			for await (const comp of item.complements) {
				let compAmount = prod.amount;
				let payloadCompl = {
					title: undefined,
					name: undefined,
					description: undefined,
					amount: compAmount,
					code: "teste cod",
					price: undefined,
					subTotal: undefined,
				};

				payloadCompl.title =
					comp.accessoriesProductComplement &&
					comp.accessoriesProductComplement.name
						? comp.accessoriesProductComplement.name
						: undefined;

				payloadCompl.name = comp.name ? comp.name : undefined;

				payloadCompl.description = comp.description
					? comp.description
					: undefined;

				payloadCompl.price =
					comp.price && typeof comp.price === "number"
						? comp.price.toLocaleString("pt-br", {
								style: "currency",
								currency: "BRL",
						  })
						: (0).toLocaleString("pt-br", {
								style: "currency",
								currency: "BRL",
						  });

				payloadCompl.subTotal = comp.price * compAmount;
				if (comp.price > 0) {
					payloadCompl.subTotal = payloadCompl.subTotal.toLocaleString(
						"pt-br",
						{
							style: "currency",
							currency: "BRL",
						}
					);
				} else {
					payloadCompl.subTotal = "R$ 0,00";
				}

				prod.complements.push(payloadCompl);
			}
		}

		return prod;
	} catch (err) {
		console.log("oops error", err);
		return {};
	}
};

const getProductSupermarket = async (item, prod) => {
	try {
		if (item._id) {
			prod._id = item._id;
		}

		if (item.product && item.product._id) {
			prod.productId = item.product._id;
		} else {
			prod.productId = null;
		}

		if (item.barcode) {
			prod.barcode = item.barcode;
		}

		if (item.name) {
			prod.product = item.name;
		} else if (item.product && item.product.name) {
			prod.product = item.product.name;
		}

		if (item.images && Array.isArray(item.images) && item.images[0]) {
			prod.image = item.images[0];
		} else if (
			item.product &&
			item.product.images &&
			Array.isArray(item.product.images) &&
			item.product.images[0]
		) {
			prod.image = item.product.images[0];
		} else {
			prod.image = undefined;
		}

		prod.amount =
			item.amount && typeof item.amount === "number" ? item.amount : 1;

		prod.price =
			item.price && typeof item.price === "number"
				? item.price.toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		prod.pricePromotion =
			item.pricePromotion && typeof item.pricePromotion === "number"
				? item.pricePromotion.toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		prod.havePricePromotion =
			item.pricePromotion && typeof item.pricePromotion === "number"
				? true
				: false;

		if (prod.havePricePromotion) {
			prod.subtotalPricePromotion =
				item.price > 0 && item.amount > 0
					? (item.pricePromotion * item.amount).toLocaleString("pt-br", {
							style: "currency",
							currency: "BRL",
					  })
					: (0).toLocaleString("pt-br", {
							style: "currency",
							currency: "BRL",
					  });
		}

		prod.subtotal =
			item.price > 0 && item.amount > 0
				? (item.price * item.amount).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  })
				: (0).toLocaleString("pt-br", {
						style: "currency",
						currency: "BRL",
				  });

		return prod;
	} catch (err) {
		return {};
	}
};
