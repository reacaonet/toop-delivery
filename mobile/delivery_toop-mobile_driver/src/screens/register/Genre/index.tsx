/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  Container,
  Header,
  MenuButton,
  Content,
  Title,
  List,
  FlatContent,
  FlatName,
  ContentBtn,
  BtnNext,
  BtnTitle,
} from './styles';

/** Service */
import { updatePreRegistration } from '../../../services/provider/preRegistration/update';

/** Components */
import { CustomModal } from '../../../components/Modal/index';

const Genre = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const state: any = useSelector((state: any) => state?.preRegistration);
  const { t } = useTranslation();

  const [list, setList] = useState<any>([]);
  const [select, setSelect] = useState<any | null>(null);
  const [load, setLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      setList([
        {
          _id: '01',
          name: t('screens.genre.male'),
          value: 'H',
        },
        {
          _id: '02',
          name: t('screens.genre.female'),
          value: 'M',
        },
      ]);
    }, []),
  );

  const setSelectItem = (item: any) => {
    setSelect(item);
  };

  const confirm = async () => {
    const id = state?.id;

    setLoad(true);
    const resp = await updatePreRegistration(id, {
      genre: select.value,
    });
    setLoad(false);

    if (resp && resp.errMessage) {
      setMessage(resp.errMessage);
      setShowModal(true);
      return;
    }

    if (state && state.data) {
      state.data.genre = select.value;
    } else {
      state.data = {};
      state.data.genre = select.value;
    }

    dispatch({
      type: 'SET_REGISTRATION',
      payload: {
        ...state,
      },
    });

    navigation.navigate('Register', { screen: 'Region' });
  };

  return (
    <Container>
      <Header>
        <MenuButton
          onPress={() => {
            setMessage(t('screens.genre.message'));
            setShowModal(true);
          }}>
          <Icon name="navigate-before" size={28} color="#000000" />
        </MenuButton>
      </Header>

      <CustomModal
        isVisible={showModal}
        setModalVisible={setShowModal}
        message={message}
      />

      <Content>
        <Title>{t('screens.genre.title')}</Title>
        <List
          data={list}
          keyExtractor={(item: any) => `${item._id || Math.random()}`}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <FlatContent
              onPress={() => setSelectItem(item)}
              select={select && select?._id === item._id}>
              <FlatName>{item.name}</FlatName>
            </FlatContent>
          )}
        />
      </Content>
      <ContentBtn>
        <BtnNext
          select={!select}
          disabled={!select || load}
          onPress={() => confirm()}>
          <BtnTitle>CONFIRMAR</BtnTitle>
        </BtnNext>
      </ContentBtn>
    </Container>
  );
};

export default Genre;
