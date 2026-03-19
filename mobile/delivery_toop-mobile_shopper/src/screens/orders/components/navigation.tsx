import React, {useState} from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Badge} from 'react-native-elements';
import {
  useTrackPlayerEvents,
  TrackPlayerEvents,
  STATE_PLAYING,
} from 'react-native-track-player';

import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import {useIsFocused} from '@react-navigation/native';
import {getUniqueId} from 'react-native-device-info';

import Moment from 'moment';
import 'moment/locale/pt-br';

/** Service */
import updateToken from '../../../services/provider/user/updateToken';
import {listOrder} from '../../../services/provider/shopping/order';
import {listPersonSearch} from '../../../services/provider/person/list';
import {updatePersonOne} from '../../../services/provider/person/update';
import {startSoundNotification} from './../../../services/TrackPlayer/soundNotification';

import {Colors} from '../../../styles';
import config from '../../../config/index';

import New from './new';
import Progress from './progress';
import Concluded from './concluded';
import ModalComponent from './modal';

interface Props {
  order: any;
  onPress: any;
  onConcl: any;
}

// Subscribing to the following events inside MyComponent
const events = [
  TrackPlayerEvents.PLAYBACK_STATE,
  TrackPlayerEvents.PLAYBACK_ERROR,
];

const App: React.FC<Props> = ({order, onPress, onConcl}) => {
  const isFocused = useIsFocused();
  let deviceId = getUniqueId();
  const newService: any = React.useRef(null);
  const {
    authUser: {user = null},
  }: any = useSelector((state) => state);

  const [showTheThing, setShowTheThing] = useState(true);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  const [badgeNew, setBadgeNew] = useState(0);
  const [badgeProgress, setBadgeProgress] = useState(0);
  const [badgeFinish, setBadgeFinish] = useState(0);

  const [modalView, setModalView] = useState(false);

  const [list, setList] = useState<any>([]);
  const [ordersProgress, setOrdersProgress] = useState<any>([]);
  const [ordersFinish, setOrdersFinish] = useState<any>([]);

  const [isFetching, setIsFetching] = useState(true);
  const [playerState, setPlayerState] = useState(null);

  const isPlaying = playerState === STATE_PLAYING;

  const getWait = async () => {
    try {
      setIsFetching(true);
      const companyShopper: string =
        user && user.company?._id ? user.company?._id : null;

      const response = await listOrder(companyShopper, {
        status: 'WAIT_COMPANY',
      });

      setIsFetching(false);

      if (response && Array.isArray(response) && response.length > 0) {
        setList(response);
        setBadgeNew(response.length);
      } else {
        setList([]);
        setBadgeNew(0);
      }
    } catch (err) {
      setIsFetching(false);
    }
  };

  const getInProgress = async () => {
    setIsFetching(true);
    const companyShopper: string =
      user && user.company ? user.company._id : null;
    const list = await listOrder(companyShopper, {
      status:
        'ACCEPT_SHOPPER|IN_PREPARATION|FINISH_PREPARATION|PAYMENT_REQUEST|WAIT_DELIVERYMAN|ACCEPT_DELIVERYMAN|MARKET_CASHIER|IN_PROGRESS_DELIVERYMAN|RELEASE_SHOPPER|DISPATCH|DELIVERY_ROUTE',
    });
    if (list && Array.isArray(list) && list.length > 0) {
      setOrdersProgress(list);
      setBadgeProgress(list.length);
    } else {
      setOrdersProgress([]);
      setBadgeProgress(0);
    }

    setIsFetching(false);
  };

  const getInFinish = async () => {
    setIsFetching(true);
    const companyShopper: string =
      user && user.company ? user.company._id : null;

    const list = await listOrder(companyShopper, {
      status: 'FINISHED|CANCELED|NOSHOW|FINISHED_CANCELED',
      createdAt: Moment(new Date()).subtract(31, 'days').format('YYYY-MM-DD'),
    });

    if (list && Array.isArray(list) && list.length > 0) {
      setOrdersFinish(list);
      setBadgeFinish(list.length);
    } else {
      setOrdersFinish([]);
      setBadgeFinish(0);
    }

    setIsFetching(false);
  };

  const onRefresh = async () => {
    await getWait();
    await getInProgress();
    await getInFinish();
  };

  const onToken = async () => {
    try {
      await messaging()
        .getToken()
        .then(async (token) => {
          if (user) {
            updateToken(user?._id, {
              token: token,
            });
          }

          const getPerson = await listPersonSearch({
            id: user?.person?._id ?? null,
          });

          if (user && getPerson) {
            let devices = getPerson[0].devices;
            if (devices) {
              let findDevice = devices.find(
                (device: any) => device === deviceId,
              );

              if (!findDevice) {
                devices.push(deviceId);
                updatePersonOne(user.person._id, {
                  devices: devices,
                  status: true,
                });
              }
            } else {
              updatePersonOne(user.person._id, {
                devices: [deviceId],
                status: true,
              });
            }
          }
        });
    } catch (err) {
      console.log('Firebase useEffect', err);
    }
  };

  const onTokenRefresh = async () => {
    try {
      messaging().onTokenRefresh((token) => {
        if (user) {
          updateToken(user?._id, {
            token: token,
          });
        }
      });
    } catch (err) {
      console.log('Firebase useEffect', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getWait();
      getInProgress();
      getInFinish();

      onToken();
      return () => {
        onTokenRefresh();
      };
    }, [user]),
  );

  React.useEffect(() => {
    getWait();
    getInProgress();
    getInFinish();
  }, [isFocused]);

  React.useEffect(() => {
    if (list.length > 0 && !isPlaying) {
      startSoundNotification();
    }
  }, [list.length, isPlaying]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && user?.company?._id) {
        if (newService.current === null) {
          newService.current = database()
            .ref(`${config.FIREBASE_PATH}/newOrder/${user?.company?._id}`)
            .on('value', (snapshot: any) => {
              if (snapshot && snapshot.val()) {
                database()
                  .ref(`${config.FIREBASE_PATH}/newOrder/${user?.company?._id}`)
                  .remove();

                getWait();
                getInProgress();
              }
            });
          newService.current = database()
            .ref(`${config.FIREBASE_PATH}/order/company/${user?.company?._id}`)
            .on('value', (snapshot: any) => {
              if (snapshot && snapshot.val()) {
                database()
                  .ref(
                    `${config.FIREBASE_PATH}/order/company/${user?.company?._id}`,
                  )
                  .remove();

                getWait();
                getInProgress();
                getInFinish();
              }
            });
        }
      }

      return () => {
        if (newService.current !== null) {
          newService.current = null;
        }
      };
    }, [user]),
  );

  function onPressNew() {
    setShowTheThing(true);
    setShow(false);
    setShow2(false);
  }

  function clicou2() {
    setShowTheThing(false);
    setShow(true);
    setShow2(false);
  }

  function clicou3() {
    setShowTheThing(false);
    setShow(false);
    setShow2(true);
  }

  function go() {
    setModalView(false);
    clicou2();
  }

  useTrackPlayerEvents(events, (event) => {
    if (event.type === TrackPlayerEvents.PLAYBACK_ERROR) {
      console.warn('An error occured while playing the current track.');
    }
    if (event.type === TrackPlayerEvents.PLAYBACK_STATE) {
      setPlayerState(event.state);
    }
  });

  return (
    <View style={styles.content}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => onPressNew()}
          style={styles.touchTitle}>
          <View>
            <Text style={styles.title}>Novos</Text>
            {badgeNew && badgeNew > 0 ? (
              <Badge
                value={badgeNew}
                status="error"
                containerStyle={styles.badgeStyle}
              />
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={clicou2} style={styles.touchTitle}>
          <View>
            {badgeProgress && badgeProgress > 0 ? (
              <Badge
                value={badgeProgress}
                status="error"
                containerStyle={styles.badgeStyle}
              />
            ) : null}
            <Text style={styles.title2}>Andamento</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={clicou3} style={styles.touchTitle}>
          <View>
            {badgeFinish && badgeFinish > 0 ? (
              <Badge
                value={badgeFinish}
                status="error"
                containerStyle={styles.badgeStyle}
              />
            ) : null}
            <Text style={styles.title3}>Concluídas</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.border} />

      <New
        onPress={() => setModalView(!modalView)}
        order={order}
        show={showTheThing}
        onRefresh={onRefresh}
        list={list}
        isFetching={isFetching}
      />

      <Progress
        onPress={onPress}
        show={show}
        onRefresh={onRefresh}
        list={ordersProgress}
        isFetching={isFetching}
      />

      <Concluded
        onConcl={onPress}
        show={show2}
        onRefresh={onRefresh}
        list={ordersFinish}
        isFetching={isFetching}
      />

      <ModalComponent
        visible={modalView}
        onRequestClose={() => setModalView(!modalView)}
        close={() => setModalView(false)}
        accept={go}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
  },
  content: {
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  border: {
    width: '95%',
    borderBottomColor: Colors.GRAY,
    borderBottomWidth: 2,
    alignSelf: 'center',
  },
  route2: {
    width: '50%',
  },
  title: {
    marginTop: 15,
    height: '100%',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.PRIMARY,
  },
  title2: {
    marginTop: 15,
    height: '100%',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.PRIMARY,
  },
  title3: {
    marginTop: 15,
    height: '100%',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.PRIMARY,
  },
  touchTitle: {
    width: '30%',
  },
  text2: {
    marginTop: 15,
    textAlign: 'center',
  },
  badgeStyle: {
    position: 'absolute',
    marginTop: 5,
    right: 0,
  },
});
