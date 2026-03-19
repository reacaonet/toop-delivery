import { Company } from "./../company";
import { Person } from "./../person";

export class Passenger {
	id?: number;
	_id?: string;
	person?: Person;
	franchise: any;
	status: boolean;
	block?: boolean;
	appversion?: string;
	operationalSystem?: string;
	company?: any;
	approved?: any;
}
