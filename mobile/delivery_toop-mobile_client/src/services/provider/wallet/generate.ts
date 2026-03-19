import api, { ErrorAxios, ErrorMessageServer } from '../../api';

export const generatePayment = async (params: any) => {
  try {
    const { data: response } = await api.post('/v1/wallet/add-balance', params);
    return response;
  } catch (err) {
    ErrorAxios(err, 'Fail generate payment');
    return ErrorMessageServer(err);
  }
};

export const generateByVoucher = async (params: any) => {
  const { data: response } = await api.post(
    '/v2/wallet/add-balance-voucher',
    params,
  );
  return response;
};

export const generateByCoupon = async (params: any) => {
  const { data: response } = await api.post(
    '/v1/mobility/discount/add-coupon-code',
    params,
  );

  return response;
};
