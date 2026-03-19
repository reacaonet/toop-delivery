import api, {ErrorMessageServer} from '../../api';
// import { queryString } from '../../../utils';

export const searchQrCodeDriver = async (code: string): Promise<any> => {
  try {
    const {data: response} = await api.get(
      `/v1/mobility/qrcode/list-driver-code?code=${code}`,
    );

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
