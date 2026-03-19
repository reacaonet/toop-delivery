import messaging from '@react-native-firebase/messaging';
import api, {ErrorMessageServer} from '../../api';

export const linkToFranchise = async (
  person: string,
  passenger: any,
  latitude: number,
  longitude: number,
): Promise<any> => {
  try {
    const token = await userToken();

    const {data: response} = await api.post(
      '/v1/mobility/passengers/link-frachise',
      {
        passenger,
        person,
        latitude,
        longitude,
        token,
      },
    );

    if (!response) {
      return {
        errMessage: 'Não conseguimos concluir sua solicitação',
      };
    }

    return response;
  } catch (err) {
    return ErrorMessageServer(err);
  }
};

const userToken = async () => {
  try {
    return await messaging().getToken();
  } catch (err) {
    return null;
  }
};
