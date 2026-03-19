import React from 'react';
import {useSelector} from 'react-redux';

import {Container, ViewTotals, TotalsView, Text} from './Styles';
import {formatMoney} from '../../../../utils';

const Totals = ({
  tip,
  cart,
  coupon,
  subTotal,
  deliveryFee,
  typeSchedule,
  serviceCharge,
  minPriceDeliveryFree,
  useCashbackBalance,
  companyDelivery,
}) => {
  const {configurations = null} = useSelector(state => state);

  const getSubTotal = () => {
    let total = cart?.reduce(
      (accumulator, product) => accumulator + product.price * product.amount,
      0,
    );

    cart.map(itemCart => {
      if (
        itemCart.check &&
        Array.isArray(itemCart.check) &&
        itemCart.check.length > 0
      ) {
        itemCart.check.map(item => {
          if (item.price && item.price > 0) {
            total += Number(item.price);
          }
        });
      }

      if (
        itemCart.radio &&
        Array.isArray(itemCart.radio) &&
        itemCart.radio.length > 0
      ) {
        itemCart.radio.map(item => {
          if (item.price && item.price > 0) {
            total += Number(item.price);
          }
        });
      }
    });

    return total;
  };

  const getDiscount = () => {
    return cart?.reduce((accumulator, product) => {
      let discount = 0;

      if (product.pricePromotion && product.pricePromotion > 0) {
        discount = product.price - product.pricePromotion;
      }

      if (product.amount && product.amount > 1) {
        discount = discount * product.amount;
      }

      return accumulator + discount;
    }, 0);
  };

  const getCouponPrice = () => {
    if (!coupon || !coupon.price) {
      return 0;
    }

    return coupon.price;
  };

  const getDeliveryFee = () => {
    if (
      (!typeSchedule || typeSchedule === 'DELIVERY') &&
      minPriceDeliveryFree > 0 &&
      subTotal > minPriceDeliveryFree
    ) {
      return 'Grátis';
    } else if (typeSchedule && typeSchedule === 'WITHDRAWAL') {
      return 'Grátis';
    }

    return formatMoney(deliveryFee, configurations?.coin);
  };

  const getfreeShipping = () => {
    let subsidized = false; // bonificacao do frete
    if (companyDelivery?.shippingInfo?.freeShipping) {
      if (
        companyDelivery?.shippingInfo?.freeShippingAbove === null ||
        companyDelivery?.shippingInfo?.freeShippingAbove === 0
      ) {
        subsidized = true;
      } else if (subTotal > companyDelivery?.shippingInfo?.freeShippingAbove) {
        subsidized = true;
      }
    }
    return subsidized;
  };

  return (
    <Container>
      <ViewTotals>
        <TotalsView>
          <Text>SubTotal:</Text>
          <Text>{formatMoney(getSubTotal(), configurations?.coin)} (+)</Text>
        </TotalsView>
        <TotalsView>
          <Text>Gorjeta:</Text>
          <Text>{formatMoney(tip, configurations?.coin)} (+)</Text>
        </TotalsView>
        <TotalsView>
          <Text>Taxa de entrega:</Text>
          <Text
            isFree={getDeliveryFee() === 'Grátis'}
            style={
              getfreeShipping() === true
                ? {textDecorationLine: 'line-through'}
                : {}
            }>
            {getDeliveryFee()} (+)
          </Text>
        </TotalsView>
        {getfreeShipping() && getDeliveryFee() !== 'Grátis' ? (
          <TotalsView>
            <Text isFree={true}>Bônus de entrega:</Text>
            <Text isFree={true}>{getDeliveryFee()} ( - )</Text>
          </TotalsView>
        ) : null}
        <TotalsView>
          <Text>Taxa de serviço:</Text>
          <Text>{formatMoney(serviceCharge)} (+)</Text>
        </TotalsView>
        {useCashbackBalance > 0 ? (
          <TotalsView>
            <Text discount={true}>Cashback:</Text>
            <Text discount={true}>
              {formatMoney(useCashbackBalance, configurations?.coin)} (-)
            </Text>
          </TotalsView>
        ) : null}
        <TotalsView>
          <Text discount={true}>Descontos:</Text>
          <Text discount={true}>
            {formatMoney(getDiscount(), configurations?.coin)} ( - )
          </Text>
        </TotalsView>
        <TotalsView>
          <Text discount={true}>Cupons:</Text>
          <Text discount={true}>
            {formatMoney(getCouponPrice(), configurations?.coin)} ( - )
          </Text>
        </TotalsView>
      </ViewTotals>
    </Container>
  );
};

export default Totals;
