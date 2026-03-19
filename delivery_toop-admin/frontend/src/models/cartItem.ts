import { Cart } from './cart';
import { Product } from './product';
export class CartItem {
    id?: number;
    _id?: string;
    //shoppingCart: ShoppingCart;
    product: Product;
    amount: number;
    price: number;
    pricePromotional: number;
}
