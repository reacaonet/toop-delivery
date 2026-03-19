import api from '../../api';

const listDeliveryAddress = async (customer: any) => {
  try {
    const response = await api.get(
      `/customer/delivery-address/list/${customer}`,
    );
    const data = response.data;

    return data;
  } catch (err) {
    console.log('Fail listDeliveryAddress', err);
    return null;
  }
};

export {listDeliveryAddress};
