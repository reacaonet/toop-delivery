export const payloadError = (err: any): any => {
  try {
    let errPayload = null;
    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    return errPayload;
  } catch (err) {
    return err;
  }
};

export default payloadError;
