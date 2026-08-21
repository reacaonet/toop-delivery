import { CartModel } from "../models/Cart";
import { ProductModel } from "../models/Product";
import { CompanyModel } from "../models/Company";
import { AppError } from "../middleware/errorHandler";

export class CartService {
  async getOrCreate(customerId: string, companyId: string) {
    let cart = await CartModel.findOne({ customer: customerId, company: companyId, status: 'active' });
    if (!cart) {
      const company = await CompanyModel.findById(companyId).select('deliveryFee');
      cart = await CartModel.create({ customer: customerId, company: companyId, items: [], subtotal: 0, deliveryFee: company?.deliveryFee || 0, total: 0 });
    } else {
      const company = await CompanyModel.findById(companyId).select('deliveryFee');
      if (company?.deliveryFee != null && cart.deliveryFee !== company.deliveryFee) {
        cart.deliveryFee = company.deliveryFee;
        this.recalculateTotals(cart);
        await cart.save();
      }
    }
    return cart;
  }

  async addItem(customerId: string, companyId: string, productId: string, quantity: number, notes?: string) {
    const product = await ProductModel.findById(productId);
    if (!product || !product.active) throw new AppError("Produto não encontrado", 404);

    const cart = await this.getOrCreate(customerId, companyId);

    if (cart.company.toString() !== companyId) {
      throw new AppError("Carrinho pertence a outra empresa", 400);
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.notes === (notes || undefined)
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].total = cart.items[existingIndex].quantity * cart.items[existingIndex].price;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        price: product.promoPrice || product.price,
        quantity,
        total: (product.promoPrice || product.price) * quantity,
        notes,
      });
    }

    this.recalculateTotals(cart);
    await cart.save();
    return cart;
  }

  async updateItemQuantity(customerId: string, cartId: string, itemId: string, quantity: number) {
    const cart = await CartModel.findOne({ _id: cartId, customer: customerId, status: 'active' });
    if (!cart) throw new AppError("Carrinho não encontrado", 404);

    const itemIndex = cart.items.findIndex((item: any) => item._id?.toString() === itemId);
    if (itemIndex < 0) throw new AppError("Item não encontrado no carrinho", 404);

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;
    }

    this.recalculateTotals(cart);
    await cart.save();
    return cart;
  }

  async removeItem(customerId: string, cartId: string, itemId: string) {
    const cart = await CartModel.findOne({ _id: cartId, customer: customerId, status: 'active' });
    if (!cart) throw new AppError("Carrinho não encontrado", 404);

    const itemIndex = cart.items.findIndex((item: any) => item._id?.toString() === itemId);
    if (itemIndex < 0) throw new AppError("Item não encontrado no carrinho", 404);

    cart.items.splice(itemIndex, 1);
    this.recalculateTotals(cart);
    await cart.save();
    return cart;
  }

  async getCart(customerId: string, companyId: string) {
    return CartModel.findOne({ customer: customerId, company: companyId, status: 'active' });
  }

  async getCartById(cartId: string, customerId: string) {
    const cart = await CartModel.findOne({ _id: cartId, customer: customerId });
    if (!cart) throw new AppError("Carrinho não encontrado", 404);
    return cart;
  }

  async listAll(customerId: string) {
    return CartModel.find({ customer: customerId }).populate('company').sort({ updatedAt: -1 });
  }

  async markAsOrdered(cartId: string) {
    const cart = await CartModel.findByIdAndUpdate(cartId, { status: 'ordered' }, { new: true });
    if (!cart) throw new AppError("Carrinho não encontrado", 404);
    return cart;
  }

  private recalculateTotals(cart: any) {
    cart.subtotal = cart.items.reduce((sum: number, item: any) => sum + item.total, 0);
    cart.total = cart.subtotal + cart.deliveryFee - cart.discount;
  }
}

export default new CartService();
