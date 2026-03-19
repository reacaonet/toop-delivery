import { FoodProduct } from './foodProduct';
import { FoodProductComplementItem } from './foodProductComplementItem';

export class FoodProductComplement {
    id?: number;
    _id?: string;
    name: string;
    amountMin: number;
    amountMax: number;
    isRequired: boolean;
    isQuantified: boolean;
    isPaused: boolean;
    foodproduct?: FoodProduct;
    items?: FoodProductComplementItem[];
    // To DB
    product?: FoodProduct;
    position: number;
    company: any;
}
