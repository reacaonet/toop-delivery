/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  ScrollView,
  View,
  Text,
  Alert,
  Modal,
  Image,
  TouchableOpacity,
} from 'react-native';
import styles from './styles';
import { connect } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import database from '@react-native-firebase/database';

import OrderTabs from './orderTabs';
import ModalDetailRestaurant from './modalDetailRestaurant';
import { currentDate, formatMoney } from '../../utils';
import OrderStatusBtn from './orderStatusBtn';
import OrderStatusRestaurantBtn from './orderStatusRestaurantBtn';
import RemoveItem from '../../components/shared/alert/removeItem';
import CustomRoundedHeader from '../../components/shared/CustomRoundedHeader';

import {
  orderUpdateStatus,
  listOrderOne,
  indexOrderStatus,
  getIsDispatch,
} from '../../services/provider/shopping/order';
import {
  listCartItem,
  updateItemCheck,
} from '../../services/provider/shopping/cartItem';
import getCustomer from '../../services/provider/person/customer';
// import {deleteCartItem} from '../../services/provider/shopping/cartItem';
import { totalNoRead } from '../../services/provider/chat';
import cartCustomer from '../../services/provider/shopping/cart/list';
import Chat from '../chat';
import config from '../../config';

/** Servcies */
import { scheduleActive } from '../../services/provider/shopping/cart/schedule';
import { listOneDeliveryMan } from '../../services/provider/person/deliveryman';

type OrderProps = {
  navigation: any;
  route: any;
  orderId: string;
  user: any;
};

