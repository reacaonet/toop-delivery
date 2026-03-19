/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProgressCircle from 'react-native-progress-circle';
import LootieView from 'lottie-react-native';

import MapContent from './mapContent';
import styles from './styles';
import { Colors } from '../../../../styles';
import { formatMoney } from '../../../../utils';

/** Service */
import { stopSound } from '../../../../services/TrackPlayer/soundNotification';

interface NewOrderProps {
  acceptOrderDelivery: any;
  rejectOrderDelivery: any;
  closeModal: Function;
  distanceOrder: any;
}

const NewOrder: React.FC<NewOrderProps> = ({
  closeModal,
  acceptOrderDelivery,
  rejectOrderDelivery,
  distanceOrder,
}) => {
  const pan: any = useRef(new Animated.ValueXY()).current;
  const [width] = useState(Dimensions.get('window').width);
  const [acept, setAcept] = useState(false);
  const logo = require('../../../../assets/images/logo_splash.png');
  const [timePercent, setTimePercent] = useState({
    time: distanceOrder.count,
    percent: 0,
  });

  useEffect(() => {
    return () => {
      closeModal(false);
    };
  }, []);

  useEffect(() => {
    // console.log('Reset Time');
    setTimePercent({
      time: distanceOrder.count,
      percent: 0,
    });
  }, [distanceOrder.count]);

  useEffect(() => {
    let countDown: any;
    if (timePercent.time > 0) {
      countDown = setTimeout(() => {
        try {
          let div = 100 / distanceOrder.count;
          setTimePercent({
            time: timePercent.time - 1,
            percent: timePercent.percent + div,
          });
        } catch (err) { }
      }, 1000);
    } else if (distanceOrder.loading === false && timePercent.time <= 0) {
      clearTimeout(countDown);
      closeModal(false);
    }

    return () => {
      // console.log('Limpando contador ...');
      clearTimeout(countDown);
    };
  }, [timePercent, distanceOrder]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      let limit = width / 2;
      limit = limit - width * 0.15;
      let limitNegative = Math.abs(limit) * -1;
      let x: number = pan.x._value;

      if (x > 0 && x > limit) {
        confirmAcept();
      } else if (x < 0 && x < limitNegative) {
        stopSound();
        rejectOrderDelivery();
        closeModal(false);
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const confirmAcept = () => {
    try {
      stopSound();
      setAcept(true);
      acceptOrderDelivery(distanceOrder.order);
    } catch (err) {
      //
    }
  };

  return (
    <View style={styles.container}>
      {distanceOrder && distanceOrder.loading === true ? (
        <View style={styles.containerLoading}>
          <LootieView
            source={require('../../../../assets/animations/loading.json')}
            resizeMode="cover"
            loop
            autoPlay
          />
          <Text style={styles.txtLoading}>Carregando ...</Text>
        </View>
      ) : null}

      {distanceOrder &&
        distanceOrder.loading === false &&
        distanceOrder.count &&
        distanceOrder.count > 0 &&
        distanceOrder.order ? (
        <>
          <MapContent
            order={distanceOrder.order}
            deliveryCoord={distanceOrder?.deliveryCoord}
          />

          <View style={styles.containerOptions}>
            {acept === false ? (
              <>
                <View style={styles.contentText}>
                  {distanceOrder?.raceValue && distanceOrder?.raceValue > 0 ? (
                    <Text style={styles.titleContentText}>
                      {formatMoney(distanceOrder?.raceValue)}
                    </Text>
                  ) : null}
                  <Text style={styles.titleContentText}>
                    {distanceOrder?.total}
                  </Text>
                </View>

                <View style={styles.contentConfirm}>
                  <View style={styles.contentClose}>
                    <Icon name={'close'} size={35} color={Colors.ALERT} />
                  </View>

                  <View style={styles.contentAcept}>
                    <Icon name={'done'} size={35} color={Colors.SUCCESS} />
                  </View>
                </View>

                <View style={styles.btnAbsolute}>
                  <Animated.View
                    style={[pan.getLayout(), styles.buttonConfirm]}
                    {...panResponder.panHandlers}>
                    <ProgressCircle
                      percent={timePercent.percent}
                      radius={45}
                      borderWidth={6}
                      color={Colors.PRIMARY}
                      shadowColor="#999"
                      bgColor="#fff">
                      <ImageBackground
                        source={logo}
                        style={styles.logoStyle}
                        resizeMode="contain"
                      />
                    </ProgressCircle>
                  </Animated.View>
                </View>
              </>
            ) : (
              <View style={styles.contentBtnInfoSuccess}>
                <TouchableOpacity style={styles.btnInfoSuccess}>
                  <Text style={styles.btnText}>Corrida Aceita</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      ) : null}
    </View>
  );
};

export default React.memo(NewOrder);
