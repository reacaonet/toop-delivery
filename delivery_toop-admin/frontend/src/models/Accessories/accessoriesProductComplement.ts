import { AccessoriesProduct } from './accessoriesProduct';
import { AccessoriesProductComplementItem } from './accessoriesProductComplementItem';

export class AccessoriesProductComplement {
    id?: number;
    _id?: string;
    name: string;
    amountMin: number;
    amountMax: number;
    isRequired: boolean;
    isPaused: boolean;
    accessoriesproduct?: AccessoriesProduct;
    items?: AccessoriesProductComplementItem[];
    // To DB
    product?: AccessoriesProduct;
    position: number;
    company: any;
}