const Order: FunctionComponent<OrderProps> = ({
  navigation,
  route,
  user,
}: OrderProps) => {
  const [orderId] = useState(route.params?.orderId ?? null);
  const [order, setOrder]: any = useState({});
  const [orderItem]: any = useState(route.params?.orderItem ?? null);
  const [customer, setCustomer]: any = useState({});
  const [chatModal, setChatModal] = useState(false);
  const [btnProcess, setBtnProcess] = useState(false);
  const [cartItem, setCartItem] = useState([]);
  const [modalConfirm, setModalConfirm] = useState(false);
  // const [itemSelect, setItemSelect]: any = useState({});
  const [cartUser, setCartUser] = useState({});
  const [itemCurrent, setItemCurrent]: any = useState({});
  const [modalDetailRestaurant, setModalDetailRestaurant] = useState(false);
  const [totalMessage, setTotalMessage] = useState(0);
  const [deliveryMan, setDeliveryMan]: any = useState(null);
  const [isDispatch, setIsDispatch] = useState(false);

  useFocusEffect(
    useCallback(() => {
      orderRequest();
      return () => {
        setChatModal(false);
        setBtnProcess(false);
      };
    }, []),
  );

  useEffect(() => {
    getCartItem();
  }, [order]);

  // Atualizações Status Firebase
  useEffect(() => {
    if (order && order._id) {
      getIsDispatch(order._id, {})
        .then((result) => {
          if (result?.response?.companyDelivery?.own_delivery === true) {
            setIsDispatch(true);
          } else {
            setIsDispatch(false);
          }
        })
        .catch(() => {
          setIsDispatch(false);
        });

      database()
        .ref(`${config.FIREBASE_PATH}order/${order._id}`)
        .on('value', (snapshot) => {
          if (snapshot.val()) {
            console.log('Atualizando ....');
            orderRequest();
          }
        });

      if (order?.company && order.company?.id) {
        database()
          .ref(`${config.FIREBASE_PATH}chat/company/${order.company?.id}`)
          .on('value', (snapshot: any) => {
            if (snapshot.val()) {
              getTotalNoRead();
            }
          });
      }

      database()
        .ref(`${config.FIREBASE_PATH}chat/cart/${order.shoppingCart}`)
        .on('value', (snapshot: any) => {
          if (snapshot.val()) {
            getTotalNoRead();
          }
        });
    }

    return () => {
      database().ref(`${config.FIREBASE_PATH}order/${order._id}`).off();
      database()
        .ref(`${config.FIREBASE_PATH}chat/company/${order.company?.id}`)
        .off();
      database()
        .ref(`${config.FIREBASE_PATH}chat/cart/${order.shoppingCart}`)
        .off();
    };
  }, [order?._id]);

  const getTotalNoRead = async () => {
    try {
      if (order && order.shoppingCart && user && user?.person?._id) {
        let respTotal = await totalNoRead(order.shoppingCart, {
          personId: user?.person?._id,
        });

        if (respTotal && respTotal.total >= 0) {
          setTotalMessage(respTotal.total);
        }
      }
    } catch (err) { }
  };

  const orderRequest = async () => {
    if (orderId) {
      let resp = await listOrderOne(orderId, {});
      setOrder(resp);
      if (resp && resp.customer) {
        let respCustomer = await getCustomer(resp.customer._id);
        getCartCustomer(resp);
        setCustomer(respCustomer);
      }
    }
  };

  const getCartItem = async () => {
    if (order && order.shoppingCart) {
      const listCart = await listCartItem(order.shoppingCart, {
        isDeleted: false,
        type: order.company.type,
        isComplement: true,
      });

      setCartItem(listCart);
    }

    if (order?.deliveryMan) {
      // Entregador para este pedido
      const respDeliveryMan = await listOneDeliveryMan(order.deliveryMan, {});
      if (respDeliveryMan && respDeliveryMan._id) {
        setDeliveryMan(respDeliveryMan);
      }
    }
  };

  const getCartCustomer = async (orderResp: any) => {
    try {
      if (orderResp && orderResp.shoppingCart) {
        let respCartUser: any = await cartCustomer(orderResp.shoppingCart, {
          delivery: 'true',
          type: orderResp.company.type,
        });
        if (respCartUser) {
          setCartUser(respCartUser);
        }
      }
    } catch (_err) {
      //
    }
  };

  const changeStatus = async (status: string) => {
    // console.log('changeStatus', status);

    setBtnProcess(true);
    let isValid: boolean = false;

    if (status === 'IN_PREPARATION') {
      // Pedido Agendados ?
      let resp = await scheduleActive(order.shoppingCart, {});
      if (resp && resp.active && resp.active === true) {
        setBtnProcess(false);
        return Alert.alert(
          'Aceitar Pedidos',
          'Pedidos Agendados só podem ser aceitos no mesmo dia da entrega',
        );
      }

      isValid = cartItem.every((element: any, _index) => {
        return (element.shopperCheck && element.shopperCheck) === true;
      });
    }

    if (status === 'FINISH_PREPARATION' || status === 'WAIT_DELIVERYMAN') {
      if (!cartItem) {
        Alert.alert('Oops', 'Nenhum Item no Carrinho');
        return;
      }

      isValid = cartItem.every((element: any, _index) => {
        return (element.shopperCheck && element.shopperCheck) === true;
      });

      if (!isValid) {
        Alert.alert('Oops', 'Selecione todos os itens');
        setBtnProcess(false);
        return;
      }
    }

    const resp: any = await orderUpdateStatus(order._id, {
      shopper: user._id,
      status: status,
      acceptedDateShopper: currentDate(),
    });

    if (resp && resp.errMessage) {
      setBtnProcess(false);
      Alert.alert('Opps', resp.errMessage);
      return;
    }

    orderRequest();
    setBtnProcess(false);
    redirectHome(status);
  };

  const dispachPress = async (status: string) => {
    // console.log('Enviando para despachar');

    const isValid: boolean = cartItem.every((element: any, _index) => {
      return (element.shopperCheck && element.shopperCheck) === true;
    });

    if (!isValid) {
      Alert.alert('Oops', 'Selecione todos os itens');
      setBtnProcess(false);
      return;
    }

    setBtnProcess(true);

    const resp: any = await orderUpdateStatus(order._id, {
      shopper: user._id,
      status: status,
    });

    if (!resp) {
      Alert.alert(
        'Falha ao Atualizar',
        'Não conseguimos modificar o status do pedido atual',
      );
    }

    orderRequest();
    setBtnProcess(false);
  };

  const redirectHome = (status: string) => {
    if (status === 'WAIT_DELIVERYMAN') {
      console.log('Redirecionar para tela de Home');
    }
  };

  const checkItem = async (item: any) => {
    if (indexOrderStatus(order.status) > 2) {
      Alert.alert(
        'Oops',
        'Não é possível desmarcar um item já enviado para entrega',
      );
      return;
    }

    await updateItemCheck(user._id, {
      itemId: item._id,
    });

    getCartItem();
  };

  const itemCart = (item: any) => {
    let product = null;
    let disableDetail: boolean = true;

    if (item.product) {
      product = item.product;
    } else if (item.foodProduct) {
      product = item.foodProduct;
      disableDetail = false;
    }

    if (!product) {
      return product;
    }

    return (
      <View key={`${item._id}`} style={styles.cartItemContainer}>
        <View style={styles.cartItemProduct}>
          {order && order.status === 'IN_PREPARATION' ? (
            <>
              <View style={styles.productIcon}>
                <TouchableOpacity onPress={() => checkItem(item)}>
                  {item && item.shopperCheck ? (
                    <Icon name="radio-button-checked" size={25} />
                  ) : (
                    <Icon name="radio-button-unchecked" size={25} />
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          <TouchableOpacity
            style={styles.productImageContainer}
            disabled={disableDetail}
            onPress={() => modalDetailItens(item)}>
            <Image
              source={{ uri: product.images[0] }}
              resizeMode="contain"
              style={styles.productImage}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.productInfo}
            disabled={disableDetail}
            onPress={() => modalDetailItens(item)}>
            <Text style={styles.productName}>
              {item.amount} x {product.name}
            </Text>
            <Text style={styles.productPrice}>{totalItem(item)}</Text>
            {product?.complement ? (
              <Text style={styles.txtTouchComplent}>Ver Complementos</Text>
            ) : null}
          </TouchableOpacity>

          {/* {order && order.status === 'IN_PREPARATION' ? (
            <TouchableOpacity onPress={() => remove(item)}>
              <Icon name="clear" size={30} style={styles.iconAlert} />
            </TouchableOpacity>
          ) : null} */}
        </View>
      </View>
    );
  };

  const itensProduct = () => {
    try {
      let qtd = cartItem.length;
      let qtdMark = cartItem.reduce((total: number, item: any) => {
        if (item.shopperCheck) {
          total++;
        }
        return total;
      }, 0);

      return `${qtdMark} / ${qtd}`;
    } catch (err) {
      return '';
    }
  };

  // const remove = (item: any) => {
  //   setItemSelect(item);
  //   setModalConfirm(true);
  // };

  const totalItem = (item: any) => {
    let price = item.price;

    if (item?.check && item?.check.length > 0) {
      item.check.map((check: any) => {
        if (check?.price && check.price > 0) {
          price += Number(check.price);
        }
      });
    }

    if (item?.radio && item?.radio.length > 0) {
      item.radio.map((radio: any) => {
        if (radio?.price && radio.price > 0) {
          price += Number(radio.price);
        }
      });
    }

    return formatMoney(price);
  };

  const removeConfirmed = async () => {
    // setModalConfirm(false);
    // const resp = await deleteCartItem(user._id, itemSelect._id);
    // if (resp && resp.errMessage) {
    //   Alert.alert('Opps', resp.errMessage);
    //   return;
    // }
    // if (resp && resp.isDeleted && resp.isDeleted === true) {
    //   chatMessage({
    //     message: `Produto Removido ${itemSelect.product.name}`,
    //     shoppingCart: order.shoppingCart,
    //     personId: user._id,
    //     person: 'shopper',
    //     personSendId: order.customer._id,
    //     personSend: 'customer',
    //   });
    //   orderRequest();
    // }
  };

  const addProduct = () => {
    try {
      if (order.status !== 'IN_PREPARATION') {
        return;
      }

      navigation.navigate('Product', {
        order: order,
      });
    } catch (err) {
      console.log('Falha ao Abrir Product', err);
    }
  };

  const modalDetailItens = (item: any) => {
    setTimeout(() => {
      setItemCurrent(item);
    }, 300);
    setModalDetailRestaurant(true);
  };

  const closeModalChat = () => {
    setTotalMessage(0);
    setChatModal(false);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={chatModal}
          onRequestClose={() => closeModalChat()}>
          <Chat
            close={setChatModal}
            shopper={user}
            customer={customer}
            order={order}
            totalMessage={setTotalMessage}
          />
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalConfirm}
          onRequestClose={() => setModalConfirm(false)}>
          <RemoveItem modal={setModalConfirm} onConfirm={removeConfirmed} />
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalDetailRestaurant}
          onRequestClose={() => setModalDetailRestaurant(false)}>
          <ModalDetailRestaurant
            modal={setModalDetailRestaurant}
            cartItem={itemCurrent}
          />
        </Modal>

        <CustomRoundedHeader
          title={'Cliente'}
          subtitle={customer?.person?.name}
          avatarImg={require('../../assets/images/user_default-2.jpg')}>
          {(order && order.status === 'IN_PREPARATION') ||
            order.status === 'WAIT_DELIVERYMAN' ? (
            <TouchableOpacity onPress={() => setChatModal(true)}>
              {totalMessage && totalMessage > 0 ? (
                <View style={styles.contentBadgeMessage}>
                  <Text style={styles.badgeMessage}>{totalMessage}</Text>
                </View>
              ) : null}
              <View style={styles.iconMessage}>
                <Icon name="mode-comment" size={30} color={'#fff'} />
              </View>
            </TouchableOpacity>
          ) : null}
        </CustomRoundedHeader>

        <View style={styles.content}>
          {order && order.status ? (
            <View style={styles.containerStatus}>
              <OrderTabs status={order.status} />
            </View>
          ) : null}

          {order && order?.order_number ? (
            <View style={styles.viewInformation}>
              <View style={styles.viewNumberOrder}>
                <Text style={styles.txtTitleOrder}>N° Pedido: </Text>
                <Text style={styles.txtNumberOrder}>{order.order_number}</Text>
              </View>

              <View style={styles.viewNumberOrder}>
                <Text style={styles.txtTitleOrder}>Pagamento: </Text>
                <Text style={styles.txtNumberOrder}>
                  {orderItem?.methodPayment}
                </Text>
              </View>

              <View style={styles.viewNumberOrder}>
                <Text style={styles.txtTitleOrder}>Tipo Entrega: </Text>
                <Text style={styles.txtNumberOrder}>
                  {orderItem?.deliveryType}
                </Text>
              </View>
            </View>
          ) : null}

          {deliveryMan && deliveryMan?.person && deliveryMan?.person?.name ? (
            <View style={styles.viewInformation}>
              <View style={styles.viewNumberOrder}>
                <Text style={styles.txtTitleOrder}>Entregador: </Text>
                <Text style={styles.txtNumberOrder} numberOfLines={1}>
                  {deliveryMan?.person?.name}
                </Text>
              </View>

              <View style={styles.viewInfo50}>
                <View style={styles.viewInfoText}>
                  <Text style={styles.txtTitleOrder}>Telefone: </Text>
                  <Text style={styles.txtNumberOrder} numberOfLines={1}>
                    {deliveryMan?.phone}
                  </Text>
                </View>
                <View style={styles.viewInfoText}>
                  <Text style={styles.txtTitleOrder}>Veiculo: </Text>
                  <Text style={styles.txtNumberOrder} numberOfLines={1}>
                    {deliveryMan?.typeOfVehicle}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {order && order.status ? (
            <>
              <View style={styles.txtOrder}>
                <Text style={styles.listOrderTxt}>Lista do Pedido</Text>
                <Text style={styles.listOrderQtd}>Itens: {itensProduct()}</Text>
              </View>
              <View style={[styles.cardContainer]}>
                {cartItem && cartItem.length > 0
                  ? cartItem.map((item: any) => {
                    return itemCart(item);
                  })
                  : null}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.finalized}>
        {order && order.company && order.company.type === 'supermarket' ? (
          <OrderStatusBtn
            status={order.status}
            typeSchedule={order?.typeSchedule || null}
            cartItem={cartItem}
            cartUser={cartUser}
            onPress={changeStatus}
            load={btnProcess}
            onAdd={addProduct}
            dispachPress={dispachPress}
            isDispach={isDispatch}
          />
        ) : null}

        {order && order.company && order.company.type === 'restaurant' ? (
          <OrderStatusRestaurantBtn
            status={order.status}
            typeSchedule={order?.typeSchedule || null}
            cartItem={cartItem}
            cartUser={cartUser}
            onPress={changeStatus}
            load={btnProcess}
            dispachPress={dispachPress}
            isDispach={isDispatch}
          />
        ) : null}
      </View>
    </>
  );
};

const mapStateToProps = ({ authUser }: any) => {
  return {
    user: authUser?.user ?? {},
  };
};

export default connect(mapStateToProps)(Order);
