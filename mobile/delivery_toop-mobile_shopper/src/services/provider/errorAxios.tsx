import config from '../../config';

const ErrorAxios = (err: any, source: string) => {
  try {
    if (!config.debug) {
      return null;
    }

    if (err.response && err.response.data) {
      console.log(`${source}`, err.response.data);
    } else {
      console.log(`${source}`, err);
    }

    return null;
  } catch (e) {
    return null;
  }
};

const ErrorMessageServer = (err: any) => {
  try {
    if (err.response && err.response.data && err.response.data.message) {
      return {
        errMessage: err.response.data.message,
      };
    }

    return {
      errMessage: 'Não foi possível processar solicitação',
    };
  } catch (e) {
    return {
      errMessage: 'Opps não foi possível processar informação',
    };
  }
};

export default ErrorAxios;
export { ErrorAxios, ErrorMessageServer };
