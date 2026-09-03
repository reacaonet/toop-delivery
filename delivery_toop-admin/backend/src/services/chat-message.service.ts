import mongoose from 'mongoose';
import { ChatMessageModel, ChatPersonType } from '../models/ChatMessage';
import { AppError } from '../middleware/errorHandler';

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.isValidObjectId(id);
}

interface IChatMessageInput {
  message?: string;
  type?: string;
  dataType?: string;
  urlFile?: string;
  shoppingCart?: string;
  person?: string;
  personId?: string;
  personSend?: string;
  personSendId?: string;
  flag?: string;
  read?: boolean;
  readSend?: boolean;
  order_number?: number;
}

export class ChatMessageService {
  async listByCart(cartId: string) {
    if (!cartId || !isValidId(cartId)) {
      throw new AppError('Informe um carrinho válido', 400);
    }

    const messages = await ChatMessageModel.aggregate([
      { $match: { shoppingCart: new mongoose.Types.ObjectId(cartId) } },
      {
        $project: {
          type: 1,
          read: 1,
          readSend: 1,
          message: 1,
          personId: 1,
          person: 1,
          personSendId: 1,
          order_number: 1,
          personSend: 1,
          createdAt: 1,
          updatedAt: 1,
          customer: {
            $cond: {
              if: { $eq: ['$person', ChatPersonType.CUSTOMER] },
              then: '$personId',
              else: {
                $cond: {
                  if: { $eq: ['$personSend', ChatPersonType.CUSTOMER] },
                  then: '$personSendId',
                  else: null,
                },
              },
            },
          },
          shopper: {
            $cond: {
              if: { $eq: ['$person', ChatPersonType.SHOPPER] },
              then: '$personId',
              else: {
                $cond: {
                  if: { $eq: ['$personSend', ChatPersonType.SHOPPER] },
                  then: '$personSendId',
                  else: null,
                },
              },
            },
          },
          deliveryMan: {
            $cond: {
              if: { $eq: ['$person', ChatPersonType.DELIVERY_MAN] },
              then: '$personId',
              else: {
                $cond: {
                  if: { $eq: ['$personSend', ChatPersonType.DELIVERY_MAN] },
                  then: '$personSendId',
                  else: null,
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { id: '$customer' },
          as: 'customer',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, email: 1, avatar: 1 } },
          ],
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { id: '$shopper' },
          as: 'shopper',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, email: 1, avatar: 1 } },
          ],
        },
      },
      { $unwind: { path: '$shopper', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { id: '$deliveryMan' },
          as: 'deliveryMan',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, email: 1, avatar: 1 } },
          ],
        },
      },
      { $unwind: { path: '$deliveryMan', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: 1 } },
    ]);

    return messages;
  }

  async list(query: { cart?: string; person?: string; personSend?: string }) {
    const { cart, person, personSend } = query;
    const filter: any = {};
    if (cart) filter.shoppingCart = cart;

    if (person && personSend) {
      filter.$or = [
        { $and: [{ person }, { personSend }] },
        { $and: [{ person: personSend }, { personSend: person }] },
      ];
    }

    return ChatMessageModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async noRead(cartId: string, personId?: string) {
    if (!cartId || !isValidId(cartId)) {
      throw new AppError('Informe um carrinho válido', 400);
    }
    if (!personId) {
      throw new AppError('Informe um usuário válido', 400);
    }

    const total = await ChatMessageModel.countDocuments({
      shoppingCart: cartId,
      personSendId: personId,
      read: false,
    });

    return { total };
  }

  async create(data: IChatMessageInput) {
    const { shoppingCart, person, personId, personSend, personSendId } = data;

    if (!shoppingCart || !isValidId(shoppingCart)) {
      throw new AppError('Informe um carrinho válido', 400);
    }
    if (!person || !personId) {
      throw new AppError('Informe o remetente da mensagem', 400);
    }
    if (!personSend || !personSendId) {
      throw new AppError('Informe o destinatário da mensagem', 400);
    }

    const chatMessage = await ChatMessageModel.create(data as any);

    return chatMessage;
  }

  async updateRead(data: { read?: boolean; cartId?: string; personId?: string }) {
    const { read, cartId, personId } = data;

    if (!read || !personId) {
      throw new AppError('Não foi possível atualizar a mensagem', 400);
    }

    await ChatMessageModel.updateMany(
      { shoppingCart: cartId, personSendId: personId },
      { read: !!read }
    );

    return {};
  }
}

export default new ChatMessageService();
