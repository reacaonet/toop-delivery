import captureError from './error/captureError';

const restartService = (
  service: Function, delay: number, serviceName: string,
): void => {
  setTimeout(() => {
    try {
      service();
    } catch (err) {
      captureError(`Restart ${serviceName}`, err);
      restartService(service, delay, serviceName);
    }
  }, delay);
};

export default restartService;
