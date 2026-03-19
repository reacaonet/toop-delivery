import api from '../../api';

export const listCart = async (cart: string) => {
  try {
    const {data: response} = await api.get(
      `/shopping/cart-item/show-all/${cart}`,
    );

    return response;
  } catch (err) {
    return null;
  }
};
