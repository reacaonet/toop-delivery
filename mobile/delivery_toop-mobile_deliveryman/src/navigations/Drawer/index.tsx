/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useState, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Colors} from '../../styles';
import {cleanUser} from '../../services/userAuth';
import isAuthenticated from '../../services/userAuth';
import userAvatar from '../../assets/images/user_default-2.jpg';
import CustomIcon from '../../components/shared/CustomIcon';
import packageJson from '../../../package.json';
import {
  DrawerHeaderWrapper,
  DrawerHeaderAvatar,
  Container,
  DrawerHeaderTextWrapper,
  Divider,
  AvatarName,
} from './styles';
import {
  listOne,
  updateDeliveryMan,
  updateDeliveryStatusOffline,
} from '../../services/provider/deliveryMan';

import {removeBackground} from '../../services/location/backgroundGeolocation';

const changeStatus = async () => {
  const user = await isAuthenticated();

  if (user && user.deliveryMan && user.deliveryMan._id) {
    let response = await listOne(user?.deliveryMan?._id);

    if (!response || !response._id) {
      Alert.alert(
        'Oops',
        'Não conseguimos verificar o status, verifique a conexão com a Internet',
      );
      return;
    }

    if (response.isOnline === false) {
      return;
    }

    await updateDeliveryMan(response._id, {
      isOnline: false,
    });

    await updateDeliveryStatusOffline(user.deliveryMan._id);
  } else {
    Alert.alert('Oops', 'Não conseguimos identificar o usuário...');
  }
};

const confirmExit = (props: any) => {
  Alert.alert(
    'Atenção!',
    'Você vai ficar Offline. Quer mesmo continuar?',
    [
      {
        text: 'Cancelar',
        onPress: () => {
          return;
        },
        style: 'cancel',
      },
      {text: 'Sim', onPress: () => exit(props)},
      ,
    ],
    {cancelable: false},
  );
};

const exit = async (props: any) => {
  await changeStatus();
  await cleanUser();
  props.onCleanAuth();
  removeBackground();
  return;
};

const goPerfil = (props: any) => {
  // props.navigation.navigate('Customer', {
  //   screen: 'CustomerEdit',
  // });
};

const DrawerContent = (props: any) => {
  const [user, setUser]: any = useState({});

  useEffect(() => {
    const isUser = async () => {
      const isAuth = await isAuthenticated();
      setUser(isAuth);
    };

    isUser();
  }, []);

  return (
    <Container colors={['#e5f2f8', '#fefefe']}>
      <DrawerHeaderWrapper>
        <TouchableOpacity onPress={() => goPerfil(props)}>
          <DrawerHeaderAvatar source={userAvatar} />
        </TouchableOpacity>
        <DrawerHeaderTextWrapper>
          <AvatarName numberOfLines={1}>
            {user && user.person && user.person.name ? user.person.name : ''}
          </AvatarName>
          {/* <AvatarLocation>R. 27 Qd: 14 Conj: Hélio III</AvatarLocation> */}
        </DrawerHeaderTextWrapper>
      </DrawerHeaderWrapper>
      <DrawerContentScrollView {...props} style={{marginTop: 50}}>
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="home" />}
          label="Home"
          onPress={() => {
            props.navigation.navigate('Home', {screen: 'Home'});
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="creditCard" />}
          label="Ganhos"
          onPress={() => {
            props.navigation.navigate('History', {screen: 'History'});
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          label={`Versão: ${packageJson.version}`}
          onPress={() => {}}
        />
        <Divider />
        {/* <MenuCategory>Meus Dados</MenuCategory>
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="user" />}
          label="Meu Perfil"
          onPress={() => null}
        />
        <Divider />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="clientSupport" />}
          label="Fale conosco"
          onPress={() => null}
        />
        <Divider /> */}
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="exit" />}
          label="Sair"
          onPress={() => confirmExit(props)}
        />
      </DrawerContentScrollView>
    </Container>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  label: {
    color: Colors.PRIMARY_DARK,
    fontSize: 16,
  },
  item: {
    marginBottom: -8,
  },
});
