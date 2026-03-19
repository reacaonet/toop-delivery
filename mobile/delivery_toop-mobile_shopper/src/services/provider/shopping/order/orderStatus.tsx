const OrderStatus = (status: number) => {
  try {
    let list: any = [];
    list.WAIT_COMPANY = 'Aguardando Confirmação';
    list.ACCEPT_SHOPPER = 'Aceito';
    list.IN_PREPARATION = 'Em Preparação';
    //list.PAYMENT_REQUEST = 'Pagamento Enviado';
    list.WAIT_DELIVERYMAN = 'Aguardando Entregador';
    list.ACCEPT_DELIVERYMAN = 'Aceito Entregador';
    list.RELEASE_SHOPPER = 'Pedido já está com entregador';
    list.DELIVERY_ROUTE = 'Em rota de entrega';
    list.DISPATCH = 'Pedido com entregador';
    list.FINISHED = 'Finalizado';
    list.CANCELED = 'Cancelado';

    return list[status];
  } catch (err) {
    return '';
  }
};

const nextOrderStatus = (status: string) => {
  try {
    let list: any = [];

    list.push({
      status: 'WAIT_COMPANY',
    });

    // list.push({
    //   status: 'ACCEPT_SHOPPER',
    // });

    list.push({
      status: 'IN_PREPARATION',
    });

    // list.push({
    //   status: 'FINISH_PREPARATION',
    // });

    // list.push({
    //   status: 'MARKET_CASHIER',
    // });

    list.push({
      status: 'WAIT_DELIVERYMAN',
    });

    list.push({
      status: 'ACCEPT_DELIVERYMAN',
    });

    list.push({
      status: 'RELEASE_SHOPPER',
    });

    list.push({
      status: 'DELIVERY_ROUTE',
    });

    let index = list.findIndex((item: any) => item.status === status);

    if (index > -1) {
      return list[index + 1].status;
    }
    return list;
  } catch (err) {
    return '';
  }
};

const indexOrderStatus = (status: string) => {
  try {
    let list: any = [];

    list.push({
      status: 'WAIT_COMPANY',
    });

    // list.push({
    //   status: 'ACCEPT_SHOPPER',
    // });

    list.push({
      status: 'IN_PREPARATION',
    });

    list.push({
      status: 'FINISH_PREPARATION',
    });

    list.push({
      status: 'MARKET_CASHIER',
    });

    list.push({
      status: 'WAIT_DELIVERYMAN',
    });

    list.push({
      status: 'ACCEPT_DELIVERYMAN',
    });

    let index = list.findIndex((item: any) => item.status === status);
    return index;
  } catch (err) {
    return 0;
  }
};

const separationStatus = (status: string) => {
  if (status !== 'WAIT_COMPANY' && status !== 'ACCEPT_SHOPPER') {
    return true;
  }

  return false;
};

const waitDeliveryManStatus = (status: string) => {
  if (
    status === 'WAIT_DELIVERYMAN' ||
    status === 'ACCEPT_DELIVERYMAN' ||
    status === 'RELEASE_SHOPPER' ||
    status === 'DELIVERY_ROUTE' ||
    status === 'DISPATCH' ||
    status === 'ACCEPT_DELIVERYMAN' ||
    status === 'FINISHED' ||
    status === 'CANCELED'
  ) {
    return true;
  }

  return false;
};

const withdrawalStatus = (status: string) => {
  if (
    status === 'RELEASE_SHOPPER' ||
    status === 'DISPATCH' ||
    status === 'DELIVERY_ROUTE' ||
    status === 'FINISHED'
  ) {
    return true;
  }

  return false;
};

const deliveryStatus = (status: string) => {
  if (status === 'FINISHED') {
    return true;
  }

  return false;
};

export {
  OrderStatus,
  nextOrderStatus,
  indexOrderStatus,
  separationStatus,
  waitDeliveryManStatus,
  withdrawalStatus,
  deliveryStatus,
};
