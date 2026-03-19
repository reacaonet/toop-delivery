/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Map from '../../../components/Map';
import { Colors } from '../../../styles';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/core';
import { useSelector, useDispatch } from 'react-redux';
import { decode } from '@googlemaps/polyline-codec';
import { useTranslation } from 'react-i18next';

import {
  CompanyIcon,
  PersonIcon,
  // ProfileIcon,
  WalletIcon,
  CollaboratorIcon,
} from '../../../components/Icon';

import carEconomyImg from '../../../assets/images/car-economy.png';

/** Styles */
import styles from './styles';

/** Service */
import { listPaymentMethod } from '../../../services/service/shopping/paymentMethod/list';
import { updateBooking } from '../../../store/actions/booking';

/** Util */
import { formatMoney, maskRealBeautify } from '../../../utils';
import moneyIcon from '../../../assets/images/din.png';
import pixIcon from '../../../assets/images/pix_logo.png';

/** Images */
import imageOrigin from '../../../assets/images/map/origin.png';
import imageDestiny from '../../../assets/images/map/destiny.png';

import { StorageGet } from '../../../services/deviceStorage';
import { getBalance } from '../../../services/provider/wallet/balance';

import config from '../../../config';


const ConfirmRide = () => {
  const { t } = useTranslation();

  const dispatch: any = useDispatch();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const {
    booking,
    user: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const [showCompany, setShowCompany] = useState(false);
  const [selectService] = useState(route.params?.selectService || {});
  const [isEnabled, setIsEnabled] = useState(false);
  const [payment] = useState(route.params?.payment || null);
  const [methodCurrent, setMethodCurrent] = useState<any>(null);
  const [qrCode] = useState(route.params?.qrCode || '');
  const [driver] = useState(route.params?.driver || '');

  const [useWalletBallance, setUseWalletBallance] = useState(false);
  const [walletBallance, setWalletBallance] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (payment === null && user?.passenger?._id) {
        listPaymentMethod(user?._id).then(result => {
          if (result && Array.isArray(result) && result.length > 0) {
            let method = result.filter(c => c.isMain === true)[0];
            method.type = 'credicard';
            setMethodCurrent(method);
          } else {
            setMethodCurrent({
              type: 'money',
            });
          }
        });
      } else if (payment) {
        setMethodCurrent(payment);
      }
    }, [user?.passenger?._id, payment]),
  );

  const toggleSwitch = () => {
    setUseWalletBallance(!useWalletBallance);
  };

  const toggleShowCompany = () => {
    setShowCompany(!showCompany);
  };

  const onPressNext = () => {
    dispatch(
      updateBooking({
        payload: {
          status: 'ready_to_ship',
        },
      }),
    );

    navigation.navigate('Ride', {
      chosenOrigin: route.params.chosenOrigin,
      chosenDestination: route.params.chosenDestination,
      additionalStops: route.params.additionalStops,
      selectService: selectService,
      payment: methodCurrent,
      qrCode,
      driver,
      useWalletBalance: useWalletBallance,
    });
  };

  const changePayment = () => {
    navigation.navigate('Shopping', {
      screen: 'PaymentMethods',
      params: {
        confirmRide: true,
        payload: {
          chosenOrigin: route.params.chosenOrigin,
          chosenDestination: route.params.chosenDestination,
          additionalStops: route.params.additionalStops,
          selectService: selectService,
          qrCode,
          driver,
        },
      },
    });
  };

  const loadBalance = async () => {
    getBalance({ customer: user?._id, passenger: user?.passenger?._id, franchise: user.franchise })
      .then(response => {
        if (response.errMessage)
          setWalletBallance(0);
        else if (response.balance <= 0) {
          setUseWalletBallance(false);
          setWalletBallance(0);
        } else {
          setWalletBallance(response.balance);
        }
      })
      .catch(error => console.log(error));
  };

  React.useEffect(() => {
    loadBalance();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        <Map
          chosenOrigin={route.params.chosenOrigin}
          chosenDestination={route.params.chosenDestination}
          additionalStops={route.params.additionalStops}
          imageOrigin={imageOrigin}
          imageDestiny={imageDestiny}
          overviewPolyline={
            route.params?.selectService?.overviewPolyline?.points
              ? decode(
                route.params?.selectService?.overviewPolyline?.points,
              ).map(item => {
                return {
                  latitude: item[0],
                  longitude: item[1],
                };
              })
              : null
          }
        />
      </View>

      <View style={styles.rideInfo}>
        <View style={styles.rideView}>
          {booking?.service?.price ? (
            <>
              {booking?.service?.voucher?.priceWithVoucher ? (
                <Text style={styles.price}>
                  {formatMoney(booking?.service?.voucher?.priceWithVoucher, configurations?.coin)}
                </Text>
              ) : (
                <Text style={styles.price}>
                  {formatMoney(booking?.service?.price, configurations?.coin)}
                </Text>
              )}
            </>
          ) : null}
          <Text style={styles.ride}>{booking?.service?.name}</Text>
          <Text style={styles.duration}>{booking?.service?.routeTime}</Text>
          {selectService && selectService?.onlyForWomen === true ? (
            <Text style={styles.duration}>
              {t('confirmRideScreen.textWomenService')}
            </Text>
          ) : null}
        </View>

        {selectService?.images &&
          Array.isArray(selectService?.images) &&
          selectService?.images.length ? (
          <Image
            source={{
              uri: selectService?.images[0],
            }}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
        ) : (
          <Image source={carEconomyImg} />
        )}
      </View>

      <Divider />

      {showCompany ? (
        <TouchableWithoutFeedback onPress={toggleShowCompany}>
          <View style={styles.companyContainer}>
            <View style={styles.company}>
              <CompanyIcon width={22} height={22} color={Colors.GREY} />

              <View style={styles.companyInfo}>
                <Text style={styles.name}>Supra Veículos</Text>
                <Text style={styles.description}>
                  Perfil empresarial - 100%
                </Text>
              </View>

              <View style={styles.buttons}>
                <View style={[styles.deselected, styles.button, styles.left]}>
                  <PersonIcon width={14} height={14} color={Colors.PRIMARY} />
                </View>
                <View style={[styles.selected, styles.button, styles.right]}>
                  <CompanyIcon width={14} height={14} color={Colors.WHITE} />
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <View style={styles.companyContainer}>
          <ScrollView>
            {/* <TouchableWithoutFeedback onPress={toggleShowCompany}>
              <View style={styles.company}>
                <ProfileIcon width={22} height={22} color={Colors.GREY} />

                <View style={styles.companyInfo}>
                  <Text style={styles.name}>George Souza</Text>
                  <Text style={styles.description}>Perfil particular</Text>
                </View>

                <View style={styles.buttons}>
                  <View style={[styles.selected, styles.button, styles.left]}>
                    <PersonIcon width={14} height={14} color={Colors.WHITE} />
                  </View>
                  <View
                    style={[styles.deselected, styles.button, styles.right]}>
                    <CompanyIcon
                      width={14}
                      height={14}
                      color={Colors.PRIMARY}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback> */}

            {/* <Divider /> */}

            {methodCurrent && methodCurrent?.type === 'credicard' ? (
              <TouchableWithoutFeedback>
                <View style={styles.paymentMethod}>
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={32}
                  />
                  <Text style={styles.creditCardNumber}>
                    {`${methodCurrent?.cartNumber}`.slice(-8)} - Crédito
                  </Text>
                  <TouchableOpacity onPress={() => changePayment()}>
                    <Text style={styles.changeText}>Trocar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            ) : null}

            {methodCurrent && methodCurrent?.type === 'money' ? (
              <TouchableWithoutFeedback>
                <View style={styles.paymentMethod}>
                  {/* <MaterialCommunityIcons name="money" size={32} /> */}
                  <Image source={moneyIcon} style={styles.moneyIcon} />
                  <Text style={styles.creditCardNumber}>Dinheiro</Text>
                  <TouchableOpacity onPress={() => changePayment()}>
                    <Text style={styles.changeText}>Trocar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            ) : null}

            {methodCurrent && methodCurrent?.type === 'pix' ? (
              <TouchableWithoutFeedback>
                <View style={styles.paymentMethod}>
                  {/* <MaterialCommunityIcons name="money" size={32} /> */}
                  <Image
                    source={pixIcon}
                    style={styles.moneyIcon}
                    resizeMode={'contain'}
                  />
                  <Text style={styles.creditCardNumber}>PIX</Text>
                  <TouchableOpacity onPress={() => changePayment()}>
                    <Text style={styles.changeText}>Trocar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            ) : null}
          </ScrollView>
        </View>
      )}

      <View style={styles.useWalletBallanceContainer}>
        {showCompany ? (
          <View style={styles.collaboratorField}>
            <CollaboratorIcon width={22} height={22} color={Colors.GREY} />
            <Text style={styles.collaboratorLabel}>Colaborador</Text>
            <Text style={styles.collaboratorName}>George Souza</Text>
          </View>
        ) : (
          <>
            <WalletIcon
              width={22}
              height={22}
              color={useWalletBallance ? Colors.SECONDARY : Colors.GREY}
            />
            <Text
              style={[
                styles.walletBallance,
                { color: useWalletBallance ? Colors.SECONDARY : Colors.GREY },
              ]}>
              {maskRealBeautify(walletBallance, true, configurations?.coin)} {useWalletBallance}
            </Text>
            <TouchableWithoutFeedback
              onPress={() => setUseWalletBallance(!useWalletBallance)}
              hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    marginRight: 10,
                    color: useWalletBallance ? Colors.GREY : Colors.SECONDARY,
                  }}>
                  Usar crédito
                </Text>

                <Switch
                  trackColor={{
                    false: Colors.GRAY_MEDIUM,
                    true: Colors.PRIMARY_LIGHT,
                  }}
                  thumbColor={isEnabled ? Colors.PRIMARY : Colors.GRAY_DARK}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={useWalletBallance}
                />
              </View>
            </TouchableWithoutFeedback>
          </>
        )}
      </View>

      {booking?.service?.price ? (
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            onPress={() => onPressNext()}
            style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>{t('confirmRace')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default ConfirmRide;

const Divider = () => (
  <View
    style={{
      height: 1,
      backgroundColor: Colors.GREY,
      marginHorizontal: 20,
    }}
  />
);
