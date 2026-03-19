/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Colors, Typography} from '../../styles';
import {cleanUser} from '../../services/userAuth';
import userAvatar from '../../assets/images/user-default-2.jpg';
import CustomIcon from '../../components/shared/CustomIcon';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNetInfo} from '@react-native-community/netinfo';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import database from '@react-native-firebase/database';

// import database from '@react-native-firebase/database';
// import {getUniqueId} from 'react-native-device-info';
// import pushNotification from 'react-native-push-notification';
// import PushNotificationIOS from '@react-native-community/push-notification-ios';
import packageJson from '../../../package.json';
import {
  DrawerHeaderWrapper,
  DrawerHeaderAvatar,
  Container,
  AvatarName,
  DrawerHeaderTextWrapper,
  Divider,
  MenuCategory,
} from './styles';
import config from '../../config';

/** Service */
import {
  bookingAccepted,
  bookingInProgress,
  bookingConcluded,
} from '../../services/provider/booking/firebaseBooking';
import {setUser as setStoreUser} from '../../store/actions/user';

export function DrawerContent(props) {
  const dispatch = useDispatch();
  const {booking} = useSelector(state => state);
  const navigation = props.navigation;

  const address = props.address;
  const guest = props.guest;
  const [user, setUser] = useState({});
  const netInfo = useNetInfo();

  useEffect(() => {
    if (user && user?.passenger && user?.passenger?._id) {
      if (booking && booking?.status === 'waiting') {
        return navigation.navigate('RideAndTravelStack', {
          screen: 'Ride',
        });
      } else if (
        booking &&
        (booking?.status === 'accepted' || booking?.status === 'in_progress')
      ) {
        navigation.navigate('RideAndTravelStack', {
          screen: 'RaceAccepted',
        });
      } else if (user && booking && booking?.status === 'canceled') {
        console.log('solicitação cancelada ...');
        navigation.navigate('Home');
      }
    }
  }, [booking?.status, user?.passenger?._id]);

  // Corrida Aceita
  useEffect(() => {
    if (!navigation?.navigate) {
      return;
    }

    if (user && user.passenger && user?.passenger?._id) {
      database()
        .ref(`${config.FIREBASE_PATH}passenger/${user.passenger._id}`)
        .on('value', async snapshot => {
          const notify = snapshot.val();

          if (notify?.type === 'race-accepted' && notify?.booking) {
            bookingAccepted(user, dispatch, navigation);
          } else if (notify?.type === 'race_inprogres' && notify?.booking) {
            bookingInProgress(user, dispatch, navigation);
          } else if (notify?.type === 'race_concluded' && notify?.booking) {
            bookingConcluded(user, dispatch, navigation, notify);
          }
        });
    }
  }, [navigation?.navigate, user?.passenger?._id]);

  useEffect(() => {
    if (props.userAuth) {
      setUser(props.userAuth);
    }
  }, [props.userAuth]);

  const exitUser = async () => {
    await cleanUser();
    props.onUserAuth();
  };

  const screenLocation = () => {
    props.navigation.navigate('Customer', {
      screen: 'CustomerAddress',
    });
  };

  const goPerfil = () => {
    if (!guest || guest !== true) {
      props.navigation.navigate('Customer', {
        screen: 'CustomerEdit',
      });
    }
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Estou te indicando o aplicativo ToopDelivery para economizar sem sair de casa!
          Android: https://play.google.com/store/apps/details?id=br.com.toopdelivery.cliente&hl=pt_BR
          IOS: https://apps.apple.com/br/app/toop-delivery/id1560718286
          `,
        title: 'ToopDelivery',
        url: 'https://apps.apple.com/br/app/toop-delivery/id1560718286',
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <Container colors={['#e5f2f8', '#fefefe']}>
      <DrawerHeaderWrapper>
        <TouchableOpacity onPress={() => goPerfil()}>
          {user && user.person && user.person.image ? (
            <DrawerHeaderAvatar
              source={{uri: user.person.image}}
              resizeMode="cover"
            />
          ) : (
            <DrawerHeaderAvatar source={userAvatar} resizeMode="cover" />
          )}
        </TouchableOpacity>
        <DrawerHeaderTextWrapper>
          <AvatarName numberOfLines={1}>
            {guest && guest === true ? 'Convidado' : ''}
            {user && user.person && user.person.name ? user.person.name : ''}
          </AvatarName>
          {!guest || guest !== true ? (
            <TouchableOpacity
              onPress={() => screenLocation()}
              style={styles.touchableStyle}>
              <View style={styles.iconContainer}>
                <Icon name="gps-fixed" size={16} color={Colors.PRIMARY} />
              </View>
              <Text
                style={styles.txtAddres}
                allowFontScaling={false}
                numberOfLines={1}>
                {address}
              </Text>
            </TouchableOpacity>
          ) : null}
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
        {/* <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="home" />}
          label="Mensagens"
          onPress={() => {
            props.navigation.navigate('Message', {screen: 'Message'});
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="home" />}
          label="Corridas"
          onPress={() => {
            props.navigation.navigate('Run', {screen: 'Run'});
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="home" />}
          label="Forma de pagamento"
          onPress={() => {
            props.navigation.navigate('Pag', {screen: 'Pag'});
          }}
          style={styles.item}
        />

        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="home" />}
          label="Empresas"
          onPress={() => {
            props.navigation.navigate('Companies', {screen: 'Companies'});
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="home" />}
          label="Indique e ganhe"
          onPress={() => {
            props.navigation.navigate('Send', {screen: 'Send'});
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="home" />}
          label="Suporte"
          onPress={() => {
            props.navigation.navigate('Sup', {screen: 'Sup'});
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="apple" />}
          label="Mercado"
          onPress={() => {
            props.navigation.navigate('Supermarket', {
              screen: 'Supermarket',
            });
          }}
          style={styles.item}
        />
        <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="fastFood" />}
          label="Restaurante"
          onPress={() => {
            props.navigation.navigate('Restaurant', {screen: 'Restaurant'});
          }}
          style={styles.item}
        /> */}
        {!guest || guest === false ? (
          <>
            {/* <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="favorites" />}
              label="Favoritos"
              onPress={() => {
                props.navigation.navigate('Favorites', {screen: 'Favorites'});
              }}
              style={styles.item}
            /> */}
            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="ticket" />}
              label="Cupom de Desconto"
              onPress={() => {
                props.navigation.navigate('Shopping', {
                  screen: 'Coupon',
                  params: {
                    pageRedirect: null,
                    company: null,
                    subTotal: null,
                    openCart: false,
                    notCoupon: false,
                  },
                });
              }}
              style={styles.item}
            />
            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="market" />}
              label="Pedido"
              onPress={() => {
                props.navigation.navigate('Shopping', {screen: 'MyOrder'});
              }}
            />
            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="cashback" />}
              label="Cashback"
              onPress={() => {
                props.navigation.navigate('cashBack', {screen: 'cashBack'});
              }}
              style={styles.item}
            />

            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="share" />}
              label="Compartilhar"
              onPress={() => onShare()}
            />
            {/** Mobilidade Urbana - INIT */}
            {/* <DrawerItem
              onPress={() => navigation.navigate('Indicate')}
              labelStyle={styles.label}
              label="Indique e ganhe"
              icon={() => <CustomIcon name="share" />}
            /> */}

            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="home" />}
              label="Carteira"
              onPress={() => {
                props.navigation.navigate('Wallet', {screen: 'Wallet'});
              }}
              style={styles.item}
            />

            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="share" />}
              label="Minhas viagens"
              onPress={() => {
                props.navigation.navigate('RideAndTravelStack', {
                  screen: 'History',
                });
              }}
            />
            {/** Mobilidade Urbana - FIM */}

            <Divider />
            <MenuCategory>Meus Dados</MenuCategory>
            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="user" />}
              label="Meu Perfil"
              onPress={() => {
                props.navigation.navigate('Customer', {
                  screen: 'CustomerEdit',
                });
              }}
              style={styles.item}
            />
            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="location" />}
              label="Endereços"
              onPress={() => {
                props.navigation.navigate('Customer', {
                  screen: 'CustomerAddress',
                });
              }}
              style={styles.item}
            />
            <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="creditCard" />}
              label="Métodos de Pagamento"
              onPress={() => {
                props.navigation.navigate('Shopping', {
                  screen: 'PaymentMethods',
                });
              }}
            />
            {/* <DrawerItem
              labelStyle={styles.label}
              icon={() => <CustomIcon name="suport" />}
              label="Suporte"
              onPress={() => {
                props.navigation.navigate('Support', {
                  screen: 'Support',
                });
              }}
            /> */}
          </>
        ) : null}
        <Divider />
        {/* <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="clientSupport" />}
          label="Fale conosco"
          onPress={() => {
            props.navigation.navigate('Support', {screen: 'Contact'});
          }}
        /> */}
        {/* <DrawerItem
          labelStyle={styles.label}
          icon={() => <CustomIcon name="partner" />}
          label="Seja Parceiro"
          onPress={() => null}
        /> */}
        <DrawerItem
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
          onPress={() => exitUser()}
        />
      </DrawerContentScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  headerMenu: {
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  label: {
    color: Colors.PRIMARY,
    fontSize: Typography.FONT_SIZE_16,
  },
  touchableStyle: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginTop: 6,
    marginRight: 5,
  },
  txtAddres: {
    flex: 1,
    color: Colors.PRIMARY,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginTop: 6,
    marginRight: 1,
  },
  item: {
    marginBottom: -8,
  },
});
