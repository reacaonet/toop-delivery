import { Platform } from 'react-native';
import api, { ErrorMessageServer } from '../api';
import env from '../../config';

export const fileUpload = async (file: Object): Promise<any> => {
  try {
    const { data: response } = await api.post('/v1/image/fileUpload', file);

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

export const uploadDocument = async (file: any, folder = ''): Promise<any> => {
  try {
    var formData = new FormData();

    formData.append('file', {
      name: file.name,
      type: file.type,
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
    });

    formData.append('folder', folder);

    const req = await fetch(`${env.apiUrl}/v2/upload`, {
      method: 'POST',
      body: formData,
    });

    if (req.status === 413) {
      return {
        errMessage:
          'Tamanho do arquivo de envio não permitido, por favor selecione um arquivo menor',
      };
    } else if (!req.ok) {
      return {
        errMessage: 'Não foi possível enviar o arquivo',
      };
    }

    const response = await req.json();

    if (!response.url) {
      return {
        errMessage: 'Não foi possível salvar imagem',
      };
    }

    return response;
  } catch (err) {
    return {
      errMessage: 'Não foi possível enviar o arquivo',
    };
  }
};
