import { CompanyCoupon } from "./companyCoupon";
import { Franchise } from "../franchise";

export class Coupon {
	id?: number;
	_id?: string;
	name: string;
	description: string;
	rules: string;
	price: number;
	discountPercentage: number;
	dateInit: string;
	dateFinish: string;
	status: boolean;
	allCompanies: boolean;
	minPriceDelivery: number;
	companyCoupon: CompanyCoupon;
	companies: any;
	onlyFirstPurchase: boolean;
	limit: number;
	franchise: any;
}
