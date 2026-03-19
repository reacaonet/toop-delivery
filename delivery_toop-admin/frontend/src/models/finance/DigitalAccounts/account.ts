import { Agency } from "./agency";
import { Bank } from "./bank";
import { Company } from "./../../company/company";
import { User } from "./../../user";

export class Account {
	id?: number;
	_id?: string;
	bank: Bank;
	agency: Agency;
	code: number;
	type: "PF" | "PJ";
	holder: Company | User;
	status: boolean;
}
