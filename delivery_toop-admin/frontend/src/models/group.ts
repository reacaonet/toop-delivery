import { Franchise } from "./franchise";

export class Group {
	id?: number;
	_id?: string;
	name: string;
	file?: any;
	description: string;
	status: boolean;
	franchise: Franchise;
}
