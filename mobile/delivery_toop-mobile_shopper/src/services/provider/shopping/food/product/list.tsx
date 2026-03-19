import api from '../../../../api';
import {queryString} from '../../../../../utils';
import ErrorAxios from '../../../errorAxios';

const listProduct = async (company: string, params: {}) => {
  try {
    const getQuery: string = queryString(params);
    const response = await api.get(`/food/product/${company}?${getQuery}`);
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error listProduct');
  }
};

const paginatorProduct = async (company: string, params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(`/food/product/paginator?${getQuery}`, {
      headers: {
        Company: company,
      },
    });
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error paginatorProduct');
  }
};

const listComplements = async (company: string, product_id: any) => {
  try {
    const response = await api.get(
      `/v1/food/product-complement/${product_id}`,
      {
        headers: {
          Company: company,
        },
      },
    );
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error paginatorComplements');
  }
};

export {listProduct, paginatorProduct, listComplements};
