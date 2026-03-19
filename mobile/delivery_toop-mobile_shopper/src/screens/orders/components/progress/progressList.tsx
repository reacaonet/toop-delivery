/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {View} from 'react-native';

import {
  Container,
  Contain,
  AvatarContain,
  Avatar,
  TextContain,
  Text,
  SubText,
  Image,
  ImageItem,
  SubContain,
  TextSubContain,
  TextTotalMessage,
  // ImageContain,
  ImageMessage,
  DetailsView,
  LisView,
  Number,
  AmountText,
  PriceText,
  PriceSmallText,
  ComplementText,
  ObsText,
  TextData,
  Status,
  Total,
  Credit,
  ViewAddress,
  House,
  Footer,
  TouchMsg,
  ContentTabs,
} from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';

/** Service */
import {listCartItem} from '../../../../services/provider/shopping/cartItem';

/** Components */
import OrderTabs from '../../../order/orderTabs';

/** Util */
import {Colors} from '../../../../styles';
import {
  formatDateLocal,
  formatMoney,
  maskRealBeautify,
} from '../../../../utils';

const ProgressList: React.FC<any> = ({order, customer, totalMessage}: any) => {
  const {navigate} = useNavigation();
  const {
    authUser: {user = null},
  }: any = useSelector((state) => state);
  const route = useRoute<any>();

  const [cartItem, setCartItem] = useState<any>([]);

  useFocusEffect(
    useCallback(() => {
      if (order && order?._id) {
        getCartItem();
      }
    }, [order?._id]),
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
            {(order && order?.status === 'ACCEPT_DELIVERYMAN') ||
            order?.status === 'IN_PROGRESS_DELIVERYMAN' ? (
              <>
                <Text>Entregador:</Text>
                <SubText>-</SubText>
              </>
            ) : (
              <>
                <Text>Cliente:</Text>
                <SubText>
                  {customer?.person?.name || customer?.person?.phone}
                </SubText>
              </>
            )}
          </TextContain>
        </AvatarContain>

        {order &&
        (order?.status === 'ACCEPT_SHOPPER' ||
          order?.status === 'IN_PREPARATION' ||
          order?.status === 'WAIT_DELIVERYMAN') ? (
          <TouchMsg
            onPress={() =>
              navigate('Chat', {
                customer: customer,
                shopper: user,
                order: order,
                totalMessage: totalMessage,
              })
            }>
            {totalMessage && totalMessage > 0 ? (
              <TextTotalMessage>{totalMessage}</TextTotalMessage>
            ) : null}
            <ImageMessage
              source={require('../../../../assets/images/msg.png')}
            />
          </TouchMsg>
        ) : null}
      </Contain>

      <ContentTabs>
        <OrderTabs status={order?.status} />
      </ContentTabs>

      <SubContain>
        <TextSubContain>{order?.statusText}</TextSubContain>
      </SubContain>

      <DetailsView>
        <Number style={{flex: 1}}>Numero: {order?.order_number}</Number>
        <TextData>
          Data: {formatDateLocal(order?.createdAt, 'DD/MM/YYYY HH:mm')}
        </TextData>
        {/* <Status>
          TIPO DE PEDIDO:{' '}
          {order?.typeSchedule === 'DELIVERY'
            ? 'PARA ENTREGAR'
            : 'PARA RETIRADA'}
        </Status> */}
      </DetailsView>

      {cartItem && Array.isArray(cartItem) && cartItem.length > 0
        ? cartItem.map((item) => {
            const image =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : '';
            return (
              <LisView key={`${item?._id}`}>
                {image ? <ImageItem source={{uri: image}} /> : <ImageItem />}

                <View style={{flexDirection: 'column'}}>
                  <AmountText>
                    <PriceText>x{item.amount}</PriceText>
                    {` ${item.name.trim()} `}
                    <PriceText>
                      (R$ {maskRealBeautify(priceItem(item), true)})
                    </PriceText>
                  </AmountText>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}>
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
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      paddingLeft: 10,
                    }}>
                    {item?.comment ? (
                      <ComplementText style={{marginTop: 5}}>
                        <ObsText>Obs:</ObsText>12321
                      </ComplementText>
                    ) : null}
                  </View>
                </View>
              </LisView>
            );
          })
        : null}

      <Total>
        <TextSubContain>Infomações de pagamento</TextSubContain>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Number style={{marginTop: 10}}>Total:</Number>
          <Text style={{color: Colors.PRIMARY}}>
            {maskRealBeautify(route.params?.order?.payment?.total, true, 'R$')}
          </Text>
        </View>

        {route?.params?.order?.payment?.cashChange ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Number style={{marginTop: 10}}>Troco para:</Number>
            <Text style={{color: Colors.PRIMARY}}>
              {maskRealBeautify(
                route.params?.order?.payment?.cashChange ?? 0,
                true,
                'R$',
              )}
            </Text>
          </View>
        ) : null}

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Number style={{marginTop: 10}}>Pagamento:</Number>
          <Text style={{color: Colors.PRIMARY}}>
            {route.params?.order?.methodPayment}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Number style={{marginTop: 10}}>Tipo:</Number>
          <Text style={{color: Colors.PRIMARY}}>
            {route.params?.order?.deliveryType}
          </Text>
        </View>
      </Total>

      <ViewAddress>
        <TextSubContain>Endereço Cliente</TextSubContain>

        <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
          <Number style={{marginTop: 10}}>Endereço</Number>
          <Text style={{color: Colors.PRIMARY, marginLeft: 0}}>
            {customer?.customerDelivery?.addressRoute ??
              customer?.customerDelivery?.address ??
              '-'}
            {customer?.customerDelivery?.streetNumber
              ? `, nº ${customer?.customerDelivery?.streetNumber}`
              : ''}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Number style={{marginTop: 10}}>Tipo:</Number>
          <Text style={{color: Colors.PRIMARY}}>
            {customer?.customerDelivery?.category === 'HOME'
              ? 'Casa'
              : 'Trabalho'}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Number style={{marginTop: 10}}>Região/Bairro:</Number>
          <Text style={{color: Colors.PRIMARY}}>
            {route.params?.order?.customerDelivery?.district ??
              route.params?.order?.customerDelivery?.addressRegion ??
              '-'}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Number style={{marginTop: 10}}>Cidade:</Number>
          <Text style={{color: Colors.PRIMARY}}>
            {customer?.customerDelivery?.city ?? '-'}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Number style={{marginTop: 10}}>Complemento:</Number>
          <Text style={{color: Colors.PRIMARY}}>
            {customer?.customerDelivery?.complement ?? '-'}
          </Text>
        </View>
      </ViewAddress>
    </Container>
  );
};

export default ProgressList;
