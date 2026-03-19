/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors, Typography} from '../../../styles';
import {useSelector} from 'react-redux';

import locationBackground, {
  removeBackground,
  configureInRoute,
} from './../../../services/location/backgroundGeolocation';

/** Services Provider */
import {
  listOne,
  updateDeliveryMan,
  createDeliveryStatusOnline,
  updateDeliveryStatusOffline,
} from '../../../services/provider/deliveryMan';

interface HeaderRightProps {
  // navigation: any;
}

const HeaderRightStatus: React.FC<HeaderRightProps> = ({}) => {
  const [deliveryMan, setDeliveryMan] = useState({});
  const [status, setStatus] = useState(null);
  const [block, setBlock] = useState(false);
  const {
    authUser: {user: user},
  }: any = useSelector((state: any) => state);

  useEffect(() => {
    statusCurrent();
  }, [user]);

  const statusCurrent = async () => {
    let response = await listOne(user?.deliveryMan?._id);
    if (response && response._id) {
      setDeliveryMan(response);
      setStatus(response.isOnline);

      if (response.isOnline) {
        locationBackground(user);
      } else {
        removeBackground();
      }

      if (response.flag && response.flag === 'ON_ROUTE') {
        configureInRoute(user);
      }
    }
  };

  const changeStatus = async () => {
    if (user && user.deliveryMan && user.deliveryMan._id) {
      let response = await listOne(user?.deliveryMan?._id);

      if (!response || !response._id) {
        Alert.alert(
          'Oops',
          'Não conseguimos verificar o status, verifique a conexão com a Internet',
        );
        return;
      }

      let sendStatus = response.isOnline === false ? true : false;

      setBlock(true);
      await updateDeliveryMan(response._id, {
        isOnline: sendStatus,
      });

      if (sendStatus) {
        await createDeliveryStatusOnline({deliveryMan: user.deliveryMan._id});
      } else {
        await updateDeliveryStatusOffline(user.deliveryMan._id);
      }

      await statusCurrent();
      setBlock(false);
    } else {
      Alert.alert('Oops', 'Não conseguimos identificar o usuário...');
    }
  };

  return (
    <>
      {status !== null ? (
        <TouchableOpacity
          style={styles.container}
          onPress={() => changeStatus()}
          disabled={block}>
          {block ? (
            <ActivityIndicator
              size="small"
              color={Colors.PRIMARY}
              style={styles.indicator}
            />
          ) : (
            <>
              <View style={styles.contentCircle}>
                <View
                  style={[
                    styles.circle,
                    status === false ? styles.backgroundSecondary : null,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.title,
                  status === false ? styles.titleSecondary : null,
                ]}>
                {status === false ? 'Offline' : 'Online'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </>
  );
};

export default HeaderRightStatus;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    flexDirection: 'row',
    marginRight: 10,
  },
  indicator: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 15,
    height: 15,
  },
  contentCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 30,
    backgroundColor: Colors.SUCCESS,
  },
  title: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.SUCCESS,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginLeft: 5,
  },
  backgroundSecondary: {
    backgroundColor: Colors.ALERT,
  },
  titleSecondary: {
    color: Colors.ALERT,
  },
});
