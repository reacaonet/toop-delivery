import { FoodCategory } from "./foodCategory";
import { FoodProductComplement } from "./foodProductComplement";

export class FoodProduct {
	id?: number;
	_id?: string;
	file: string[];
	name: string;
	foodCategory: FoodCategory;
	foodCategoryId: FoodCategory;
	description: string;
	price: number;
	pricePromotion: number;
	percentualDiscount: number;
	pricesSizesPizzas?: any;
	codPdv: number;
	isPaused: boolean;
	complements?: FoodProductComplement[];
	// Por causa do db
	category?: string;
	position: number;
	amountPeople: string;
	company: any;
}
