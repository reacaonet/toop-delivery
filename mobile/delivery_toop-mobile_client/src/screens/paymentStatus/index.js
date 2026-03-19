/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import database from '@react-native-firebase/database';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

import OrderStatus from './../order/orderStatus';
import config from '../../config';

/** Services */
import { seacrhDeliveryAddress } from '../../services/service/delivery/address';
import { totalNoRead } from '../../services/service/chat';
import { cartCurrent } from '../../services/service/shopping/cart';
import { listOnePayment } from '../../services/service/shopping/payment';
import { listOne } from '../../services/service/company';
import { listCartItem } from '../../services/service/shopping/cartItem';

/** Service */
import { StorageSet } from '../../services/deviceStorage';
import {
  listOrderOne,
  getOrderDelivery,
  currentOrder,
  updateStatusOrder,
} from '../../services/service/shopping/order';
import { cartReorder } from '../../services/service/shopping/cart/create';

/** Util */
import { formatMoney, formatDate, toastShow, formatAddress } from '../../utils';
import { OnPersonChat } from './ChatPayment/messageUtil';

/** Styles */
import styles from './styles';
import { Colors } from '../../styles';
import PixDirect from './pixDirect';

export default function PaymentStatus({ navigation, route }) {
  const { configurations = null } = useSelector(state => state);

  const [payment, setPayment] = useState([]);
  const [company, setCompany] = useState(null);
  const [deliveryman] = useState(null);
  const [cartItem, setCartItem] = useState([]);
  const [order, setOrder] = useState({});
  const [statusOrder, setStatusOrder] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [totalMessage, setTotalMessage] = useState(0);
  const [personChat, setPersonChat] = useState({});
  const [orderDelivery, setOrderDelivery] = useState({});
  const [modal, setModal] = useState(false);
  const [causeCanceled, setCauseCanceled] = useState('');
  const [loadNewCart, setLoadNerCart] = useState(false);
  const [showPixDirect, setShowPixDirect] = useState(false);

  const bag = require('../../components/product/assets/bag.png');
  const noImage = require('../../assets/images/product/no_image.png');
  const imageLoad = require('../../assets/images/product/image_load.png');
  const iconMessage = require('../../assets/images/icon_notification.png');

  useFocusEffect(
    useCallback(() => {
      paymentRequest();
    }, [orderId]),
  );

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [payment]),
  );

  useFocusEffect(
    useCallback(() => {
      if (orderId !== null && order !== undefined) {
        database()
          .ref(`${config.FIREBASE_PATH}order/${orderId}`)
          .on('value', snapshot => {
            if (snapshot.val()) {
              try {
                refreshStatus();
                if (payment && payment.shoppingCart._id && company) {
                  cartUser(payment, company);

                  const companyType =
                    company?.shoppingFlow === 'MENU'
                      ? 'restaurant'
                      : 'supermarket';

                  seachCartItem(payment.shoppingCart._id, companyType);
                }
              } catch (err) { }
            }
          });
      }
    }, [orderId]),
  );

  useFocusEffect(
    useCallback(() => {
      if (payment?.status == 'AWAITING_PAYMENT' && payment?.typePayment == 'PIX_DIRECT') {
        setShowPixDirect(true);
      }

      if (payment && payment.company) {
        database()
          .ref(`${config.FIREBASE_PATH}chat/company/${payment.company}`)
          .on('value', snapshot => {
            if (snapshot.val()) {
              getTotalNoRead(payment);
            }
          });
      }
    }, [payment]),
  );

  useEffect(() => {
    if (
      company &&
      company._id &&
      payment &&
      payment.shoppingCart &&
      payment.shoppingCart._id
    ) {
      cartUser(payment, company);
    }
  }, [payment, company]);

  const paymentRequest = async () => {
    try {
      const _id = route.params?.paymentId ?? null;
      const respPayment = await listOnePayment(_id);

      if (respPayment && respPayment._id) {
        setPayment(respPayment);
        await StorageSet('paymentStatus', respPayment);

        if (!respPayment.shoppingCart || !respPayment.shoppingCart.company) {
          navigation.navigate('Home', { screen: 'Home' });
          return;
        }

        const companyRes = await listOne(respPayment.shoppingCart.company);
        setCompany(companyRes);

        const companyType =
          companyRes?.shoppingFlow === 'MENU' ? 'restaurant' : 'supermarket';

        seachCartItem(respPayment.shoppingCart._id, companyType);

        await getOrder();
        getTotalNoRead(respPayment);

        let respDeliveryAddress = await seacrhDeliveryAddress({
          customer: respPayment.customer._id,
          main: true,
        });

        if (respDeliveryAddress && respDeliveryAddress[0]) {
          setDeliveryAddress(respDeliveryAddress[0]);
        }
      }
    } catch (err) {
      // console.log('Ops fail PaymentRequest', err);
    }
  };

  const getOrder = async () => {
    const _id = route.params?.paymentId ?? null;
    let orderOne = await listOrderOne(_id, {});
    if (orderOne) {
      setOrder(orderOne);
      const {
        orderStatus: { status },
      } = orderOne;
      setStatusOrder(status);
      setOrderId(orderOne.orderStatus._id);
    }
  };

  const cartUser = async (paymentCart, companyCart) => {
    try {
      const respCart = await cartCurrent(paymentCart.shoppingCart._id, {
        type:
          companyCart?.shoppingFlow === 'MENU' ? 'restaurant' : 'supermarket',
        delivery: false,
      });

      if (respCart && respCart.cart) {
        let total = respCart.subTotal;

        if (paymentCart.serviceCharge > 0) {
          total += paymentCart.serviceCharge;
        }

        if (paymentCart.priceDelivery > 0) {
          total += paymentCart.priceDelivery;
        }

        if (
          respCart?.shippingInfo.used &&
          respCart?.shippingInfo.freeShippingBonus
        ) {
          total -= respCart.shippingInfo.freeShippingBonus;
        }

        if (paymentCart.valueTip > 0) {
          total += paymentCart.valueTip;
        }

        if (
          paymentCart &&
          paymentCart.couponPrice &&
          paymentCart.couponPrice > 0
        ) {
          total -= paymentCart.couponPrice;
        }

        setTotalPayment(total);
      }
    } catch (err) {
      // console.log('Failt total', err);
    }
  };

  const getTotalNoRead = async pay => {
    let respTotal = await totalNoRead(pay.shoppingCart._id, {
      personId: pay.customer._id,
    });

    if (respTotal && respTotal.total >= 0) {
      setTotalMessage(respTotal.total);
    }
  };

  const seachCartItem = async (cartId, type) => {
    const list = await listCartItem(cartId, { type });
    if (list) {
      setCartItem(list);
    }
  };

  const getPersonChat = async orderResult => {
    const go = () => { };
    let response = await OnPersonChat(orderResult, go);

    if (response && response.user) {
      setPersonChat({
        type: response.personType,
        name: response.name,
      });
    }
  };

  const goChatMessage = () => {
    let idPayment = order.orderStatus.payment;
    if (typeof idPayment === 'object' && idPayment.length > 0) {
      idPayment = idPayment[0];
    }

    return navigation.navigate('Support', {
      screen: 'ChatPayment',
      params: {
        payment: `${idPayment}`,
        order: `${order?.orderStatus?.order_number}`,
      },
    });
  };

  const refreshStatus = async () => {
    try {
      if (payment.order) {
        let response = await getOrderDelivery(payment.order);
        if (response) {
          setOrderDelivery(response);
        }
      }

      if (payment && payment._id) {
        let orderOne = await listOrderOne(payment._id, {});

        if (orderOne && orderOne.status !== order?.orderStatus?.status) {
          setOrder(orderOne);
          setStatusOrder(order.orderStatus.status);
          getPersonChat(orderOne.orderStatus);
        }
      }
    } catch (err) {
      // console.log('Fail refresh position', err);
    }
  };

  const status = () => {
    try {
      if (order && order.orderStatus && order.orderStatus.status) {
        return OrderStatus(order.orderStatus.status);
      }
    } catch (err) {
      // console.log('Error Status', err);
      return '';
    }
  };

  const goToOrdersItens = () => {
    if (!company) {
      return;
    }

    navigation.navigate('PaymentStatusItems', {
      screen: 'PaymentStatusItems',
      shoppingCart: order?.orderStatus?.shoppingCart,
      type: company?.shoppingFlow === 'MENU' ? 'restaurant' : 'supermarket',
    });
  };

  const cancelOrder = async () => {
    const {
      orderStatus: { _id },
    } = order;
    setModal(false);
    const orderId = _id;
    const currOrder = await currentOrder(orderId);
    const { status } = currOrder;
    setStatusOrder(currOrder.status);
    if (statusOrder === 'WAIT_COMPANY') {
      currOrder.status = 'CANCELED';
      const canceledOrder = await updateStatusOrder(orderId, currOrder);
      setStatusOrder('CANCELED');
      toastShow('Pedido cancelado!', 'ALERT');
    } else {
      toastShow('Pedido não pode ser cancelado!', 'ALERT');
    }
  };

  const closeModal = () => {
    setModal(false);
  };

  const goBack = () => {
    try {
      if (route.params?.routeOrigin === 'Order') {
        navigation.navigate('Shopping', {
          screen: 'MyOrder',
        });
      } else {
        navigation.navigate('Home');
      }
    } catch (err) {
      navigation.navigate('Home', { screen: 'Home' });
    }
  };

  const createNewCart = async () => {
    setLoadNerCart(true);
    const resp = await cartReorder(
      order?.orderStatus?.shoppingCart,
      company?.shoppingFlow,
    );
    setLoadNerCart(false);

    if (resp.message) {
      return Alert.alert('Pedir Novamente', resp.message);
    }

    // Redirecionar Aqui
    if (company?.shoppingFlow === 'PRODUCT') {
      return navigation.navigate('Supermarket', {
        screen: 'Product',
        params: {
          company: company,
          buyAgain: true,
        },
      });
    } else if (company?.shoppingFlow === 'MENU') {
      return navigation.navigate('Restaurant', {
        screen: 'RestaurantProduct',
        params: {
          company: company,
          buyAgain: true,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => goBack()}>
            <Icon
              name="navigate-before"
              size={45}
              style={styles.headerBefore}
            />
          </TouchableOpacity>
          <View style={styles.titleContent} activeOpacity={1}>
            <Text style={styles.headerTitle}>DETALHES DO PEDIDO</Text>
          </View>
        </View>
      </SafeAreaView>
      <LinearGradient
        colors={Colors.GRADIENTE_PRIMARY}
        style={styles.BoxShoper}>
        <View style={styles.BoxShoperContent}>
          <View style={styles.boxImg}>
            {company?.images && company?.images.length > 0 ? (
              <Image
                style={styles.BoxShoperImg}
                defaultSource={imageLoad}
                source={{ uri: company?.images[0] }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={noImage}
                style={styles.BoxShoperImg}
                resizeMode="contain"
              />
            )}
          </View>
          <View style={styles.BoxShoperContentText}>
            <Text style={styles.BoxShoperTitleTag}>
              {personChat &&
                personChat.type &&
                personChat.type === 'deliveryMan'
                ? 'Entregador'
                : 'Shopper'}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.BoxShoperTitleTag, styles.BoxShoperTitle]}>
              {company ? company.name : ''}
            </Text>
          </View>
        </View>
        {order &&
          order.orderStatus &&
          order.orderStatus !== undefined &&
          order.orderStatus.shopper &&
          order?.orderStatus?.status !== 'WAIT_COMPANY' &&
          order?.orderStatus?.status !== 'ACCEPT_SHOPPER' &&
          order?.orderStatus?.status !== 'FINISHED' &&
          order?.orderStatus?.status !== 'CANCELED' ? (
          <TouchableOpacity
            style={styles.ButtonChat}
            onPress={() => goChatMessage()}>
            {totalMessage && totalMessage > 0 ? (
              <View style={styles.contentBadgeMessage}>
                <Text style={styles.badgeMessage}>{totalMessage}</Text>
              </View>
            ) : null}
            <View style={styles.iconMessage}>
              {/* <Icon2 name="mode-comment" size={35} color={'#fff'} /> */}
              <Image source={iconMessage} style={styles.imageMessage} />
            </View>
          </TouchableOpacity>
        ) : null}
      </LinearGradient>
      <View style={styles.timeline}>
        <View style={styles.risk}>
          <View style={styles.riskLine} />
        </View>
        <View style={styles.boxStatus}>
          <LinearGradient
            colors={Colors.GRADIENTE_PRIMARY}
            style={styles.boxStatusStep}>
            <Text style={[styles.boxStatusStepBase, styles.boxStatusStepText]}>
              1
            </Text>
          </LinearGradient>
          <Text style={styles.boxStatusText}>Solicitação</Text>
        </View>
        {order &&
          order?.orderStatus?.status !== 'WAIT_COMPANY' &&
          order?.orderStatus?.status !== 'ACCEPT_SHOPPER' ? (
          <View style={styles.boxStatus}>
            <LinearGradient
              colors={Colors.GRADIENTE_PRIMARY}
              style={styles.boxStatusStep}>
              <Text
                style={[styles.boxStatusStepBase, styles.boxStatusStepText]}>
                2
              </Text>
            </LinearGradient>
            <Text style={styles.boxStatusText}>Preparo</Text>
          </View>
        ) : (
          <View style={styles.boxStatus}>
            <LinearGradient
              colors={['#a3a3a3', '#acacac']}
              style={styles.boxStatusStep}>
              <Text
                style={[styles.boxStatusStepBase, styles.boxStatusStepTextD]}>
                2
              </Text>
            </LinearGradient>
            <Text style={styles.boxStatusTextD}>Preparo</Text>
          </View>
        )}
        {order &&
          (order?.orderStatus?.status === 'RELEASE_SHOPPER' ||
            order?.orderStatus?.status === 'DELIVERY_ROUTE' ||
            order?.orderStatus?.status === 'IN_PROGRESS_DELIVERYMAN' ||
            order?.orderStatus?.status === 'ACCEPT_DELIVERYMAN' ||
            order?.orderStatus?.status === 'DELIVERY_ROUTE' ||
            order?.orderStatus?.status === 'FINISHED' ||
            order?.orderStatus?.status === 'CANCELED') ? (
          <View style={styles.boxStatus}>
            <LinearGradient
              colors={Colors.GRADIENTE_PRIMARY}
              style={styles.boxStatusStep}>
              <Text
                style={[styles.boxStatusStepBase, styles.boxStatusStepText]}>
                3
              </Text>
            </LinearGradient>
            <Text style={styles.boxStatusText}>Entrega</Text>
          </View>
        ) : (
          <View style={styles.boxStatus}>
            <LinearGradient
              colors={['#a3a3a3', '#acacac']}
              style={styles.boxStatusStep}>
              <Text
                style={[styles.boxStatusStepBase, styles.boxStatusStepTextD]}>
                3
              </Text>
            </LinearGradient>
            <Text style={styles.boxStatusTextD}>Entrega</Text>
          </View>
        )}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {order?.orderStatus &&
          orderDelivery.typePayment === 'BRASPAG' &&
          order?.orderStatus?.confirmationDeliveryToken && (
            <View style={styles.viewContentTitle}>
              <Text style={styles.viewContentTitleTxt}>
                Código de confirmação:{' '}
                {order?.orderStatus?.confirmationDeliveryToken}
              </Text>
            </View>
          )}
        {payment && payment !== [] && (
          <>
            {company &&
              company?.shoppingFlow &&
              order?.orderStatus?.shoppingCart ? (
              <TouchableOpacity
                onPress={() => createNewCart()}
                style={styles.viewNewCart}
                disabled={loadNewCart}>
                {loadNewCart === false ? (
                  <>
                    <Icon
                      name="shopping-basket"
                      size={30}
                      color={Colors.PRIMARY}
                    />
                    <Text style={styles.txtNewCart}>Pedir Novamente ?</Text>
                  </>
                ) : (
                  <View style={styles.loadNewCart}>
                    <ActivityIndicator size="small" color={Colors.PRIMARY} />
                  </View>
                )}
              </TouchableOpacity>
            ) : null}

            <View style={styles.viewContentTitle}>
              <Text style={styles.viewContentTitleTxt}>
                Pedido: {order?.orderStatus?.order_number}
              </Text>
            </View>

            <View style={styles.viewContentInfo}>
              <Text style={styles.viewContentInfoTxt}>
                Status:{' '}
                <Text style={styles.txtInfoStatus}>
                  {orderDelivery?.statusTxt}
                </Text>
              </Text>

              {orderDelivery &&
                orderDelivery?.schedule &&
                orderDelivery?.status !== 'FINISHED' &&
                orderDelivery?.status !== 'CANCELED' ? (
                <Text style={styles.viewContentInfoTxt}>
                  Agendado: {orderDelivery.schedule}
                </Text>
              ) : null}
            </View>

            <View style={styles.viewContentTitle}>
              <Text style={styles.viewContentTitleTxt}>Data do Pedido</Text>
            </View>
            <View style={styles.viewContentInfo}>
              <Text style={styles.viewContentInfoTxt}>
                {formatDate(payment?.createdAt, 'DD/MM/YYYY HH:mm')}
              </Text>
            </View>

            {orderDelivery && orderDelivery?.paymentType ? (
              <>
                <View style={styles.viewContentTitle}>
                  <Text style={styles.viewContentTitleTxt}>
                    Forma de Pagamento
                  </Text>
                </View>
                <View style={styles.viewContentInfo}>
                  <Text style={styles.viewContentInfoTxt}>
                    {orderDelivery.paymentType?.type}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    {orderDelivery.paymentType?.image ? (
                      <Image
                        style={styles.imageCard}
                        source={{ uri: orderDelivery.paymentType?.image }}
                        resizeMode={'contain'}
                      />
                    ) : null}
                    <Text style={styles.viewFormPaymentInfoTxt}>
                      {orderDelivery?.paymentType?.data + ' '}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}

            {orderDelivery &&
              orderDelivery?.customerDelivery &&
              orderDelivery?.typeSchedule === 'DELIVERY' ? (
              <>
                <View style={styles.viewContentTitle}>
                  <Text style={styles.viewContentTitleTxt}>
                    {company?.companyCategory === 'service'
                      ? 'Endereço do Serviço'
                      : 'Endereço de Entrega'}
                  </Text>
                </View>
                <View style={[styles.viewContentInfo, { marginBottom: 30 }]}>
                  <Text
                    style={[
                      styles.viewContentInfoTxt,
                      { color: Colors.PRIMARY },
                    ]}>
                    {orderDelivery?.customerDelivery?.category === 'HOME' ||
                      orderDelivery?.customerDelivery?.category === 'RESIDENCIA'
                      ? 'Casa'
                      : ''}
                    {orderDelivery?.customerDelivery?.category === 'WORK'
                      ? 'Trabalho'
                      : ''}
                  </Text>
                  <Text style={styles.viewContentInfoTxt}>
                    Endereço: {formatAddress(orderDelivery?.customerDelivery)}
                  </Text>
                  <Text style={styles.viewContentInfoTxt}>
                    Número: {orderDelivery?.customerDelivery?.streetNumber}
                  </Text>
                  <Text style={styles.viewContentInfoTxt}>
                    Complemento: {orderDelivery?.customerDelivery?.complement}
                  </Text>
                </View>
              </>
            ) : null}

            {orderDelivery &&
              orderDelivery?.customerDelivery &&
              orderDelivery?.typeSchedule === 'WITHDRAWAL' &&
              company &&
              company?.address ? (
              <>
                <View style={styles.viewContentTitle}>
                  <Text style={styles.viewContentTitleTxt}>
                    {company?.companyCategory === 'service'
                      ? 'Marcar no Local'
                      : 'Endereço Retirada'}
                  </Text>
                </View>
                <View style={[styles.viewContentInfo, { marginBottom: 30 }]}>
                  <Text style={styles.viewContentInfoTxt}>
                    {company.address}
                  </Text>
                </View>
              </>
            ) : null}
          </>
        )}
        {statusOrder === 'WAIT_COMPANY' && (
          <TouchableOpacity
            style={styles.btnItens}
            onPress={() => setModal(true)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#FFFFFF00', '#FFFFFF00']}
              style={styles.btnCart}>
              <Text
                style={{
                  color: Colors.ALERT,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Cancelar pedido
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      <SafeAreaView>
        <TouchableOpacity
          style={styles.btnItens}
          onPress={() => goToOrdersItens(cartItem)}
          activeOpacity={0.8}>
          <LinearGradient
            colors={Colors.GRADIENTE_PRIMARY}
            style={styles.btnCart}>
            <ImageBackground source={bag} style={styles.imageBagCart}>
              <Text style={styles.itens}>{cartItem.length}</Text>
            </ImageBackground>
            <Text style={styles.btnText}>Itens do pedido</Text>
            <Text style={styles.pricePrimary}>
              {formatMoney(totalPayment, configurations?.coin)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Confirma o cancelamento do pedido?
            </Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                underlineColorAndroid="transparent"
                placeholder="Motivo"
                placeholderTextColor={Colors.DARK}
                numberOfLines={10}
                autoFocus={true}
                multiline={true}
                onChangeText={text => setCauseCanceled({ text })}
                value={causeCanceled}
              />
            </View>
            <View style={styles.modalViewButton}>
              <TouchableOpacity
                style={{
                  ...styles.openButton,
                }}
                onPress={() => {
                  cancelOrder();
                }}>
                <Text style={styles.textStyle}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  ...styles.openButton,
                }}
                onPress={() => {
                  setModal(!modal);
                }}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showPixDirect}
        onRequestClose={() => setShowPixDirect(false)}>
        <PixDirect
          modal={() => setShowPixDirect(false)}
          company={company}
          orderNumber={order?.orderStatus?.order_number}
        />
      </Modal>
    </View>
  );
}
