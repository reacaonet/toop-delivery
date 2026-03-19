/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as colors from '../../styles/colors';
import * as fonts from '../../styles/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import { useTranslation } from 'react-i18next';

import {
  Container,
  TitleMain,
  EvaluationBoxWithStar,
  ContainerInfo,
  TextInfoBold,
  TextFormPayment,
  TextPrice,
  TextBookingPay,
  TitleText,
  Star,
  StarBox,
  DonationButton,
  MoneyIcon,
  CommentsBox,
  FavoriteDriverBox,
  HeaderDriverFavorite,
  ContainerScroll,
  ButtonBox,
  ButtonAfter,
  ButtonEvaluate,
  SpaceBottom,
} from './styles';
import { Colors } from '../../styles';

/** Service */
import { createEvaluation } from '../../services/provider/evaluation/create';
import { ActiverRun } from '../../services/provider/booking/activeRun';

import { formatMoney } from '../../utils';
import config from '../../config';

const EvaluationScreen = () => {
  const navigation = useNavigation<any>();
  const route: any = useRoute<any>();
  const dispatch = useDispatch();

  const {
    authUser: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [isActiveHeart, setIsActiveHeart] = useState(false);
  const [isActiveStar, setIsActiveStar] = useState(0);
  const starsQuant = [1, 2, 3, 4, 5];
  const [description, setDescription] = useState<string | undefined>('');

  // console.log('params', route.params);
  // console.log('user', user);

  const getBooking = () => {
    if (!user?._id) {
      return;
    }

    ActiverRun(user?._id).then((result: any) => {
      setLoad(false);
      if (result && Array.isArray(result) && result.length > 0) {
        dispatch({
          type: 'UPDATE_BOOKING_SAGA',
          payload: {
            status: result[0].status,
            booking: result,
          },
        });
      } else if (result && Array.isArray(result) && result.length === 0) {
        dispatch({
          type: 'CLEAN_BOOKING_SAGA',
        });
      }

      setTimeout(() => {
        navigation.navigate('DriverMap', {});
      }, 500);
    });
  };

  const handleStarRating = (number: number) => {
    setIsActiveStar(number);
  };

  const send = async () => {
    setLoad(true);

    const payload = {
      typeEvaluator: 'driver',
      typeRated: 'passenger',
      idEvaluator: user?._id,
      idRated: route.params?.passenger,
      paymentDriver: route.params?.payment,
      stars: isActiveStar,
      description: description,
    };

    const resp = await createEvaluation(payload);

    if (resp && resp.errMessage) {
      setLoad(false);
      return Alert.alert('Avaliação', resp.errMessage);
    }

    await database().ref(`${config.FIREBASE_PATH}driver/${user?._id}`).remove();
    // navigation.navigate('DriverMap', {});
    getBooking();
  };

  const jump = async () => {
    await database().ref(`${config.FIREBASE_PATH}driver/${user?._id}`).remove();
    getBooking();
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />
      <Container>
        <ContainerScroll>
          <TitleMain style={{ alignSelf: 'center' }}>
            {t('races')} FINALIZADA
          </TitleMain>

          <ContainerInfo>
            <TextFormPayment>
              Pagamento:{' '}
              <TextInfoBold>{route.params?.typePayment}</TextInfoBold>
            </TextFormPayment>
            <TextBookingPay>
              Status:{' '}
              <TextInfoBold>
                {route.params?.paid ? 'Pago' : 'Receber Passageiro'}
              </TextInfoBold>
            </TextBookingPay>
            <TextPrice>
              Valor Viagem:{' '}
              <TextInfoBold>
                {' '}
                {route.params?.showPrice
                  ? formatMoney(route.params?.price, configurations?.coin)
                  : formatMoney(
                    route.params?.priceDriver,
                    configurations?.coin,
                  )}
              </TextInfoBold>
            </TextPrice>

            {route.params?.paid === false ? (
              <>
                <TextPrice>
                  Desconto:{' '}
                  <TextInfoBold>
                    {' - '} {formatMoney(route.params?.priceDiscountVoucher, configurations?.coin)}
                  </TextInfoBold>
                </TextPrice>

                <TextPrice>
                  Saldo Carteira:{' '}
                  <TextInfoBold>
                    {' - '} {formatMoney(route.params?.valueWalletBalance, configurations?.coin)}
                  </TextInfoBold>
                </TextPrice>

                <TextPrice>
                  Total a Pagar:{' '}
                  <TextInfoBold>
                    {' - '} {formatMoney(route.params?.priceToPaid, configurations?.coin)}
                  </TextInfoBold>
                </TextPrice>
              </>
            ) : null}
          </ContainerInfo>

          <EvaluationBoxWithStar>
            <TitleText>Avalie {route.params?.passengerName}</TitleText>
            <StarBox>
              {starsQuant.map(number => (
                <Star key={number}>
                  <Icon
                    name="star"
                    size={30}
                    color={isActiveStar >= number ? '#FFE200' : 'grey'}
                    onPress={() => handleStarRating(number)}
                    light={isActiveStar <= number && true}
                    solid={isActiveStar >= number && true}
                  />
                </Star>
              ))}
            </StarBox>
          </EvaluationBoxWithStar>
          <CommentsBox
            placeholder="Enviar Comentário"
            value={description}
            onChangeText={(value: string) => setDescription(value)}
          />
          <SpaceBottom />
        </ContainerScroll>
      </Container>
      <ButtonBox>
        <ButtonAfter onPress={() => jump()}>
          <TitleMain>Depois</TitleMain>
        </ButtonAfter>

        <ButtonEvaluate onPress={() => send()} enabled={!load}>
          {!load ? (
            <TitleMain style={{ color: colors.WHITE }}>Concluir</TitleMain>
          ) : (
            <ActivityIndicator size={'small'} color={Colors.WHITE} />
          )}
        </ButtonEvaluate>
      </ButtonBox>
    </>
  );
};

export default EvaluationScreen;
