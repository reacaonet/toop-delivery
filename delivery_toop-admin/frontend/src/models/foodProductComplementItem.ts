import { FoodProductComplement } from './foodProductComplement';

export class FoodProductComplementItem {
    id?: number;
    _id?: string;
    name: string;
    codPdv: string;
    description: string;
    price: number;
    isPaused: boolean;
    foodProductComplement: FoodProductComplement;
    company: any;
}
