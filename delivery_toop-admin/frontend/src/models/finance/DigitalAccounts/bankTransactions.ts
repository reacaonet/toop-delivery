import { Account } from "./account";
import { Agency } from "./agency";

export class BankTransactions {
	_id?: string;
	originAccount?: Account;
	originAgency?: Agency;
	destinationAccount: Account;
	destinationAgency: Agency;
	type: string;
	status:
		| "AUTHORIZEDBYUSER"
		| "BANKAUTHORIZED"
		| "COMPLETED"
		| "AWAITING"
		| "SCHEDULED"
		| "CANCELED";
	value: number;
	transactionDate: string;
	transactionCode: string;
	description: string;
	payment?: any;
}
