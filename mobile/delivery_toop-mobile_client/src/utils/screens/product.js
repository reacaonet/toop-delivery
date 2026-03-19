import {formatMoney, maskRealBeautify} from '../index';

const calcDiscount = (priceNormal, pricePromotion) => {
  const dif = priceNormal - pricePromotion;
  return `Poupe ${formatMoney(dif)}`;
};

const calcDiscountPercent = (priceNormal, pricePromotion) => {
  const dif = priceNormal - pricePromotion;
  const percent = ((dif * 100) / priceNormal).toFixed(0);
  return `${percent}%`;
};

const deliveryPrice = (item, text = '', Symbol = null) => {
  try {
    if (!item || (!item.deliveryPrice && item.deliveryPrice !== 0)) {
      return '';
    }

    // frete gratis
    if (item?.companyDelivery?.shippingInfo?.freeShipping) {
      if (
        item?.companyDelivery?.shippingInfo?.freeShippingAbove === null ||
        item?.companyDelivery?.shippingInfo?.freeShippingAbove === 0
      ) {
        return 'Entrega Grátis';
      } else {
        return `Entrega grátis para compras acima de ${formatMoney(
          item?.companyDelivery?.shippingInfo?.freeShippingAbove,
          Symbol,
        )}\n\n`;
      }
    }

    let price = item.deliveryPrice;
    if (price > 0) {
      return `${text} ${formatMoney(price, Symbol)}`;
    }
    return 'Entrega Grátis';
  } catch (err) {
    return '';
  }
};

const deliveryTime = (item, tag = true) => {
  try {
    if (item && item.deliveryTime) {
      return `Aprox. ${item.deliveryTime} min ${tag ? '-' : ''} `;
    }

    return '';
  } catch (err) {
    return '';
  }
};

const minPurchase = (item, text = 'Mínimo ') => {
  try {
    if (!item || !item.companyDelivery) {
      return '';
    }

    let min = item.companyDelivery?.min_purchase ?? 0;
    if (min === 0) {
      return '';
    }

    return `${text} ${maskRealBeautify(min, true)}`;
  } catch (err) {
    return '';
  }
};

const maxAmountItems = (item, textLeft = 'Max') => {
  try {
    if (!item || !item.companyDelivery) {
      return '';
    }

    let max = item.companyDelivery?.max_amount_items ?? 0;
    if (max === 0) {
      return '';
    }

    return `${textLeft} ${max} itens`;
  } catch (err) {
    return '';
  }
};

export {
  calcDiscount,
  calcDiscountPercent,
  deliveryPrice,
  deliveryTime,
  minPurchase,
  maxAmountItems,
};
