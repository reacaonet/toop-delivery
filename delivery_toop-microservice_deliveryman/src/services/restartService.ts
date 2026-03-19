import captureError from './error/captureError';

const restartService = (service: any, delay: number, source: string): void => {
  setTimeout(() => {
    try {
      return service();
    } catch (err) {
      captureError(source, err);

      return restartService(service, delay, source);
    }
  }, delay);
};

export default restartService;
