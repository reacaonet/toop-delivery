/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import database from '@react-native-firebase/database';
import {
  OrderStatus,
  updateStatusOrder,
  listOrder,
} from '../../services/provider/order';
import { totalNoRead } from '../../services/provider/chat';
import Chat from '../chat';
import { formatPhone, formatAddress } from '../../utils';
import CustomRoundedHeader from '../../components/shared/CustomRoundedHeader';
import styles from './styles';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import ConfirmStep from '../../components/shared/alert/addItem';
import config from '../../config';
import { Colors } from '../../styles';

import {
  configureBackground,
  configureInRoute,
} from '../../services/location/backgroundGeolocation';

const noImage = require('../../assets/images/product/no_image.png');

/** Services */
import { listCart } from '../../services/provider/cart/cart';

/** utils */
import { formatMoney } from '../../utils';

type DetailProps = {
  navigation: any;
  route: any;
  user: any;
};

const Detail: FunctionComponent<DetailProps> = ({
  navigation,
  user,
  route: Route,
}: DetailProps) => {
  const [details, setDetails]: any = useState([]);
  const Map = require('../../assets/images/route/rota.png');
  const headerAvatar = require('../../assets/images/headerAvatar.png');
  const [chatModal, setChatModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [totalMessage, setTotalMessage] = useState(0);
  const [cart, setCart] = useState<any>(null);

  const CheckConnectivity = () => {
    NetInfo.fetch().then((state: any) => {
      if (!state.isConnected) {
        navigation.navigate('Connectivity');
      }
    });
  };

  useEffect(() => {
    CheckConnectivity();
  }, []);

  useEffect(() => {
    // Estado Inicial da Order
    initOrder();
  }, []);

  // Monitora Mudança na Order
  useEffect(() => {
    if (orderId !== null && details && details.company._id) {
      database()
        .ref(`${config.FIREBASE_PATH}order/${orderId}`)
        .on('value', (snapshot: any) => {
          if (snapshot.val()) {
            getOrder();
          }
        });

      database()
        .ref(`${config.FIREBASE_PATH}chat/company/${details.company._id}`)
        .on('value', (snapshot: any) => {
          if (snapshot.val()) {
            getTotalNoRead();
          }
        });
    }
  }, [orderId]);

  // Estado Inicial da ordem
  const initOrder = async () => {
    try {
      let orderCurrent: any = null;

      if (Route.params !== null) {
        let id = null;
        if (Route.params.payment && Route.params.payment._id) {
          id = Route.params.payment._id;
        } else {
          id = Route.params?.payment ?? null;
        }

        orderCurrent = await listOrder(id);
        if (orderCurrent && orderCurrent.orderStatus) {
          orderCurrent = orderCurrent.orderStatus;
          setDetails(orderCurrent);
        }
      } else {
        orderCurrent = [];
        setDetails(orderCurrent);
      }

      if (
        (orderCurrent && orderCurrent.status === 'ACCEPT_DELIVERYMAN') ||
        orderCurrent.status === 'RELEASE_SHOPPER'
      ) {
        setCurrentStep(0);
      }
      if (orderCurrent.status === 'DELIVERY_ROUTE') {
        setCurrentStep(1);
      }
      if (orderCurrent.status === 'FINISHED') {
        setCurrentStep(2);
      }

      if (orderCurrent && orderCurrent._id) {
        setOrderId(orderCurrent._id);
      }

      // listCart
      if (orderCurrent.shoppingCart) {
        const cartCurrent = await listCart(orderCurrent.shoppingCart);
        if (cartCurrent && cartCurrent.itens) {
          setCart(cartCurrent.itens);
        } else {
          setCart(null);
        }
      }
    } catch (err) {
      //
    }
  };

  const startDelivery = async (orderId: any) => {
    let nowDate = new Date(Date.now());
    await updateStatusOrder(orderId, {
      acceptedDateDeliveryMan: nowDate,
      status: 'DELIVERY_ROUTE',
    });

    setCurrentStep(1);

    Alert.alert(
      'Entrega iniciada',
      'Confira o endereço de entrega e dirija com cuidado',
    );

    configureInRoute(user); // Ativar configurações GPS em Rota
  };

  const finishDelivery = async (orderId: any) => {
    let nowDate = new Date(Date.now());
    await updateStatusOrder(orderId, {
      finishDateDeliveryMan: nowDate,
      status: 'FINISHED',
    });

    configureBackground(user); // Ativar configurações GPS normal
    setCurrentStep(2);
    navigation.navigate('Home');
  };

  const getOrder = async () => {
    const result = await listOrder(details.payment);
    if (result && result.orderStatus) {
      setDetails(result.orderStatus);
    }
  };

  const confirmClick = () => {
    if (details && details.status === 'RELEASE_SHOPPER') {
      startDelivery(details._id);
    }

    if (details && details.status === 'DELIVERY_ROUTE') {
      finishDelivery(details._id);
    }
  };

  const currentCoordinate = () => {
    try {
      if (
        details &&
        (details.status === 'FINISHED' || details.status === 'CANCELED')
      ) {
        return null;
      }

      if (details && details.status === 'DELIVERY_ROUTE') {
        let coordinate = details.customerDelivery.location.coordinates;
        return `${coordinate[1]},${coordinate[0]}`;
      }

      if (details && details.company && details.company.location) {
        let coordinate = details.company.location.coordinates;
        return `${coordinate[1]},${coordinate[0]}`;
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  const btnStatus = () => {
    if (details && details.status === 'ACCEPT_DELIVERYMAN') {
      return (
        <TouchableOpacity style={styles.startDeliveryDisabled} disabled={true}>
          <Text style={styles.startDeliveryText}>Iniciar entrega</Text>
          <Text style={styles.startDeliveryInfo}>
            Aguardando Libreção Shopper
          </Text>
        </TouchableOpacity>
      );
    }

    if (details && details.status === 'RELEASE_SHOPPER') {
      return (
        <TouchableOpacity
          style={styles.startDelivery}
          onPress={() => setIsModalConfirm(true)}>
          <Text style={styles.startDeliveryText}>Iniciar entrega</Text>
        </TouchableOpacity>
      );
    }

    if (details && details.status === 'DELIVERY_ROUTE') {
      return (
        <TouchableOpacity
          style={styles.startDelivery}
          onPress={() => setIsModalConfirm(true)}>
          <Text style={styles.startDeliveryText}>Finalizar entrega</Text>
        </TouchableOpacity>
      );
    }
  };

  const btnMaps = () => {
    let coordinate = currentCoordinate();
    let link: string = '';

    if (!coordinate || coordinate === null) {
      return <View />;
    }

    if (Platform.OS === 'ios') {
      link = `maps:${coordinate}`;
    } else {
      link = `geo:${coordinate}?center=${coordinate}&q=${coordinate}&z=16`;
    }

    return (
      <TouchableOpacity
        style={styles.maps}
        onPress={() => Linking.openURL(link)}>
        <Image source={Map} style={styles.routeMap} />
        <Text style={styles.txtMap}>Ver rotas de entrega com...</Text>
      </TouchableOpacity>
    );
  };

  const delivery = () => {
    return (
      <View style={styles.boxOrder}>
        <Text style={styles.boxOrderTitle}>
          PEDIDO: {details?.order_number}
        </Text>

        <Text style={styles.boxOrderTitle}>
          Forma Pagamento: {details?.typePaymentTxt}
        </Text>

        {details?.typePayment === 'MONEY' ? (
          <Text style={styles.boxOrderTitle}>
            Troco: {formatMoney(Route.params?.payment?.cashChange ?? 0)}
          </Text>
        ) : null}

        {Route?.params?.payment?.total ? (
          <Text style={styles.boxOrderTitle}>
            Total Pedido: {formatMoney(Route?.params?.payment?.total || 0)}
          </Text>
        ) : null}

        <Text style={styles.boxOrderText}>
          Status: {OrderStatus(details?.status)}
        </Text>

        {details && details.finishDateDeliveryMan ? (
          <>
            <Text style={styles.boxOrderText}>
              Data da entrega:
              {Moment(details?.finishDateDeliveryMan).format('DD/MM/YYYY')}
            </Text>
            <Text style={styles.boxOrderText}>
              Hora da entrega:
              {Moment(details?.finishDateDeliveryMan).format('HH:mm')}
            </Text>
          </>
        ) : null}

        {details?.customer?.person?.name ? (
          <Text style={styles.boxOrderText}>
            Cliente: {details?.customer?.person?.name}
          </Text>
        ) : null}

        <Text style={styles.boxOrderText}>
          {formatAddress(details?.customerDelivery)}
        </Text>

        {details?.note ? (
          <Text style={styles.boxOrderText}>Observação: {details.note}</Text>
        ) : null}

        {details?.customerDelivery?.streetNumber ? (
          <Text style={styles.boxOrderText}>
            Número: {details?.customerDelivery?.streetNumber}
          </Text>
        ) : null}

        {details?.customerDelivery?.complement ? (
          <Text style={styles.boxOrderText}>
            Complemento: {details?.customerDelivery?.complement}
          </Text>
        ) : null}
        {details?.customerDelivery?.referencePoint ? (
          <Text style={styles.boxOrderText}>
            Referência: {details?.customerDelivery?.referencePoint}
          </Text>
        ) : null}

        {cart && Array.isArray(cart) ? (
          <>
            <Text style={styles.cartTitle}>Produtos</Text>
            <View style={styles.cartContainer} >
              {cart.map((item: any) => {
                if (item.product) {
                  return (
                    <>
                      <View style={styles.imageContainer}>
                        {item?.product && item?.product?.images ? (
                          <Image
                            style={styles.imageProduct}
                            source={{ uri: item.product.images[0] }}
                            resizeMode="contain"
                          />
                        ) : (
                          <Image
                            source={noImage}
                            style={styles.imageProduct}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        {(item?.product?.check && Object.keys(item?.product?.check).length > 0) ||
                          (item?.product?.radio && Object.keys(item?.product?.radio).length > 0) ? (
                          <>
                            <Text style={styles.txtNameProd}>
                              {`${item?.product?.amount} x ${item?.product?.name}`}
                            </Text>
                            <Text style={styles.titleComplement}>
                              +{' '}
                              {item?.product?.check.concat(item?.product?.radio || []).map((itemCheck: any) => {
                                return `${itemCheck?.name} | `;
                              })}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.txtNameProdAlone}>{`${item?.amount} x ${item?.product?.name}`}</Text>
                        )}
                      </View>
                    </>
                  );
                }

                return null;
              })}
            </View>
          </>
        ) : null}
      </View>
    );
  };

  const getTotalNoRead = async () => {
    try {
      if (details && details.shoppingCart && user && user._id) {
        let respTotal = await totalNoRead(details.shoppingCart, {
          personId: user._id,
        });

        if (respTotal && respTotal.total >= 0) {
          setTotalMessage(respTotal.total);
        }
      }
    } catch (err) { }
  };

  const closeModalChat = () => {
    setTotalMessage(0);
    setChatModal(false);
  };

  return (
    <View style={styles.containerGeral}>
      <ScrollView contentContainerStyle={styles.container}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={chatModal}
          onRequestClose={() => closeModalChat()}>
          <Chat
            close={setChatModal}
            deliveryMan={user}
            order={details}
            totalMessage={setTotalMessage}
          />
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalConfirm}
          onRequestClose={() => setIsModalConfirm(false)}>
          <ConfirmStep
            title="Deseja Realmente prosseguir ?"
            confirmTitle={'Sim'}
            cancelTitle={'Não'}
            modal={setIsModalConfirm}
            onConfirm={confirmClick}
          />
        </Modal>

        <CustomRoundedHeader
          title={
            details.status === 'DELIVERY_ROUTE' ? 'Cliente' : 'Estabelecimento'
          }
          subtitle={
            details.status === 'DELIVERY_ROUTE'
              ? details?.customer?.person?.name
              : details?.company?.name
          }
          avatarImg={
            details.status !== 'DELIVERY_ROUTE'
              ? { uri: details?.company?.images[0] }
              : headerAvatar
          }>
          {details &&
            // details.status === 'ACCEPT_DELIVERYMAN' ||
            // details.status === 'RELEASE_SHOPPER' ||
            details.status === 'DELIVERY_ROUTE' ? (
            <TouchableOpacity onPress={() => setChatModal(true)}>
              {totalMessage && totalMessage > 0 ? (
                <View style={styles.contentBadgeMessage}>
                  <Text style={styles.badgeMessage}>{totalMessage}</Text>
                </View>
              ) : null}
              <View style={styles.iconMessage}>
                <Icon2 name="mode-comment" size={40} color={'#fff'} />
              </View>
            </TouchableOpacity>
          ) : null}
        </CustomRoundedHeader>

        <View style={styles.content}>
          <View style={{ flex: 1 }}>
            <ProgressSteps
              completedProgressBarColor={Colors.PRIMARY}
              completedStepNumColor="#fff"
              completedStepIconColor={Colors.PRIMARY}
              activeStepIconBorderColor={Colors.PRIMARY}
              activeLabelColor={Colors.PRIMARY}
              activeStep={currentStep}>
              <ProgressStep removeBtnRow label="Aguardando Liberação">
                {btnMaps()}
                <View style={styles.boxOrder}>
                  <Text style={styles.boxOrderTitle}>
                    PEDIDO: {details?.order_number}
                  </Text>
                  <Text style={styles.boxOrderText}>
                    Status: {OrderStatus(details?.status)}
                  </Text>
                  {details && details.acceptedDateDeliveryMan ? (
                    <>
                      <Text style={styles.boxOrderText}>
                        Data da retirada:
                        {Moment(details.acceptedDateDeliveryMan).format(
                          'DD/MM/YYYY',
                        )}
                      </Text>
                      <Text style={styles.boxOrderText}>
                        Hora da retirada:
                        {Moment(details.acceptedDateDeliveryMan).format(
                          'HH:mm',
                        )}
                      </Text>
                    </>
                  ) : null}
                  <Text style={styles.boxOrderText}>
                    Estabelecimento: {details?.company?.name}
                  </Text>
                  <Text style={styles.boxOrderText}>
                    {details?.company?.address}
                  </Text>
                  {details?.company?.complement ? (
                    <Text style={styles.boxOrderText}>
                      Complemento: {details?.company?.complement}
                    </Text>
                  ) : null}

                  <Text style={styles.boxOrderText}>
                    Contato: {formatPhone(details?.company?.phone)}
                  </Text>
                  <Text style={styles.boxOrderText}>
                    Observação: {details?.note}
                  </Text>
                </View>
              </ProgressStep>
              <ProgressStep removeBtnRow label="Entrega Iniciada">
                {btnMaps()}
                <View>{delivery()}</View>
              </ProgressStep>
              <ProgressStep removeBtnRow label="Entrega Finalizada">
                {btnMaps()}
                <View>{delivery()}</View>
              </ProgressStep>
            </ProgressSteps>
          </View>
        </View>
      </ScrollView>
      {btnStatus()}
    </View>
  );
};

const mapStateToProps = ({ authUser }: any) => {
  return {
    user: authUser?.user ?? {},
  };
};

export default connect(mapStateToProps)(Detail);
