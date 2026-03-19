import api, { ErrorMessageServer } from '../../api';

export const listOneBooking = async (booking: string): Promise<any> => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/booking?booking=${booking}`,
    );

    return response;
  } catch (err: any) {
    return ErrorMessageServer(err);
  }
};
