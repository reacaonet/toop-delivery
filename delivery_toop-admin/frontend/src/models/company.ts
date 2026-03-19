import { Group } from "./group";
export class Company {
	id?: number;
	_id?: string;
	typePayments: any;
	name: string;
	description: string;
	status: boolean;
	lat: number;
	lng: number;
	address: string;
	phone: number;
	type: string;
	category: any;
	groups: Group;
	images: string[];
	keywords: string[];
	location: any;
	cnpj: number;
	complement?: string;
}
