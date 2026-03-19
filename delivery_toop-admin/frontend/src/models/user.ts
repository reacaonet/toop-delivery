import { Person } from "./person";
import { Company } from "./company/company";
import { Franchise } from "./franchise";

export class User {
	id?: number;
	_id?: string;
	username?: string;
	fullname?: "";
	accessToken?: string;
	refreshToken?: string;
	roles?: [];
	pic?: "./assets/media/users/default.jpg";
	person?: Person;
	name?: string;
	company?: Company;
	companies?: Company[];
	franchises?: Franchise[];
	franchise?: Franchise;
	occupation?: string;
	status?: boolean;
	email?: string;
	type?: string;
	companyName?: string;
	phone?: string;
	address?: any;
	socialNetworks?: any;
	code?: any;
	password?: string;
	confirmPassword?: string;
	shopper?: string;
}
