import moment from 'moment';

/** Service */
import {StorageGet} from '../../services/deviceStorage';

const pixActive = async (cart = null) => {
  try {
    const isPixActive = await StorageGet('@pix-active');
    let response = null;

    if (isPixActive && isPixActive.time) {
      let current = moment()
        .utc(false)
        .subtract(6, 'minutes');

      let pixTime = moment(isPixActive.time).utc(false);

      if (pixTime > current && cart?._id === isPixActive?.cartId) {
        // console.log('temos um pix ativo');
        response = isPixActive;
      } else if (pixTime > current && cart === null) {
        // console.log('temos um pix ativo Home');
        response = isPixActive;
      }
    }

    return response;
  } catch (err) {
    console.log('fail pixActive', err);
    return null;
  }
};

export default pixActive;
