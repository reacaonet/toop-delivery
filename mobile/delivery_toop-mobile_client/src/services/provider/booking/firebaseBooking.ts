import database from '@react-native-firebase/database';
import {AppState} from 'react-native';
import {StorageClean} from '../../../services/deviceStorage';
import config from '../../../config';
import {updateBooking} from '../../../store/actions/booking';

/** Service */
import {listActiveRun} from '../passenger/activeRun';
// import {cleanUser} from '../../services/userAuth';
import {cleanUser} from '../../../services/userAuth';

export const bookingAccepted = async (
  user: any,
  dispatch: any,
  navigation: any,
) => {
  try {
    await database()
      .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
      .remove();

    dispatch(
      updateBooking({
        payload: {
          status: 'accepted',
        },
      }),
    );

    navigation.navigate('RideAndTravelStack', {
      screen: 'RaceAccepted',
    });
  } catch (err) {
    console.log('fail firebase accepted', err);
  }
};

export const bookingInProgress = async (
  user: any,
  dispatch: any,
  navigation: any,
) => {
  try {
    await StorageClean('@waitingPassenger');

    await database()
      .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
      .remove();

    dispatch(
      updateBooking({
        payload: {
          status: 'in_progress',
        },
      }),
    );

    navigation.navigate('RideAndTravelStack', {
      screen: 'RaceAccepted',
    });
  } catch (err) {
    console.log('fail firebase accepted', err);
  }
};

export const bookingConcluded = async (
  user: any,
  dispatch: any,
  navigation: any,
  notify: any,
) => {
  try {
    if (AppState.currentState === 'active') {
      await database()
        .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
        .remove();
    }

    dispatch(
      updateBooking({
        payload: {
          status: 'concluded',
        },
      }),
    );

    navigation.navigate('RideAndTravelStack', {
      screen: 'evaluationScreen',
      params: {
        booking: notify?.booking,
      },
    });
  } catch (err) {
    console.log('fail firebase concluded', err);
  }
};

export const bookingCanceled = async (
  notify: any,
  user: any,
  dispatch: any,
  navigation: any,
) => {
  setTimeout(async () => {
    if (AppState.currentState === 'active') {
      await database()
        .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
        .remove();
    }

    dispatch(
      updateBooking({
        payload: {
          status: 'canceled',
        },
      }),
    );

    if (notify?.canceledBy === 'driver') {
      console.log('dispatch mensagem não pronta');
      // dispatch({
      //   type: 'SET_MESSAGE_SAGA',
      //   payload: {
      //     title: notify?.title || '',
      //     description: notify?.message || 'O Motorista teve que cancelar',
      //   },
      // });
    }
  }, 400);
};

export const bookinArrivalconfirm = async (
  user: any,
  dispatch: any,
  navigation: any,
) => {
  try {
    await database()
      .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
      .remove();

    dispatch(
      updateBooking({
        payload: {
          status: 'accepted',
          arrivedLocal: true,
        },
      }),
    );

    navigation.navigate('RideAndTravelStack', {
      screen: 'RaceAccepted',
    });
  } catch (err) {
    console.log('fail firebase accepted', err);
  }
};

export const pixPaid = async (user: any, dispatch: any) => {
  setTimeout(async () => {
    if (AppState.currentState === 'active') {
      await database()
        .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
        .remove();
    }

    listActiveRun(user?.passenger?._id).then(result => {
      if (
        result &&
        (result?.status === 'accepted' ||
          result?.status === 'in_progress' ||
          result?.status === 'waiting' ||
          result?.status === 'waiting_pix')
      ) {
        dispatch(
          updateBooking({
            payload: {
              status: result?.status,
              booking: result || null,
              origin: {
                ...(result?.origin || {}),
                latitude: result?.origin?.coordinates[1],
                longitude: result?.origin?.coordinates[0],
              },
              destiny: {
                ...(result?.destiny || {}),
                latitude: result?.destiny[0]?.coordinates[1],
                longitude: result?.destiny[0]?.coordinates[0],
              },
            },
          }),
        );
      }
    });
  }, 400);
};

export const blockedUser = async (
  user: any,
  dispatch: any,
  navigation: any,
  notify: any,
) => {
  try {
    if (AppState.currentState === 'active') {
      await database()
        .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
        .remove();

      await cleanUser();

      // dispatch({
      //   type: 'SET_MESSAGE_SAGA',
      //   payload: {
      //     title: 'Cadastro',
      //     description: notify?.message || 'Seu cadastro se encontra inativo',
      //   },
      // });

      setTimeout(() => {
        navigation.navigate('Login');
      }, 300);
    }
  } catch (err) {
    console.log('fail blockedUser', err);
  }
};

export const changeRoute = async (user: any, dispatch: any) => {
  setTimeout(async () => {
    await database()
      .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
      .remove();

    listActiveRun(user?.passenger?._id).then(result => {
      if (
        result &&
        (result?.status === 'accepted' ||
          result?.status === 'in_progress' ||
          result?.status === 'waiting' ||
          result?.status === 'waiting_pix')
      ) {
        dispatch(
          updateBooking({
            payload: {
              status: result?.status,
              booking: result || null,
              origin: {
                ...(result?.origin || {}),
                latitude: result?.origin?.coordinates[1],
                longitude: result?.origin?.coordinates[0],
              },
              destiny: {
                ...(result?.destiny || {}),
                latitude: result?.destiny[0]?.coordinates[1],
                longitude: result?.destiny[0]?.coordinates[0],
              },
            },
          }),
        );
      }
    });
  }, 400);
};
