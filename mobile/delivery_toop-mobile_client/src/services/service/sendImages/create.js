import {Platform} from 'react-native';
import api, {ErrorAxios} from '../../api';
import env from '../../../config';

const sendImages = async (image, folder) => {
  try {
    const response = await api.post('/send-images/', {image, folder});
    const res = response.data;

    return res;
  } catch (err) {
    ErrorAxios(err, 'Fail Create Status Online Delivery Man');
    return null;
  }
};

const uploadDocument = async (file, folder = '') => {
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

export {sendImages, uploadDocument};
