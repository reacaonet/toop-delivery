import React from 'react';
import {Alert} from 'react-native';
import database from '@react-native-firebase/database';
import {useDispatch} from 'react-redux';
import {Container, Button, TextButton, ButtonDelete} from './Styles';
import {createLog} from '../../../../../services/service/Log';
import {StorageSet} from '../../../../../services/deviceStorage';
import {isAuthenticated} from '../../../../../services/userAuth';
import {
  updatePersonOne,
  deleteUser,
} from '../../../../../services/service/Person';
import {
  validateEmail,
  replaceSpecialChars,
  formatPhone,
} from '../../../../../utils';
import {
  customerCurrent,
  updateCustomer,
} from '../../../../../services/service/customer';
import {cleanUser} from '../../../../../services/userAuth.js';
import {setUser as setStoreUser} from '../../../../../store/actions/user.js';
import config from '../../../../../config';

const ButtonConfirm = ({
  name,
  email,
  ddi,
  phone,
  setModalLoad,
  navigation,
  personId,
  picture,
}) => {
  const dispatch = useDispatch();
  const edit = async () => {
    setModalLoad(true);

    if (!name) {
      Alert.alert('Nome é obrigatório.');
      setModalLoad(false);
      return;
    }

    if (!email) {
      Alert.alert('E-mail é obrigatório.');
      setModalLoad(false);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Formato de E-mail inválido.');
      setModalLoad(false);
      return;
    }

    if (!ddi) {
      Alert.alert('DDI é obrigatório.');
      setModalLoad(false);
      return;
    }

    if (!phone) {
      Alert.alert('Telefone é obrigatório.');
      setModalLoad(false);
      return;
    }

    let phoneFormated = formatPhone(phone);
    const {user: userAuth} = await isAuthenticated();

    const result = await updatePersonOne(personId, {
      name,
      email,
      ddi: encodeURIComponent(`${ddi}`).trim(),
      phone: `${ddi}${phoneFormated}`,
      status: true,
      image: picture,
    });

    await updateCustomer(userAuth?._id, {
      name,
      email,
      ddi: encodeURIComponent(`${ddi}`).trim(),
      phone: `${ddi}${phoneFormated}`.replace('+', ''),
      status: true,
      image: picture,
    });

    setModalLoad(false);

    if (result === false) {
      Alert.alert('Não foi possível editar perfil');
      return;
    }

    let userResponse = await customerCurrent(userAuth?._id || null);
    await StorageSet('CUSTOMER', {user: userResponse, guest: false});
    return navigation.navigate('Home', {screen: 'Home'});
  };

  const handleDeleteAccount = async () => {
    const {user: userAuth} = await isAuthenticated();
    const response = await deleteUser(userAuth?.person?._id);

    if (response.errMessage) {
      return Alert.alert('Formulário', response.errMessage);
    }
    Alert.alert('Excluir Conta', 'Tem certeza que deseja excluir a conta?', [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Excluir',
        onPress: async () => {
          try {
            database()
              .ref(`${config.FIREBASE_PATH}passenger/${userAuth?._id}`)
              .remove();
            await cleanUser();
            dispatch(setStoreUser(null)); // limpar sessao
            setTimeout(() => {
              return navigation.navigate('Login');
            }, 1000);
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };
  return (
    <Container>
      <Button onPress={() => edit()}>
        <TextButton>Confirmar</TextButton>
      </Button>
      <ButtonDelete onPress={() => handleDeleteAccount()}>
        <TextButton>Excluir Conta</TextButton>
      </ButtonDelete>
    </Container>
  );
};

export default ButtonConfirm;
