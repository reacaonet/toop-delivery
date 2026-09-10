import { CartModel } from "../models/Cart";
import { ProductModel } from "../models/Product";
import { CompanyModel } from "../models/Company";
import { AddonModel } from "../models/Addon";
import { AppError } from "../middleware/errorHandler";

const addonKey = (addons: Array<{ addonId: string }>) =>
  (addons || []).map((a) => a.addonId).sort().join(',');

const addonSum = (addons: Array<{ price: number }>) =>
  (addons || []).reduce((sum, a) => sum + Number(a.price || 0), 0);

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

  async addItem(customerId: string, companyId: string, productId: string, quantity: number, notes?: string, addons?: string[]) {
    const product = await ProductModel.findById(productId).populate<{ addons: any[] }>('addons');
    if (!product || !product.active) throw new AppError("Produto não encontrado", 404);
    if (product.company.toString() !== companyId) {
      throw new AppError("Produto não pertence a esta empresa", 400);
    }

    const requested = [...new Set((addons || []).map((a) => String(a)))];
    const available = new Set((product.addons || []).map((a: any) => a._id.toString()));
    for (const id of requested) {
      if (!available.has(id)) throw new AppError("Acompanhamento inválido para este produto", 400);
    }

    let addonSnapshots: Array<{ addonId: string; name: string; price: number }> = [];
    if (requested.length > 0) {
      const docs = await AddonModel.find({
        _id: { $in: requested },
        company: companyId,
        active: true,
        deletedAt: { $exists: false },
      });
      const byId = new Map(docs.map((d) => [d._id.toString(), d]));
      for (const id of requested) {
        const d = byId.get(id);
        if (!d) throw new AppError("Acompanhamento não encontrado ou inativo", 400);
        addonSnapshots.push({ addonId: id, name: d.name, price: Math.round(Number(d.price || 0) * 100) / 100 });
      }
    }

    const basePrice = Number(product.promoPrice || product.price) || 0;
    const unitTotal = Math.round((basePrice + addonSum(addonSnapshots)) * 100) / 100;
    const key = `${productId}|${notes || ''}|${addonKey(addonSnapshots)}`;

    const cart = await this.getOrCreate(customerId, companyId);

    if (cart.company.toString() !== companyId) {
      throw new AppError("Carrinho pertence a outra empresa", 400);
    }

    const existingIndex = cart.items.findIndex(
      (item: any) =>
        `${item.product.toString()}|${item.notes || ''}|${addonKey(item.addons || [])}` === key
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].total =
        Math.round(cart.items[existingIndex].quantity * unitTotal * 100) / 100;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        price: basePrice,
        quantity,
        total: Math.round(unitTotal * quantity * 100) / 100,
        notes,
        addons: addonSnapshots,
      } as any);
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
      const unitTotal =
        Math.round((Number(cart.items[itemIndex].price || 0) + addonSum(cart.items[itemIndex].addons || [])) * 100) / 100;
      cart.items[itemIndex].total = Math.round(unitTotal * quantity * 100) / 100;
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
