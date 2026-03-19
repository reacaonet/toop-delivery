/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as colors from '../../../styles/colors';
import * as fonts from '../../../styles/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  Container,
  TitleMain,
  EvaluationBoxWithStar,
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
  ContainerInfo,
  TextFormPayment,
  TextPrice,
  TextInfoBold,
} from './styles';
import { Colors } from '../../../styles';

import { formatMoney } from '../../../utils';

/** Service */
import { createEvaluation } from '../../../services/provider/evaluation/create';
import { listOneBooking } from '../../../services/provider/booking/list';
import { isFavorite } from '../../../services/provider/driver/isFavorite';
import { favoriteDriver } from '../../../services/provider/driver/favorite';

import config from '../../../config';
import { updateBooking } from '../../../store/actions/booking';

const EvaluationScreen = () => {
  const navigation = useNavigation<any>();
  const route: any = useRoute();
  const dispatch: any = useDispatch();
  const { t } = useTranslation();

  const {
    user: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const [load, setLoad] = useState(false);
  const [isActiveHeart, setIsActiveHeart] = useState(false);
  const [isActiveStar, setIsActiveStar] = useState(0);
  const starsQuant = [1, 2, 3, 4, 5];
  const [description, setDescription] = useState<string | undefined>('');
  const [booking, setBooking] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.booking && user.passenger?._id) {
        listOneBooking(route.params?.booking).then(current => {
          setBooking(current);
          isFavorite(current.driver?._id, user?.passenger?._id).then(result => {
            if (result && result?._id) {
              setIsActiveHeart(true);
            } else {
              setIsActiveHeart(false);
            }
          });
        });
      }
    }, [route.params?.booking, user.passenger?._id]),
  );

  function handleStarRating(number: number) {
    setIsActiveStar(number);
  }

  const send = async () => {
    setLoad(true);

    await await database()
      .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
      .remove();

    const current = await listOneBooking(route.params?.booking);

    if (!current || !current?.driver) {
      return Alert.alert('Avaliação', 'Motorista não encontrado');
    }

    const payload = {
      typeEvaluator: 'passenger',
      typeRated: 'driver',
      idEvaluator: user?.passenger?._id,
      idRated: current.driver?._id,
      paymentDriver: current?.payment?._id || current?.payment,
      stars: isActiveStar,
      description: description,
    };

    const resp = await createEvaluation(payload);
    setLoad(false);

    if (resp && resp.errMessage) {
      return Alert.alert('Avaliação', resp.errMessage);
    }

    dispatch(updateBooking({
      payload: {
        status: 'create_request',
        booking: null,
      },
    }));

    setTimeout(() => {
      navigation.navigate('Home', { screen: 'Home' });
    }, 500);
  };

  const jump = async () => {
    await await database()
      .ref(`${config.FIREBASE_PATH}passenger/${user?.passenger?._id}`)
      .remove();

    dispatch(updateBooking({
      payload: {
        status: 'create_request',
        booking: null,
      },
    }));

    navigation.navigate('Home', {
      screen: 'Home',
    });
  };

  const sendFavorite = async () => {
    const current = await listOneBooking(route.params?.booking);
    if (!current || !current?.driver) {
      return Alert.alert('Avaliação', 'Motorista não encontrado');
    }

    await favoriteDriver(current.driver?._id, user?.passenger?._id);
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
          <TitleMain style={{ alignSelf: 'center' }}>VIAGEM FINALIZADA</TitleMain>

          <ContainerInfo>
            <TextFormPayment>
              Pagamento:{' '}
              <TextInfoBold>{booking?.payment?.typePaymentTxt}</TextInfoBold>
            </TextFormPayment>

            {/* {booking?.payment?.priceDiscountVoucher && booking?.payment?.priceDiscountVoucher > 0 ? (
              <>
                <TextPrice>
                  Total:{' '}
                  <TextInfoBold>
                    {' - '}
                    {formatMoney(booking?.price, configurations?.coin)}
                  </TextInfoBold>
                </TextPrice>
                <TextPrice>
                  Desconto:{' '}
                  <TextInfoBold>
                    {' - '}
                    {formatMoney(booking?.payment?.priceDiscountVoucher, configurations?.coin)}
                  </TextInfoBold>
                </TextPrice>
              </>
            ) : null} */}

            <TextPrice>
              Valor Viagem:{' '}
              <TextInfoBold>
                {' '}
                {booking?.pricePassenger
                  ? formatMoney(booking?.pricePassenger, configurations?.coin)
                  : formatMoney(
                    booking?.price,
                    configurations?.coin,
                  )}
              </TextInfoBold>
            </TextPrice>
          </ContainerInfo>

          <EvaluationBoxWithStar>
            <TitleText>Avalie nosso serviço!</TitleText>
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
          {/* <DonationButton>
            <TitleText style={{ color: colors.WHITE }}>Doar gorjeta</TitleText>
            <MoneyIcon>
              <TitleText
                style={{
                  color: colors.WHITE,
                  fontFamily: fonts.FONT_FAMILY_BLACK,
                }}>
                $
              </TitleText>
            </MoneyIcon>
          </DonationButton> */}
          <CommentsBox
            placeholder="Enviar Comentário"
            value={description}
            onChangeText={(value: string) => setDescription(value)}
          />
          <FavoriteDriverBox>
            <HeaderDriverFavorite>
              <TitleText>Favoritar motorista</TitleText>
              <Icon
                name="heart"
                size={30}
                color={colors.BLACK}
                onPress={() => {
                  sendFavorite();
                  setIsActiveHeart(!isActiveHeart);
                }}
                light={isActiveHeart}
                solid={isActiveHeart}
              />
            </HeaderDriverFavorite>
            <TitleText style={{ fontSize: 12, marginTop: 14 }}>
              Favoritos terão preferência em agendamentos e em {t('races')} caso
              esteja na área de atendimento
            </TitleText>
          </FavoriteDriverBox>
          <SpaceBottom />
        </ContainerScroll>
      </Container>
      <ButtonBox>
        <ButtonAfter onPress={() => jump()}>
          <TitleMain>Depois</TitleMain>
        </ButtonAfter>
        <ButtonEvaluate onPress={() => send()} enabled={!load}>
          {!load ? (
            <TitleMain style={{ color: colors.WHITE }}>Avaliar</TitleMain>
          ) : (
            <ActivityIndicator size={'small'} color={Colors.WHITE} />
          )}
        </ButtonEvaluate>
      </ButtonBox>
    </>
  );
};

export default EvaluationScreen;
