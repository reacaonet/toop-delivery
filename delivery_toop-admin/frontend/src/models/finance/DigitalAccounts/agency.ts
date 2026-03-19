import { Franchise } from "./../../franchise";
import { Bank } from "./bank";

export class Agency {
	id?: number;
	_id?: string;
	bank: Bank;
	franchise: Franchise;
	code: number;
	name: string;
	status?: boolean;
	description?: string;
}
