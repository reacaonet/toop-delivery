import React, { useRef, useState, useCallback } from 'react';
import { Dimensions, Alert, ActivityIndicator } from 'react-native';
import * as Progress from 'react-native-progress';
import { Modalize } from 'react-native-modalize';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import {
  styles,
  Container,
  TouchConfirm,
  ConfirmTitle,
  Title,
  TextTime,
  ContentAddress,
  AddressItem,
  MarkerAddress,
  AddressText,
  DividerAddress,
  ModalizeContainer,
  TextExplicative,
  TextExplicative2,
  BtnContainer,
  BtnWait,
  TextWait,
  BtnCancel,
  TextCancel,
  BtnCancelLinear,
  Space,
} from './styles';
import { Colors } from '../../../../../styles';
import { getRideMinutes } from '../../../../../utils';

/** Service */
import { cancelBooking } from '../../../../../services/provider/booking/cancel';
import { StorageGet, StorageSet } from '../../../../../services/deviceStorage';
import { updateBooking } from '../../../../../store/actions/booking';

const WaitingRide = ({ booking }: any) => {
  const dispatch: any = useDispatch();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const modalizeRef = useRef<any>(Modalize);
  const time = useRef<number>(booking?.booking?.time || 0);
  const [minutes, setMinutes] = useState<any>(null);
  const initInterval = useRef<any>(null);
  const [load, setLoad] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!initInterval.current) {
        StorageGet('@waitingDriver').then(resp => {
          let dataCurrent: any = moment().utc(false).format();

          if (!resp || resp === null) {
            StorageSet('@waitingDriver', dataCurrent);
          } else {
            dataCurrent = resp;
          }

          dataCurrent = moment(dataCurrent).utc(false);

          initInterval.current = setInterval(() => {
            let diff = moment.utc(moment().diff(moment(dataCurrent)));

            let minutes: number = Number(diff.format('mm'));
            let seconds: number = Number(diff.format('ss'));

            time.current += 1;
            setMinutes(
              `${`${minutes}`.padStart(2, '0')}: ${`${seconds}`.padStart(
                2,
                '0',
              )}`,
            );
          }, 1000);
        });
      }

      return () => {
        if (initInterval.current) {
          clearInterval(initInterval.current);
          initInterval.current = null;
        }
      };
    }, []),
  );

  const openModal = () => {
    modalizeRef.current?.open();
  };

  const closedModal = () => {
    modalizeRef.current?.close();
  };

  const getOrigen = () => {
    try {
      return booking?.booking?.origin?.address;
    } catch (err) {
      return ' - ';
    }
  };

  const getDestiny = () => {
    try {
      return booking?.booking?.destiny?.[0].address;
    } catch (err) {
      return ' - ';
    }
  };

  const cancelRide = async () => {
    if (!booking || !booking?.booking || !booking?.booking?._id) {
      return Alert.alert('Solicitação', 'Solicitação não encontrada');
    }

    setLoad(true);
    const response = await cancelBooking(booking?.booking?._id, {});
    setLoad(false);

    if (response.errMessage) {
      return Alert.alert('Solicitação', response?.errMessage);
    }

    dispatch(
      updateBooking({
        payload: {
          status: 'canceled',
          origin: {},
          destiny: {},
          booking: null,
        },
      }),
    );

    console.log('cancelando solicitação');
    navigation.navigate('Home', { screen: 'Home' });
  };

  return (
    <>
      <Modalize
        ref={modalizeRef}
        modalStyle={styles.modalStyles}
        adjustToContentHeight={true}>
        <ModalizeContainer>
          <TextExplicative>{t('rideScreen.cancelTitle')}</TextExplicative>
          <TextExplicative2>
            {t('rideScreen.cancelExplication')}
          </TextExplicative2>

          <BtnContainer>
            <BtnWait onPress={() => closedModal()}>
              <TextWait>Esperar</TextWait>
            </BtnWait>

            <BtnCancel onPress={() => cancelRide()} disabled={load}>
              <BtnCancelLinear colors={Colors.GRADIENTE_PRIMARY}>
                <TextCancel>
                  {!load ? (
                    t('rideScreen.cancelRace')
                  ) : (
                    <ActivityIndicator size={'small'} color={Colors.WHITE} />
                  )}
                </TextCancel>
              </BtnCancelLinear>
            </BtnCancel>
          </BtnContainer>
          <Space />
        </ModalizeContainer>
      </Modalize>

      <Container contentContainerStyle={styles.scrollStyle}>
        <Title>{t('rideScreen.lookingForDrivers')}</Title>
        {minutes ? <TextTime>{minutes}</TextTime> : null}

        <ContentAddress>
          <AddressItem>
            <MarkerAddress />
            <AddressText numberOfLines={1}>{getOrigen()}</AddressText>
          </AddressItem>

          <DividerAddress />

          <AddressItem>
            <MarkerAddress />
            <AddressText numberOfLines={1}>{getDestiny()}</AddressText>
          </AddressItem>
        </ContentAddress>

        <TouchConfirm onPress={() => openModal()}>
          <ConfirmTitle>{t('rideScreen.cancelRace')}</ConfirmTitle>
        </TouchConfirm>

        <Progress.Bar
          indeterminate={true}
          style={styles.progressBar}
          color={Colors.BLACK}
          width={Dimensions.get('window').width - 20}
          useNativeDriver={true}
          animationType={'spring'}
        />
      </Container>
    </>
  );
};

export default WaitingRide;
