const captureError = (source: string, err: any): void => {
  try {
    if (err?.response?.data) {
      console.log(`${source}`, err.response.data);
    } else {
      const msg = err?.message || String(err);
      if ( msg.includes('ECONNREFUSED') ) {
        console.log(`${source}`, msg);
      } else {
        console.log(`${source}`, err);
      }
    }
  } catch (errAll) {
    console.log(`${source}`, errAll);
  }
};

export default captureError;
