
import {AccessoriesProductComplement} from './accessoriesProductComplement';


export class AccessoriesProductComplementItem {
    id?: number;
    _id?: string;
    name: string;
    codPdv: string;
    description: string;
    price: number;
    isPaused: boolean;
    accessoriesProductComplement: AccessoriesProductComplement;
    company: any;
}
