import api from '../../../api';
import {queryString} from '../../../../utils';
import ErrorAxios from '../../errorAxios';

const listProduct = async (company: string, params: {}) => {
  try {
    const getQuery: string = queryString(params);
    const response = await api.get(`/product/company/${company}?${getQuery}`);
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error listProduct');
  }
};

const searchBarCode = async (company: string, barCode: string) => {
  try {
    const response = await api.get(
      `/product/company/${company}/barcode/${barCode}`,
    );
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error SearchBarCode');
  }
};

const paginatorProduct = async (company: string, params: any) => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(`product/paginator?${getQuery}`, {
      headers: {
        Company: company,
      },
    });
    const data = response.data;
    return data;
  } catch (err) {
    return ErrorAxios(err, 'Error SearchBarCode');
  }
};

export {listProduct, searchBarCode, paginatorProduct};
