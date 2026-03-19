import { Alert, AppState } from 'react-native';
import database from '@react-native-firebase/database';
import config from '../../../config';

/** Service */
import { ActiverRun } from '../../provider/booking/activeRun';

export const bookingEvaluation = async (
  user: any,
  notify: any,
  dispatch: any,
  navigate: any,
) => {
  try {
    navigate('EvaluationScreen', {
      ...notify,
      booking: notify?.booking,
      price: notify?.price || 0,
      priceDriver: notify?.priceDriver || 0,
      typePayment: notify?.typePayment || '',
    });
  } catch (err) {
    //
  }
};

export const bookingCanceled = async (
  user: any,
  dispatch: any,
  navigate: any,
) => {
  try {
    dispatch({
      type: 'CLEAN_BOOKING_SAGA',
    });

    Alert.alert('Notificação', 'Usuário Cancelou a corrida');
    navigate('DriverMap', {});
    database().ref(`${config.FIREBASE_PATH}driver/${user?._id}`).remove();
  } catch (_err) {
    //
  }
};

export const blockedUser = async (
  user: any,
  dispatch: any,
  navigate: any,
  notify: any,
) => {
  try {
    if (AppState.currentState === 'active') {
      await database()
        .ref(`${config.FIREBASE_PATH}driver/${user?._id}`)
        .remove();

      dispatch({
        type: 'CLEAN_USER_SAGA',
      });

      dispatch({
        type: 'SET_MESSAGE_SAGA',
        payload: {
          title: 'Cadastro',
          description: notify?.message || 'Seu cadastro se encontra inativo',
        },
      });

      setTimeout(() => {
        navigate('Login', {});
      }, 300);
    }
  } catch (err) {
    console.log('fail blockedUser', err);
  }
};

export const changeRoute = async (
  user: any,
  notify: any,
  dispatch: any,
  navigate: any,
) => {
  setTimeout(async () => {
    ActiverRun(user?._id).then(result => {
      if (result && Array.isArray(result) && result.length > 0) {
        dispatch({
          type: 'UPDATE_BOOKING_SAGA',
          payload: {
            status: result[0].status,
            booking: result,
          },
        });

        dispatch({
          type: 'SET_MESSAGE_SAGA',
          payload: {
            title: notify?.title || 'Rota Alterada',
            description:
              notify?.message || 'Rota Alterada, confira a nova rota',
          },
        });

        setTimeout(() => {
          navigate('DriverMap', {});
        }, 150);

        database().ref(`${config.FIREBASE_PATH}driver/${user?._id}`).remove();
      } else if (result && Array.isArray(result) && result.length === 0) {
        dispatch({
          type: 'CLEAN_BOOKING_SAGA',
        });
      }
    });
  }, 400);
};

export const pixPaidWallet = async (
  user: any,
  navigate: any,
  notify: any,
  dispatch: any,
) => {
  if (AppState.currentState === 'active') {
    await database()
      .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
      .remove();
  }

  dispatch({
    type: 'SET_MESSAGE_SAGA',
    payload: {
      title: notify?.title || '',
      description: notify?.message || '',
    },
  });

  navigate('Wallet', {
    params: notify,
  });
};
