import { BaseModel } from "../../_base/crud";
import { Address } from "./address.model";
import { SocialNetworks } from "./social-networks.model";
import { Company } from "./company.model";

export class User extends BaseModel {
	_id?: number;
	id: number;
	username: string;
	name?: string;
	password: string;
	email: string;
	company: Company;
	companies: Company[];
	franchises: any = [];
	franchise: string;
	accessToken: string;
	refreshToken: string;
	roles: number[];
	pic: string;
	fullname: string;
	occupation: string;
	companyName: string;
	phone: string;
	address: Address;
	socialNetworks: SocialNetworks;
	shopper: String;
	isRoot: Boolean;

	clear(): void {
		this.id = undefined;
		this.username = "";
		this.name = "";
		this.password = "";
		this.email = "";
		this.roles = [];
		this.company = undefined;
		this.franchises = [];
		this.fullname = "";
		this.accessToken = "access-token-" + Math.random();
		this.refreshToken = "access-token-" + Math.random();
		this.pic = "./assets/media/users/default.jpg";
		this.occupation = "";
		this.companyName = "";
		this.phone = "";
		this.address = new Address();
		this.address.clear();
		this.socialNetworks = new SocialNetworks();
		this.socialNetworks.clear();
		this.shopper = null;
		this.isRoot = false;
	}
}
