function Debug() {
  function error(origin, err) {
    try {
      if (Boolean(process.env.productio) === false) {
        let error = err;
        if (err.response && err.response.data) {
          error = err.response.data
        }

        console.log(`${origin}`, error);
      }
    } catch (err) {
      return false;
    }
  }

  return {
    error,
  }
}

module.exports = Debug;
