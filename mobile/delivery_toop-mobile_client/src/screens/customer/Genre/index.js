/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

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
import {updatePersonOne} from '../../../services/service/Person/update';
import {setUser} from '../../../store/actions/user';

const Genre = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const {
    user: {user = null},
  } = useSelector(state => state);

  const [list, setList] = useState([]);
  const [select, setSelect] = useState(null);
  const [load, setLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      setList([
        {
          _id: '01',
          name: t('genre.male'),
          value: 'H',
        },
        {
          _id: '02',
          name: t('genre.female'),
          value: 'M',
        },
      ]);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (user && user.person && user.person.genre) {
        return navigation.navigate('Terms', {
          screen: 'Terms',
        });
      }
    }, [user]),
  );

  const setSelectItem = item => {
    setSelect(item);
  };

  const confirm = async () => {
    setLoad(true);
    const resp = await updatePersonOne(user?.person?._id, {
      genre: select.value,
    });

    if (resp && resp.errMessage) {
      return Alert.alert('Formulário', resp.errMessage);
    }

    if (user?.person?._id) {
      user.person.genre = select.value;
    }

    dispatch(setUser({user: user}));

    return navigation.navigate('Terms', {
      screen: 'Terms',
    });
  };

  return (
    <Container>
      <Header>
        <MenuButton
          onPress={() => {
            // setMessage('Selecione um gênero');
            // setShowModal(true);
          }}>
          <Icon name="navigate-before" size={28} color="#000000" />
        </MenuButton>
      </Header>

      <Content>
        <Title>{t('genre.title')}</Title>
        <List
          data={list}
          keyExtractor={item => `${item._id || Math.random()}`}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
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
