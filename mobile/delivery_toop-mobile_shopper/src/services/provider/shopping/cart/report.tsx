import api from '../../../api';
import ErrorAxios from '../../errorAxios';

export const salesLast30Days = async (company: string) => {
  try {
    const response = await api.get(
      `/v2/report/shopping/carts-created-sales-made`,
      {
        headers: {
          Company: company,
        },
      },
    );
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error cartCurrent');
  }
};
