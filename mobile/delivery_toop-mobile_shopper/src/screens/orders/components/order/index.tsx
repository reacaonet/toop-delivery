/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback} from 'react';
import {FlatList, Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import CheckBox from '@react-native-community/checkbox';
import {
  styles,
  Container,
  Contain,
  AvatarContain,
  Avatar,
  TextContain,
  Text,
  SubText,
  Image,
  PriceText,
  PriceSmallText,
  SubContain,
  TextSubContain,
  TextAndImage,
  ImageContain,
  ImageMessage,
  TitleList,
  Footer,
  ButtonFooter,
  TextButtonFooter,
  ButtonCenter,
  TextButtonCenter,
  List,
  TextView,
  TextList,
  Check,
  ViewContent,
  ImageX,
  Icon,
  ViewImage,
  TouchMsg,
  ContentTabs,
  TextCancel,
  ComplementText,
} from './styles';
import {useNavigation} from '@react-navigation/native';

/** Components */
import OrderTabs from '../../../order/orderTabs';

/** Service */
import {listCartItem} from '../../../../services/provider/shopping/cartItem';
import {listOneDeliveryMan} from '../../../../services/provider/person/deliveryman';
import {scheduleActive} from '../../../../services/provider/shopping/cart/schedule';
import {
  orderUpdateStatus,
  cancelPayment,
} from '../../../../services/provider/shopping/order';
import getCustomer from '../../../../services/provider/person/customer';

/** Util */
import {formatMoney, maskRealBeautify} from '../../../../utils';

const Order: React.FC = ({navigation, route}: any) => {
  const {navigate} = useNavigation();
  const {
    authUser: {user = null},
  }: any = useSelector((state) => state);

  const {name, order = null} = route.params;
  const [check, setCheck] = useState(false);
  const [cartItem, setCartItem] = useState<any>([]);
  const [deliveryMan, setDeliveryMan]: any = useState(null);
  const [customer, setCustomer]: any = useState({});

  useFocusEffect(
    useCallback(() => {
      if (order && order._id) {
        getCartItem();

        getCustomer(order?.customer?._id || order?.customer).then(
          (response) => {
            if (response && response._id) {
              setCustomer(response);
            }
          },
        );
      }
    }, [order]),
  );

  const getCartItem = async () => {
    if (order && order.shoppingCart) {
      const listCart = await listCartItem(order.shoppingCart, {
        isDeleted: false,
        type: 'restaurant',
        isComplement: true,
      });

      if (listCart && Array.isArray(listCart) && listCart.length > 0) {
        setCartItem(listCart);
      } else {
        setCartItem([]);
      }
    }

    if (order?.deliveryMan) {
      // Entregador para este pedido
      const respDeliveryMan = await listOneDeliveryMan(order?.deliveryMan, {});
      if (respDeliveryMan && respDeliveryMan._id) {
        setDeliveryMan(respDeliveryMan);
      }
    }
  };

  const acceptOrder = () => {
    Alert.alert(
      'Confirmação',
      'Deseja mesmo aceitar?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: () => AcceptedProgress(order),
        },
      ],
      {cancelable: false},
    );
  };

  const cancelOrderConfirm = () => {
    Alert.alert(
      'Confirmação',
      'Deseja mesmo cancelar ?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: () => cancelOrder(),
        },
      ],
      {cancelable: false},
    );
  };

  const AcceptedProgress = async (item: any) => {
    try {
      let resp = await scheduleActive(item.shoppingCart, {});

      if (resp && resp.active && resp.active === true) {
        return Alert.alert(
          'Aceitar Pedidos',
          'Pedidos Agendados só podem ser aceitos no mesmo dia da entrega',
        );
      }

      const respAccpt = await orderUpdateStatus(item._id, {
        shopper: user._id,
        status: 'IN_PREPARATION',
      });

      order.status = respAccpt?.status;

      navigation.navigate('Shopper', {
        screen: 'DetailDelivery',
        params: {
          order: order,
        },
      });
    } catch (err) {}
  };

  const cancelOrder = async () => {
    try {
      const resp = await cancelPayment(order?._id);

      if (resp && resp.errMessage) {
        return Alert.alert('Solicitação', resp.errMessage);
      }

      return navigation.navigate('Orders');
    } catch (err) {}
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

  const priceItem = (item: any) => {
    let total = item?.foodProduct?.price ?? 0;

    // item?.foodProduct?.complement.map((i: any, index: any) => {
    //   total = total + (i.price ?? 0);
    // });

    return total;
  };

  return (
    <Container>
      <Contain>
        <AvatarContain>
          <Avatar source={require('../../../../assets/images/men.png')} />
          <TextContain>
            <Text>Cliente:</Text>
            <SubText numberOfLines={1}>
              {customer?.person?.name || customer?.person?.phone}
            </SubText>
          </TextContain>
        </AvatarContain>

        {customer &&
        customer?.person &&
        order &&
        order?.status !== 'WAIT_COMPANY' ? (
          <TouchMsg onPress={() => navigate('Chat')}>
            <ImageMessage
              source={require('../../../../assets/images/msg.png')}
            />
          </TouchMsg>
        ) : null}
      </Contain>
      {/* <Image source={require('../../../../assets/images/line.png')} /> */}

      <ContentTabs>
        <OrderTabs status={order?.status} />
      </ContentTabs>

      <SubContain>
        <TextSubContain style={{flex: 1}}>{order?.statusText}</TextSubContain>

        <TextAndImage onPress={() => cancelOrderConfirm()}>
          <ImageContain
            resizeMode="contain"
            source={require('../../../../assets/images/delete.png')}
          />
          <TextCancel>CANCELAR</TextCancel>
        </TextAndImage>
      </SubContain>

      <TitleList>Itens: {itensProduct()}</TitleList>

      <FlatList
        data={cartItem}
        style={{paddingLeft: 15, paddingRight: 15}}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item._id}
        renderItem={({item}: any) => (
          <List>
            <Check>
              <CheckBox
                value={check}
                boxType={'circle'}
                style={styles.checkStyle}
                tintColors={{true: '#992326', false: 'gray'}}
                onValueChange={() => setCheck(!check)}
              />
            </Check>

            <ViewContent>
              {item?.images &&
              Array.isArray(item?.images) &&
              item.images.length > 0 ? (
                <Icon
                  source={{
                    uri: item.images[0],
                  }}
                />
              ) : null}
              <TextView>
                <TextList>
                  <PriceText>x{item.amount}</PriceText>
                  {` ${item.name.trim()} `}
                  <PriceText>
                    (R$ {maskRealBeautify(priceItem(item), true)})
                  </PriceText>
                </TextList>

                {item?.foodProduct?.complement &&
                Array.isArray(item?.foodProduct?.complement) &&
                item?.foodProduct?.complement.length > 0
                  ? item?.foodProduct?.complement.map((complement: any) => {
                      return (
                        <ComplementText key={`${Math.random()}`}>
                          {complement.quantity ? (
                            <>{`${complement.quantity} - `}</>
                          ) : (
                            <>+ </>
                          )}
                          {`${complement.name.trim()} `}
                          <PriceSmallText>
                            (R${' '}
                            {complement.price
                              ? maskRealBeautify(complement.price, true)
                              : '-'}
                            )
                          </PriceSmallText>
                          {', '}
                        </ComplementText>
                      );
                    })
                  : null}
              </TextView>
            </ViewContent>

            <ViewImage onPress={() => {}}>
              <ImageX
                source={require('../../../../assets/images/deleted.png')}
              />
            </ViewImage>
          </List>
        )}
      />

      <Footer>
        <ButtonFooter>
          <TextButtonFooter>
            {maskRealBeautify(order?.payment?.total || 0, true, 'R$')}
          </TextButtonFooter>
        </ButtonFooter>

        <ButtonCenter onPress={() => acceptOrder()}>
          <TextButtonCenter>Aceitar</TextButtonCenter>
        </ButtonCenter>

        <ButtonFooter>
          {/* <TextButtonFooter>Novo item</TextButtonFooter> */}
        </ButtonFooter>
      </Footer>
    </Container>
  );
};

export default Order;
