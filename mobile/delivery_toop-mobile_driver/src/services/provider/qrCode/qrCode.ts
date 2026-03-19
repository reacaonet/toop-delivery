import api, { ErrorMessageServer } from '../../api';

export const searchQrCodeDriver = async (code: string): Promise<any> => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/qrcode/list-driver-code?code=${code}`,
    );

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

export const generateQrCode = async (driver: String) => {
  try {
    const { data: response } = await api.get(
      `/v1/mobility/qrcode/generate-driver?driver=${driver}`,
    );

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};
