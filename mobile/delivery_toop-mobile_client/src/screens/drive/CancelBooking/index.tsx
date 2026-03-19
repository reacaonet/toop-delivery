/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useRef } from 'react';
import { Dimensions, FlatList, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/core';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

/** Styles */
import {
  styles,
  Container,
  Title,
  FlatContent,
  Reason,
  ContentMocalCancel,
  BtnContainer,
  BtnNotCancel,
  BtnCancel,
  TitleBtn,
  Header,
  HeaderTitle,
  HeaderViewIcon,
} from './styles';
import { Colors } from '../../../styles';

/** Service */
import { listSupport } from '../../../services/provider/support/listSupport';
import { cancelBooking } from '../../../services/provider/booking/cancel';
import { updateBooking } from '../../../store/actions/booking';

export function CancelBooking() {
  const {
    user: { user = null },
    booking: { booking = null },
  }: any = useSelector((state: any) => state);

  const dispatch = useDispatch<any>();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const modalizeRef = useRef<any>(null);
  const [width, setWidth] = useState(0);
  const [list, setList] = useState<any>([]);
  const [loadCancel, setLoadCancel] = useState(false);
  const itemCurrent = useRef<any>('');

  const widthD = Dimensions.get('window').height * 0.3;

  useFocusEffect(
    useCallback(() => {
      listSupport('PASSENGER', 'CANCEL', user?.franchise).then(result => {
        if (result && Array.isArray(result) && result.length > 0) {
          setList(result);
        } else {
          setList([]);
        }
      });
    }, []),
  );

  const openModal = (reason: any) => {
    itemCurrent.current = reason;

    setWidth(widthD);
    modalizeRef.current?.open();
  };

  const closedModal = () => {
    modalizeRef.current?.close();
    setWidth(0);
  };

  const confirmCancel = async () => {
    setLoadCancel(true);
    const response = await cancelBooking(booking._id, {
      reason: itemCurrent.current?.subject,
      canceledBy: 'passenger',
    });

    if (response && response?.errMessage) {
      setLoadCancel(false);
      return Alert.alert('Cancelamento', response?.errMessage);
    } else if (!response) {
      setLoadCancel(false);
      return;
    }

    dispatch(updateBooking({
      payload: {
        status: 'canceled',
        origin: {},
        destiny: {},
        booking: null,
      },
    }));

    setTimeout(() => {
      navigation.navigate('Home', {
        screen: 'Home',
        params: {},
      });
    }, 2000);
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <Modalize
        ref={modalizeRef}
        alwaysOpen={width}
        modalStyle={styles.modalStyle}
        childrenStyle={styles.modalChildrenStyle}
        overlayStyle={styles.modalOverlay}
        adjustToContentHeight={false}>
        <Title>Deseja Prosseguir com o cancelamento ?</Title>
        <ContentMocalCancel />
        <BtnContainer>
          <BtnNotCancel onPress={() => closedModal()}>
            <TitleBtn>Não cancelar</TitleBtn>
          </BtnNotCancel>
          <BtnCancel disabled={loadCancel} onPress={() => confirmCancel()}>
            {!loadCancel ? (
              <TitleBtn>{t('rideScreen.cancelRace')}</TitleBtn>
            ) : (
              <ActivityIndicator size={'small'} color={Colors.WHITE} />
            )}
          </BtnCancel>
        </BtnContainer>
      </Modalize>
      <Container>
        <Header>
          <HeaderViewIcon
            onPress={() => {
              closedModal();
              navigation.navigate('RideAndTravelStack', {
                screen: 'RaceAccepted',
              });
            }}>
            <Icon name="navigate-before" size={35} color={Colors.PRIMARY} />
          </HeaderViewIcon>
        </Header>

        <Title>Por favor, nos conte o motivo do cancelamento</Title>
        <FlatList
          data={list}
          keyExtractor={item => `${item._id || Math.random()}`}
          contentContainerStyle={styles.flatStyle}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FlatContent onPress={() => openModal(item)}>
              <Reason>{item.subject}</Reason>
            </FlatContent>
          )}
        />
      </Container>
    </>
  );
}

export default CancelBooking;
