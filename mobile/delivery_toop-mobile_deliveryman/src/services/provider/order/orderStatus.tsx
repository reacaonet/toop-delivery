const OrderStatus = (status: number) => {
  try {
    let list: any = [];
    //Aguardando shopper aceitar pedido.
    list.WAIT_COMPANY = 'Aguardando Confirmação';
    //Shopper aceitou pedido.
    list.ACCEPT_SHOPPER = 'Aceito';
    //Pedido em preparação pelo shopper.
    list.IN_PREPARATION = 'Em Preparação';
    //Preparação do pedido finalizada pelo shopper.
    list.FINISH_PREPARATION = 'Prepração finalizada';
    //Aguardando um entregador ser selecionado para ver se ele aceita realizar a entrega.
    list.WAIT_DELIVERYMAN = 'Aguardando Entregador';
    //Entregador aceitou fazer a entrega.
    list.ACCEPT_DELIVERYMAN = 'Aceito Entregador';
    //Shopper liberou a entrega para o entregador.
    list.RELEASE_SHOPPER = 'Liberado Entregador';
    //Entregador inicio a entrega
    list.DELIVERY_ROUTE = 'Entrega em andamento';
    //Entregador finalizou a entrega
    list.FINISHED = 'Finalizado';

    return list[status];
  } catch (err) {
    return '';
  }
};

export {OrderStatus};
