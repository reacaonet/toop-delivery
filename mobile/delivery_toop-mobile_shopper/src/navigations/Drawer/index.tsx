/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useState, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, Alert, Platform} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {ReactReduxContext} from 'react-redux';

import {Colors} from '../../styles';
import {cleanUser} from '../../services/userAuth';
import isAuthenticated from '../../services/userAuth';

import CustomIcon from '../../components/shared/CustomIcon';
import packageJson from '../../../package.json';
import {Container, Divider} from './styles';

import Drop from './dropdown';

const confirmExit = (props: any) => {
  exit(props);
};

const exit = async (props: any) => {
  await cleanUser();
  props.onCleanAuth();
  return;
};

/* const goPerfil = (props: any) => {
  // props.navigation.navigate('Customer', {
  //   screen: 'CustomerEdit',
  // });
}; */

const DrawerContent = (props: any) => {
  const [user, setUser]: any = useState({});
  const {store} = React.useContext(ReactReduxContext);
  const userLogged = store.getState()?.authUser;

  useEffect(() => {
    const isUser = async () => {
      const isAuth = await isAuthenticated();
      setUser(isAuth);
    };

    isUser();
  }, [props.userAuth]);

  return (
    <Container>
      <DrawerContentScrollView
        {...props}
        style={styles.drawerContentScrollView}>
        <DrawerItem
          labelStyle={styles.labelProfile}
          icon={() => (
            <CustomIcon name="profile" styles={{width: 15, height: 15}} />
          )}
          label="PERFIL DA LOJA"
          style={styles.itemProfile}
          onPress={() => {}}
        />

        <DrawerItem
          onPress={() => {}}
          labelStyle={styles.label}
          label={() => <Drop />}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="pedidos" />}
          label="Pedidos"
          onPress={() => {
            props.navigation.navigate('Orders');
          }}
          style={styles.item}
        />

        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="entrega" />}
          label="Entrega avulsa"
          onPress={() => {
            props.navigation.navigate('Delivery');
          }}
          style={styles.item}
        />

        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="time" />}
          label="Horário de atendimento"
          onPress={() => {
            props.navigation.navigate('Timer');
          }}
          style={styles.item}
        />

        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="store" />}
          label="Minha loja"
          onPress={() => {
            if (
              userLogged?.user?.company?.more?.shoppingFlow === 'MENU' ||
              userLogged?.user?.company?.shoppingFlow === 'MENU'
            ) {
              props.navigation.navigate('CategoryList');
            } else props.navigation.navigate('Store');
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="financeiro" />}
          label="Financeiro"
          onPress={() => props.navigation.navigate('Rela')}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="rela" />}
          label="Relatórios"
          onPress={() => {
            props.navigation.navigate('Home', {screen: 'Home'});
          }}
          style={styles.item}
        />

        <DrawerItem
          onPress={() => {}}
          labelStyle={styles.label}
          label={`Versão: ${
            Platform.OS === 'ios' ? packageJson.versionIOS : packageJson.version
          }`}
        />
        <Divider />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="exit" />}
          label="Sair"
          onPress={() => exit(props)}
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
  drawerContentScrollView: {
    marginTop: 25,
  },
  drawerContent: {
    flex: 1,
  },
  label: {
    color: Colors.WHITE,
    fontSize: 14,
    marginBottom: 5,
  },

  labelProfile: {
    color: Colors.WHITE,
    fontSize: 12,
    marginBottom: 0,
    marginLeft: -25,
  },

  item: {
    marginTop: 10,
  },
  itemProfile: {
    marginTop: 0,
  },
});
