import { AbstractControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";

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

export const methodPayment = (type: string, directPay = null) => {
	if (directPay) {
		switch (directPay) {
			case "MONEY_DRIVER":
				return "Dinheiro";
			case "PIX_DRIVER":
				return "PIX direto para motorista";
			case "CARD_DRIVER":
				return "Cartão direto ao motorista";
		}
	}

	switch (type) {
		case "MONEY":
			return "Dinheiro";
		case "CARD":
			return "Maquininha";
		case "BRASPAG":
			return "Cartão Crédito";
		case "PAGARME":
			return "Cartão Crédito";
		case "STRIPE":
			return "Cartão Crédito";
		case "PIX":
			return "PIX";
		case "WALLET":
			return "Carteira Digital";
		case "WALLET_PIX":
			return "Carteira Digital + PIX";
		case "WALLET_STRIPE":
			return "Carteira Digital + APP";
		case "WALLET_PAGARME":
			return "Carteira Digital + APP";
		case "WALLET_CARD":
			return "Carteira Digital + Maquininha";
		case "WALLET_MONEY":
			return "Carteira Digital + Dinheiro";
		default:
			return "";
	}
};

export const getGenre = (genre, translate: TranslateService) => {
	switch (genre) {
		case "H":
			return translate.instant("GLOBAL.LABEL.MALE");
		case "M":
			return translate.instant("GLOBAL.LABEL.FEMININE");
		case "O":
			return translate.instant("GLOBAL.LABEL.OTHER");
		default:
			return "";
	}
};

export const orderStatus = (status) => {
	switch (status) {
		case "concluded":
			return "Concluída";
		case "canceled":
			return "Cancelada";
		case "driver_not_found":
			return "Motorista Não Encontrado";
		case "in_progress":
			return "Em Andamento";
		case "accepted":
			return "Aceito";
		case "waiting":
			return "Aguardando";
		case "scheduled":
			return "Agendado";
		default:
			return status;
	}
};

export const validateNumberInteger = (
	control: AbstractControl,
	min = 0
): { [key: string]: any } | null => {
	const numero = Number(control.value);

	if (Number.isInteger(numero) && numero > min) {
		return null;
	} else {
		return { numberInvalid: true }; // número inválido
	}
};

export const utcLocal = () => {
	try {
		let date = new Date();
		let offset = date.getTimezoneOffset();
		let zone = offset / 60;
		zone = -1 * zone;
		zone = parseInt(`${zone}`, 10);
		return `${zone}`;
	} catch (err) {
		return "-3";
	}
};

export const getTimeZone = () => {
	return `${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
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
