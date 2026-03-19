import api from '../../api';

export const listSupport = async (
  type: string,
  target: string,
  franchise: string,
) => {
  try {
    const {data: response} = await api.get(
      `/v1/mobility/supportsubjects/list?type=${type}&target=${target}&franchise=${franchise}`,
    );

    return response;
  } catch (err) {
    return null;
  }
};
