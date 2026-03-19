import { Group } from "./../group";
import { Franchise } from "./../franchise";
import { SegmentModel } from "./../company/segment";

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
	type?: string;
	shoppingFlow: string;
	category: any;
	groups: Group;
	images: string[];
	keywords: string[];
	location: any;
	cnpj: number;
	franchise: Franchise;
	segment?: SegmentModel;
	isHighlighted?: boolean;
	createDigitalAccount?: boolean;
	approved?: boolean;
	companyCategory?: string;
	bankData?: any;
	socialNetwork?: any;
	complement?: string;
	recipient_id?: string;
	pagar_me_bank_id?: string;
}
