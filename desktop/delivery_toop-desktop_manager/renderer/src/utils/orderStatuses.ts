export const nextStatus: string[] = [
  'confirmed',
  'preparing',
  'ready',
  'delivering',
  'delivered',
];

export const companyStatus = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
];

export const deliveryStatus = [
  'ready',
  'delivering',
  'delivered',
];

export const humanReadableStatus: Record<string, string> = {
  pending: 'NOVO PEDIDO',
  confirmed: 'ACEITO',
  preparing: 'EM PREPARAÇÃO',
  ready: 'PRONTO',
  delivering: 'A CAMINHO DO CLIENTE',
  delivered: 'ENTREGUE',
  cancelled: 'CANCELADO',
};
