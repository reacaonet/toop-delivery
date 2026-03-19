import { City } from "./city";
import { Company } from "./company/company";
import { Franchise } from "./franchise";

export class Person {
	id?: number;
	_id?: string;
	shopper: string;
	deliveryMan: string;
	name: string;
	email?: string;
	cpf: string;
	city: City;
	city_id: any;
	ddi: string;
	phone: number | string;
	cellphone: number;
	birthdate: string;
	status: boolean;
	company?: Company;
	franchise?: string;
	image?: string;
	createDigitalAccount?: boolean;
	block?: boolean;
}
