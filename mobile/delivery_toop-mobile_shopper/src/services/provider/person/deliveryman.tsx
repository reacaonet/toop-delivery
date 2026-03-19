import api from '../../api';
import {queryString} from '../../../utils';
import ErrorAxios from '../errorAxios';

export const listOneDeliveryMan = async (
  deliveryManId: string,
  params: any,
) => {
  try {
    const getQuery = queryString(params);
    const {data: response} = await api.get(
      `/delivery-man/list/${deliveryManId}?${getQuery}`,
    );

    return response;
  } catch (err) {
    ErrorAxios(err, 'Fail DeliveryMan listOneDeliveryMan');
    return null;
  }
};
