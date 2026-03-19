import React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {
  Container,
  ViewTotalsHorizontal,
  ViewTotalVertical,
  ViewLineTotal,
  TextTotals,
} from './Styles';

import {formatMoney} from '../../../../../utils';

const Totals = ({
  cart,
  subTotal,
  coupon,
  serviceCharge,
  deliveryPrice,
  minPriceDeliveryFree,
  shippingInfo,
}) => {
  const {configurations = null} = useSelector(state => state);
  const {t} = useTranslation();

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

  const getTotal = () => {
    let value = subTotal;

    const discount = getDiscount();

    if (discount > 0) {
      value += discount;
    }

    return formatMoney(value, configurations?.coin);
  };

  const getDeliveryFee = () => {
    // console.log(minPriceDeliveryFree);
    // if (subTotal > minPriceDeliveryFree) {
    //   return 0;
    // }

    return deliveryPrice;
  };

  const getFreeShippingBonus = () => {
    // frete gratis
    if (shippingInfo?.freeShipping) {
      if (
        shippingInfo?.freeShippingAbove === null ||
        shippingInfo?.freeShippingAbove === 0
      ) {
        return deliveryPrice;
      } else if (subTotal > shippingInfo?.freeShippingAbove) {
        return deliveryPrice;
      }
    } else {
      return 0;
    }
  };

  return (
    <Container>
      <ViewTotalsHorizontal>
        <ViewTotalVertical>
          <ViewLineTotal>
            <TextTotals>Subtotal:</TextTotals>
            <TextTotals> {getTotal()}</TextTotals>
          </ViewLineTotal>
          <ViewLineTotal>
            <TextTotals>Taxa de entrega:</TextTotals>
            <TextTotals>
              {' '}
              {formatMoney(getDeliveryFee(), configurations?.coin)}
            </TextTotals>
          </ViewLineTotal>
          {getFreeShippingBonus() > 0 ? (
            <ViewLineTotal>
              <TextTotals discount={true}>Bônus de entrega:</TextTotals>
              <TextTotals discount={true}>
                - {formatMoney(getFreeShippingBonus(), configurations?.coin)}
              </TextTotals>
            </ViewLineTotal>
          ) : null}

          <ViewLineTotal>
            <TextTotals>Taxa de serviço:</TextTotals>
            <TextTotals>
              {' '}
              {formatMoney(serviceCharge, configurations?.coin)}
            </TextTotals>
          </ViewLineTotal>
          <ViewLineTotal>
            <TextTotals discount={true}>Descontos:</TextTotals>
            <TextTotals discount={true}>
              - {formatMoney(getDiscount(), configurations?.coin)}
            </TextTotals>
          </ViewLineTotal>
          <ViewLineTotal>
            <TextTotals discount={true}>Cupons:</TextTotals>
            <TextTotals discount={true}>
              {coupon?.price
                ? `- ${formatMoney(coupon?.price, configurations?.coin)}`
                : `- ${configurations?.coin} 0,00`}
              , configurations?.coin
            </TextTotals>
          </ViewLineTotal>
        </ViewTotalVertical>
      </ViewTotalsHorizontal>
    </Container>
  );
};

export default Totals;
