import React, {Component} from 'react';
import FastImage from 'react-native-fast-image';
import {
  ViewItem,
  ViewBoxName,
  ViewTxtPercent,
  TxtPercent,
  TxtNameProd,
  TxtDescriptProd,
  ViewPrice,
  TxtPrice,
  TxtPricePromotion,
  BoxImage,
  TxtTotalflavor,
} from './Styles';

import {formatMoney} from '../../../../../utils';
import {calcDiscountPercent} from '../../../../../utils/screens/product';

const noImage = require('../../../../../assets/images/product/no_image.png');

class Size extends Component {
  constructor(props) {
    super(props);
    this.getMinimumPrice = this.getMinimumPrice.bind(this);

    this.state = {
      title: this.props.title,
      details: this.props.details,
      category: this.props.category,
      minimumPrice: this.getMinimumPrice(),
    };
  }

  getMinimumPrice() {
    const {products, title} = this.props;

    const prices = products.map(item => {
      const price = item.pricesSizesPizzas.find(i => i.name === title.name);

      if (price) {
        return price.price;
      } else {
        return 0;
      }
    });

    if (prices.length > 0) {
      return prices.sort((a, b) => {
        return a - b;
      })[0];
    } else {
      return 0;
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    if (this.state.minimumPrice > 0) {
      return (
        <ViewItem
          onPress={() =>
            this.state.details(this.state.category, this.state.title)
          }>
          <ViewBoxName>
            <TxtNameProd>
              {this.state.title.name && this.state.title.name.length > 0
                ? `${this.state.title.name.toUpperCase()}`
                : ''}{' '}
              (
              {`${this.state.title.pieces}` === '1'
                ? '1 pedaço'
                : `${this.state.title.pieces} pedaços`}
              )
            </TxtNameProd>

            <ViewPrice>
              <TxtPrice>
                {this.state.minimumPrice > 0
                  ? `A partir de ${formatMoney(this.state.minimumPrice)} `
                  : ''}
                <TxtTotalflavor>
                  até{' '}
                  {`${this.state.title.flavors}` === '1'
                    ? '1 sabor'
                    : `${this.state.title.flavors} sabores`}
                </TxtTotalflavor>
              </TxtPrice>
            </ViewPrice>
          </ViewBoxName>
        </ViewItem>
      );
    } else {
      return <></>;
    }
  }
}

export default Size;
