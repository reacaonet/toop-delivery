/** LIb */

/** Model */
const Order = require('../../../models/Shopping/order/orderStatusModel');
const CartItens = require('../../../models/Shopping/CartItemModel');

/** Service */
const integration = require('../../integrationApi');

const pratikoNewOrder = async (payload) => {
  try {
    let orderId = payload.orderId;
    let company = payload.company;

    let order = await Order.findById(orderId)
      .select({
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
      .populate({
        path: 'customer',
        select: {
          person: 1,
        },
        populate: {
          path: 'person',
          select: {
            name: 1,
            email: 1,
            cpf: 1,
            phone: 1,
          },
        }
      })
      .populate({
        path: 'customerDelivery',
        select: {
          number: 1,
          complement: 1,
          referencePoint: 1,
          address: 1,
          addressRoute: 1,
          addressRegion: 1,
          city: 1,
      }})
      .populate({
        path: 'shoppingCart',
        select: {
          _id: 1,
          schedule: 1,
        },
      })
      .lean();

    let cartItens =  await CartItens.find({
      shoppingCart: order.shoppingCart._id,
      isDeleted: false,
    }).lean();

    let cart = [];

    for (const item  of cartItens) {
      let price = item.price;

      if (item.pricePromotion && item.pricePromotion > 0) {
        price = item.pricePromotion;
      }

      cart.push({
        codigoProduto: item._id,
        qtdEmbalagem: item.amount,
        valorProduto: price * item.amount,
      });
    }

    let list = {
      customerName: getName(order),
      customerEmail: getEmail(order),
      customerCpf: getCpf(order),
      customerPhone: getPhone(order),
      address: getAddres(order),
      addressNumber: getAddresNumber(order),
      addressComplement: getAddresCompement(order),
      addressRegion: getAddresRegion(order),
      addressCity: getAddresCity(order),
      scheduleDate: getScheduleDate(order),
      scheduleStart: getScheduleStart(order),
      scheduleEnd: getScheduleEnd(order),
      itens: cart,
    };

     let {data: response} = await integration.post(`/rpinfo/sales/order/${company.cnpj}`, list);

    return {
      status: true,
      response,
    };
  } catch (err) {
    console.log('err', err);

    return {
      status: false,
      message: 'não foi possível gerar um novo pedido',
      err: err.message,
    }
  }
};

const getName = (order) => {
  if (order.customer.person && order.customer.person.name) {
    return order.customer.person.name;
  }

  return '';
};

const getEmail = (order) => {
  if (order.customer.person.email && order.customer.person.email) {
    return order.customer.person.email;
  }

  return '';
};

const getCpf = (order) => {
  if (order.customer.person.cpf && order.customer.person.cpf) {
    return order.customer.person.cpf;
  }

  return '';
};

const getPhone = (order) => {
  if (order.customer.person.phone && order.customer.person.phone) {
    return order.customer.person.phone;
  }

  return '';
};

const  getAddres = (order) => {
  try {
    return order.customerDelivery.address;
  } catch (err) {
    return '';
  }
}

const  getAddresNumber = (order) => {
  try {
    return order.customerDelivery.number;
  } catch (err) {
    return '';
  }
}

const  getAddresCompement = (order) => {
  try {
    return order.customerDelivery.complement;
  } catch (err) {
    return '';
  }
}

const  getAddresRegion = (order) => {
  try {
    return order.customerDelivery.addressRegion;
  } catch (err) {
    return '';
  }
}

const  getAddresCity = (order) => {
  try {
    return order.customerDelivery.city;
  } catch (err) {
    return '';
  }
}

const getScheduleDate = (order) => {
  try {
    return order.shoppingCart.schedule.deliveryDate;
  } catch (err) {
    return '';
  }
};

const getScheduleStart = (order) => {
  try {
    return order.shoppingCart.schedule.startHour;
  } catch (err) {
    return '';
  }
};

const getScheduleEnd = (order) => {
  try {
    return order.shoppingCart.schedule.endHour;
  } catch (err) {
    return '';
  }
};

module.exports = pratikoNewOrder;
