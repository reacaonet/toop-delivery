import { Types } from 'mongoose';
import { ShoppingCartModel } from '../models/ShoppingCart';
import { ShoppingCartItemModel } from '../models/ShoppingCartItem';
import { OrderModel } from '../models/Order';
import { OrderStatusModel } from '../models/OrderStatus';
import { AppError } from '../middleware/errorHandler';

export class ShoppingCartService {
  async paginator(query: Record<string, any> = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));

    const filter: Record<string, any> = { status: { $ne: 'deleted' } };
    if (query.customer && Types.ObjectId.isValid(query.customer)) filter.customer = query.customer;
    if (query.company && Types.ObjectId.isValid(query.company)) filter.company = query.company;
    if (query.status) filter.status = query.status;

    const [data, total] = await Promise.all([
      ShoppingCartModel.find(filter)
        .populate('customer', 'name email')
        .populate('company', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      ShoppingCartModel.countDocuments(filter),
    ]);

    return { list: data, total };
  }

  async listAll() {
    const carts = await ShoppingCartModel.find({ status: { $ne: 'deleted' } })
      .populate('customer', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    return carts;
  }

  async getById(id: string): Promise<any> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Carrinho inválido', 400);
    }
    const [cart, items] = await Promise.all([
      ShoppingCartModel.findById(id).populate('customer', 'name email').populate('company', 'name'),
      ShoppingCartItemModel.find({ cart: id }).populate('shopper', 'name'),
    ]);
    if (!cart) throw new AppError('Carrinho não encontrado', 404);
    return { ...cart.toJSON(), items };
  }

  async getActive(customer: string, company?: string): Promise<any> {
    if (!customer || !Types.ObjectId.isValid(customer)) {
      throw new AppError('Cliente inválido', 400);
    }
    const filter: Record<string, any> = { customer, status: { $ne: 'deleted' } };
    if (company && Types.ObjectId.isValid(company)) filter.company = company;

    const cart = await ShoppingCartModel.findOne(filter).sort({ createdAt: -1 });
    if (!cart) return null;

    const items = await ShoppingCartItemModel.find({ cart: cart._id, check: true });
    return { ...cart.toJSON(), items };
  }

  async create(customer: string, company: string, itemData: any = {}): Promise<any> {
    if (!customer || !Types.ObjectId.isValid(customer)) throw new AppError('Cliente inválido', 400);
    if (!company || !Types.ObjectId.isValid(company)) throw new AppError('Empresa inválida', 400);

    let cart = await ShoppingCartModel.findOne({
      customer,
      company,
      status: 'inProgress',
    }).sort({ createdAt: -1 });

    if (!cart) {
      cart = await ShoppingCartModel.create({
        customer,
        company,
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        total: 0,
        status: 'inProgress',
      });
    }

    if (itemData && itemData.product) {
      await this.addItem(cart.id, itemData);
    }

    return this.getById(String((cart as any)._id));
  }

  async addItem(cartId: string, data: any) {
    if (!cartId || !Types.ObjectId.isValid(cartId)) throw new AppError('Carrinho inválido', 400);
    const cart = await ShoppingCartModel.findById(cartId);
    if (!cart) throw new AppError('Carrinho não encontrado', 404);

    const amount = Number(data.amount || 1);
    const price = Number(data.price || 0);
    const name = data.name;

    if (!name) throw new AppError('Informe o nome do item', 400);
    if (price <= 0) throw new AppError('Informe o preço do item', 400);

    const item = await ShoppingCartItemModel.create({
      cart: cart._id,
      product: data.product && Types.ObjectId.isValid(data.product) ? data.product : undefined,
      name,
      amount,
      price,
      total: Math.round(price * amount * 100) / 100,
      check: data.check === undefined ? true : data.check,
      radio: data.radio,
      type: data.type || 'supermarket',
      shopper: data.shopper && Types.ObjectId.isValid(data.shopper) ? data.shopper : undefined,
      isPizza: !!data.isPizza,
      size: data.size,
      pieces: data.pieces,
      flavors: Array.isArray(data.flavors) ? data.flavors : undefined,
      notes: data.notes,
    });

    await this.recalcTotal(cartId);
    return item;
  }

  async updateItem(itemId: string, data: any) {
    if (!itemId || !Types.ObjectId.isValid(itemId)) throw new AppError('Item inválido', 400);
    const item = await ShoppingCartItemModel.findById(itemId);
    if (!item) throw new AppError('Item do carrinho não encontrado', 404);

    if (data.amount !== undefined) item.amount = Number(data.amount);
    if (data.price !== undefined) item.price = Number(data.price);
    if (data.check !== undefined) item.check = !!data.check;
    if (data.radio !== undefined) item.radio = data.radio;
    if (data.shopper !== undefined && Types.ObjectId.isValid(data.shopper)) item.shopper = data.shopper;
    if (data.notes !== undefined) item.notes = data.notes;
    item.total = Math.round(item.price * item.amount * 100) / 100;
    await item.save();

    await this.recalcTotal(String(item.cart));
    return item;
  }

  async removeItem(itemId: string) {
    if (!itemId || !Types.ObjectId.isValid(itemId)) throw new AppError('Item inválido', 400);
    const item = await ShoppingCartItemModel.findById(itemId);
    if (!item) throw new AppError('Item do carrinho não encontrado', 404);
    const cartId = String(item.cart);
    await ShoppingCartItemModel.findByIdAndDelete(itemId);
    await this.recalcTotal(cartId);
    return { success: true };
  }

  private async recalcTotal(cartId: string) {
    const items = await ShoppingCartItemModel.find({ cart: cartId, check: true });
    const subtotal = Math.round(items.reduce((acc, i) => acc + i.total, 0) * 100) / 100;
    const cart = await ShoppingCartModel.findById(cartId);
    if (!cart) return;
    const deliveryFee = Number(cart.deliveryFee || 0);
    const discount = Number(cart.discount || 0);
    cart.subtotal = subtotal;
    cart.total = Math.round((subtotal + deliveryFee + (Number(cart.tip || 0)) - discount) * 100) / 100;
    await cart.save();
  }

  async update(cartId: string, data: any) {
    if (!cartId || !Types.ObjectId.isValid(cartId)) throw new AppError('Carrinho inválido', 400);
    const allowed = ['deliveryFee', 'discount', 'tip', 'status', 'schedule', 'paymentMethod', 'deliveryAddress'];
    const payload: Record<string, any> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) payload[key] = data[key];
    }
    const cart = await ShoppingCartModel.findByIdAndUpdate(cartId, payload, { new: true, runValidators: true });
    if (!cart) throw new AppError('Carrinho não encontrado', 404);
    await this.recalcTotal(cartId);
    return this.getById(cartId);
  }

  async softDelete(cartId: string) {
    if (!cartId || !Types.ObjectId.isValid(cartId)) throw new AppError('Carrinho inválido', 400);
    const cart = await ShoppingCartModel.findByIdAndUpdate(cartId, { status: 'deleted' }, { new: true });
    if (!cart) throw new AppError('Carrinho não encontrado', 404);
    return { success: true };
  }

  async reorder(cartId: string): Promise<any> {
    if (!cartId || !Types.ObjectId.isValid(cartId)) throw new AppError('Carrinho inválido', 400);
    const source = await ShoppingCartModel.findById(cartId).populate('items');
    if (!source) throw new AppError('Carrinho não encontrado', 404);
    const items = await ShoppingCartItemModel.find({ cart: source._id });

    const target = await ShoppingCartModel.create({
      customer: source.customer,
      company: source.company,
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      total: 0,
      status: 'inProgress',
      deliveryAddress: source.deliveryAddress,
    });

    await ShoppingCartItemModel.insertMany(
      items.map((i) => ({
        cart: target._id,
        product: i.product,
        name: i.name,
        amount: i.amount,
        price: i.price,
        total: i.total,
        check: true,
        type: i.type,
        isPizza: i.isPizza,
        size: i.size,
        pieces: i.pieces,
        flavors: i.flavors,
        notes: i.notes,
      }))
    );

    await this.recalcTotal(String(target._id));
    return this.getById(String(target._id));
  }

  async checkout(cartId: string, data: any = {}): Promise<any> {
    if (!cartId || !Types.ObjectId.isValid(cartId)) throw new AppError('Carrinho inválido', 400);
    const cart = await ShoppingCartModel.findById(cartId);
    if (!cart) throw new AppError('Carrinho não encontrado', 404);
    if (cart.status === 'purchaded') throw new AppError('Carrinho já finalizado', 400);

    const items = await ShoppingCartItemModel.find({ cart: cartId, check: true });
    if (items.length === 0) throw new AppError('Carrinho vazio', 400);

    const orderNumber = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const subtotal = cart.subtotal || 0;
    const deliveryFee = Number(data.deliveryFee ?? cart.deliveryFee ?? 0);
    const tip = Number(data.tip ?? cart.tip ?? 0);
    const discount = Number(data.discount ?? cart.discount ?? 0);
    const total = Math.round((subtotal + deliveryFee + tip - discount) * 100) / 100;

    const order = await OrderModel.create({
      orderNumber,
      customer: cart.customer,
      company: cart.company,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.amount,
        price: i.price,
        total: i.total,
      })),
      subtotal,
      deliveryFee,
      discount,
      total,
      status: 'pending',
      paymentMethod: data.paymentMethod || cart.paymentMethod || 'MONEY',
      paymentStatus: data.paymentMethod === 'MONEY' ? 'paid' : 'pending',
      deliveryAddress: data.deliveryAddress || cart.deliveryAddress,
      notes: data.notes,
      shoppingCart: (cart as any)._id,
      deliveryMode: data.deliveryMode,
      schedule: data.schedule || cart.schedule,
      tip,
      pixTxid: data.pixTxid,
    });

    cart.status = 'purchaded';
    if (data.paymentMethod) cart.paymentMethod = data.paymentMethod;
    if (data.pixTxid) cart.pixTxid = data.pixTxid;
    await cart.save();
    await this.recalcTotal(cartId);

    await OrderStatusModel.create({
      order: (order as any)._id,
      orderNumber,
      status: 'WAIT_COMPANY',
      typePayment: data.paymentMethod || cart.paymentMethod || 'MONEY',
      typeSchedule: data.schedule?.type,
    }).catch((e) => console.error('[ShoppingCart] Erro ao registrar orderStatus:', e.message));

    return order;
  }
}

export default new ShoppingCartService();