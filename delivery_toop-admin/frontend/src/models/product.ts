import { Company } from './company';

export class Product {
	id?: number;
	_id?: string;
	name: string;
	keywords?: string[];
	description?: string;
	unity?: string;
	barcode?: any;
	price?: number;
	barcodeBox?: string;
	maximumAmount?: number;
	pricePromotion?: number;
	dateInitPricePromotion?: string;
	dateFinishPricePromotion?: string;
	company?: Company;
	images?: string[];
	department?: any[];
	idImageBank?: string;
}
