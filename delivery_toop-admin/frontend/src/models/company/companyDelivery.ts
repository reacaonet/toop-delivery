import { Company } from "./../company/company";

export class CompanyDelivery {
	id?: number;
	_id?: string;
	company: Company;
	isOpen: boolean;
	isManual: boolean;
	cieloMerchantId: number;
	mdr: number;
	fee: number;
	distance: any;
	max_distance: string;
	time_to_call_delivery: number;
	max_amount_items: number;
	min_purchase: number;
	own_delivery: string;
	online_delivery: string;
	withdrawMarket: string;
	has_split: string;
	// shippingInfo?: {
	freeShipping?: boolean;
	freeShippingAbove?: number;
	activatedBy?: string;
	// };
}
