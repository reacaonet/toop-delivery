import api from '../../api';
import {queryString} from '../../../utils';

const listCompany = async params => {
  try {
    const getQuery = queryString(params);

    // console.log('listCompany', `company/list?${getQuery}`);
    const response = await api.get(`company/list?${getQuery}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail Company List', err?.response?.data);
    return null;
  }
};

const listCompanyHighlights = async params => {
  try {
    const getQuery = queryString(params);
    const response = await api.get(`company/highlights?${getQuery}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail Company List Highlights', err);
    return null;
  }
};

const listCompanyAccessories = async params => {
  try {
    const getQuery = queryString(params);
    // console.log('Url', `company/list?${getQuery}`);

    const response = await api.get(`v2/company/accessories?${getQuery}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail Company listCompanyAccessories', err);
    return null;
  }
};

const listOne = async (company, params = {}) => {
  const getQuery = queryString(params);
  let response = null;
  try {
    // console.log('listOne', `company/list/${company}?${getQuery}`);

    response = await api.get(`company/list/${company}?${getQuery}`);
    const data = response.data;
    if (data && data.list) {
      return data.list;
    }

    return data;
  } catch (err) {
    console.log('Fail Company ListOne', err, response);
    return null;
  }
};

const listCompanyFavorites = async params => {
  try {
    const getQuery = queryString(params);

    const response = await api.get(`company/favorites/?${getQuery}`);
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail Company listCompanyFavorites', err);
    return null;
  }
};

const listFranchiseConfig = async (company, params = {}) => {
  try {
    const getQuery = queryString(params);

    const response = await api.get(
      `franchises/configurations/${company}?${getQuery}`,
    );

    const data = response.data;
    return data;
  } catch (err) {
    console.log('Fail listFranchiseConfig', err);
    return null;
  }
};

export {
  listCompany,
  listOne,
  listCompanyFavorites,
  listCompanyAccessories,
  listCompanyHighlights,
  listFranchiseConfig,
};
