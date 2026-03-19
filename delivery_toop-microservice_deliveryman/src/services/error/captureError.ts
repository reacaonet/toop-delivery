const captureError = (source: string, err: any): void => {
  try {
    if (err.response && err.response.data) {
      console.log(`${source}`, err.response.data);
    } else {
      if (err.message.search('ECONNREFUSED') >= 0) {
        console.log(`${source}`, err.message);
      } else {
        console.log(`${source}`, err);
      }
    }
  } catch (errAll) {
    console.log(`${source}`, errAll);
  }
};

export default captureError;
