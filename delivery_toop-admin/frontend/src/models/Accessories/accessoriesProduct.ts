import { AccessoriesCategory } from './acessoriesCategory';
import { AccessoriesProductComplement } from './accessoriesProductComplement';

export class AccessoriesProduct {
    id?: number;
    _id?: string;
    file: string[];
    name: string;
    accessoriesCategory: AccessoriesCategory;
    accessoriesCategoryId: AccessoriesCategory;
    description: string;
    shortDescription: string;
    price: number;
    pricePromotion: number;
    percentualDiscount: number;
    codPdv: number;
    isPaused: boolean;
    complements?: AccessoriesProductComplement[];
    // Por causa do db
    category?: string;
    position: number;
    amountPeople: string;
    company: any;
}
