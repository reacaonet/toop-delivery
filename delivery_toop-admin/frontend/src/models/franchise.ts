export class Franchise {
	id?: number;
	_id?: string;
	name: string;
	companyName: string;
	state: string;
	cep: string;
	city: string;
	phone: number;
	email: string;
	images: string[];
	password: string;
	confirmPassword: string;
	status: boolean;
	coin?: any;
	languageDefault?: any;
	bankData?: any;
	createAccount?: boolean;
	onlyMultiplesOf50?: boolean;
	emergencyPhone?: string | number;
	percentService?: number;
	recipient_id?: string;
	pagar_me_bank_id?: string;
	showPhoneDriver?: boolean;
	showPhonePassenger?: boolean;
	routeSettings?: any;
	settingsDriver?: {
		activePercentService?: boolean;
		creditEnableMode?: boolean;
		offerDisplayFormat?: string;
		creditPrice?: number;
		creditAmountPerRice?: number;
		creditAmountPerAdditionalStop?: number;
		passAdditionalStopsToPassenger?: boolean;
		allowAcceptRacesNegativeBalance?: boolean;
		balanceLimit?: number;
	};
}
