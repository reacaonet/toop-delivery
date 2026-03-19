import { Company } from "./../company/company";
import { Franchise } from "./../franchise";

export class CashbackCampaign {
	id?: number;
	_id?: string;
	franchise?: Franchise;
	company?: Company;
	name: string;
	status?: boolean;
	startDate?: string;
	endDate?: string;
	allApp?: boolean;
	companies?: [string];
	franchises?: [string];
	percent: number;
	amount: number;
	balance: number;
}
