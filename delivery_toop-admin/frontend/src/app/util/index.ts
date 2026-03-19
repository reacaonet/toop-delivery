import { AbstractControl } from "@angular/forms";

export const queryString = (params: any) => {
	try {
		let getQuery = "";
		if (params && params !== undefined) {
			getQuery = Object.keys(params)
				.map(function (key) {
					return key + "=" + params[key];
				})
				.join("&");
		}

		return getQuery;
	} catch (err) {
		return "";
	}
};

const formatterAmount = (amount) => {
	try {
		const number = amount.toFixed(2);
		if (number >= 0) {
			return number.replace(/\d(?=(\d{3})+\.)/g, "$&,");
		}
		return "";
	} catch (err) {
		//console.log('Error format Amount', err);
		return amount;
	}
};

export const getCanceledBy = (canceledBy: String) => {
	switch (canceledBy) {
		case "passenger":
			return "Passageiro";
		case "driver":
			return "Motorista";
		case "system":
			return "Sistema";
		default:
			return "";
	}
};

export const formatMoney = (amount, isSymbol = true) => {
	try {
		let money = formatterAmount(amount);
		money = money.replace(".", ",");
		return isSymbol ? `R$ ${money}` : money;
	} catch (err) {
		return "";
	}
};

export const checkObjectIdisValid = (formControl: AbstractControl) => {
	if (!formControl.parent) {
		return null;
	}

	if (formControl.value) {
		if (typeof formControl.value !== "object" || !formControl.value?._id) {
			return { isObjectId: { value: formControl.value } };
		} else {
			return null;
		}
	}
	return null;
};

export const methodPayment = (type) => {
	switch (type) {
		case "MONEY":
			return "Dinheiro";
		case "CARD":
			return "Maquininha";
		case "BRASPAG":
			return "APP";
		case "PAGARME":
			return "APP";
		case "PIX":
			return "PIX";
		default:
			return "";
	}
};

export const orderStatus = (status) => {
	switch (status) {
		case "concluded":
			return "Finalizado";
		case "canceled":
			return "Cancelado";
		case "driver_not_found":
			return "Motorista Não Encontrado";
		case "in_progress":
			return "Em Andamento";
		case "accepted":
			return "Aceito";
		case "waiting":
			return "Aguardando";
		default:
			return status;
	}
};
