/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useRef } from 'react';
import { Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
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
  Header,
  TitleHeader,
  Title,
  FlatContent,
  Reason,
  ContentMocalCancel,
  BtnContainer,
  BtnNotCancel,
  BtnCancel,
  TitleBtn,
} from './styles';
import { Colors } from '../../styles';

/** Service */
import { listSupport } from '../../services/provider/support/listSupport';
import { cancelBooking } from '../../services/provider/booking/cancel';

export function CacelBooking({ }: any) {
  const {
    authUser: { user = null },
    booking: { booking = null },
  }: any = useSelector((state: any) => state);
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const modalizeRef = useRef<Modalize>(null);
  const [width, setWidth] = useState(0);
  const [list, setList] = useState<any>([]);
  const [loadCancel, setLoadCancel] = useState(false);
  const itemCurrent = useRef<any>('');

  const widthD = Dimensions.get('window').height * 0.3;

  useFocusEffect(
    useCallback(() => {
      listSupport('DRIVER', 'CANCEL', user?.franchise).then(result => {
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
    const response = await cancelBooking(booking[0]._id, {
      reason: itemCurrent.current?.subject,
      canceledBy: 'driver',
    });

    if (response.errMessage) {
      setLoadCancel(false);
      return Alert.alert('Cancelamento', response?.errMessage);
    }

    dispatch({
      type: 'CLEAN_BOOKING_SAGA',
    });

    setTimeout(() => {
      navigation.navigate('DriverMap');
    }, 500);
  };

  return (
    <>
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
              <TitleBtn>Cancelar {t('race')}</TitleBtn>
            ) : (
              <ActivityIndicator size={'small'} color={Colors.WHITE} />
            )}
          </BtnCancel>
        </BtnContainer>
      </Modalize>
      <Container>
        <Header onPress={() => navigation.navigate('DriverMap')}>
          <Icon name="chevron-left" size={42} color={Colors.BLACK} />
          <TitleHeader>Cancelamento</TitleHeader>
        </Header>

        <Title>Por favor, nos conte o motivo do cancelamento</Title>
        <FlatList
          data={list}
          keyExtractor={(item: any) => `${item._id || Math.random()}`}
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

export default CacelBooking;
