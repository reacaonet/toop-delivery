import React from 'react';
import FastImage from 'react-native-fast-image';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {
  Container,
  Content,
  ViewImage,
  ImageFast,
  TextImage,
  ViewData,
  TextCompany,
  ViewInfo,
  ViewInfoLine,
  ViewInfoItem,
  TextInfo,
  Image,
  Footer,
  TextFooter,
} from './Styles';

import {formatMoney} from '../../../../../../utils';
import distanteFormat from '../../../../../../services/maps/distanceCoordinate';

const CardCompany = ({item, navigation, guestAddress, customerAddress}) => {
  const {configurations = null} = useSelector(state => state);

  const place = require('./images/place.png');
  const deliveryFree = require('./images/deliveryFree.png');
  const priceDelivery = require('./images/deliveryPrice.png');
  const withdrawOnSite = require('./images/withdrawOnSite.png');
  const {t} = useTranslation();

  const txtDistante = company => {
    let companyCoord = null;
    let userCoord = null;

    if (company.location && company.location.coordinates) {
      companyCoord = company.location.coordinates;
    }

    if (guestAddress && guestAddress.location) {
      userCoord = guestAddress.location.coordinates;
    } else if (
      customerAddress.location &&
      customerAddress.location.coordinates
    ) {
      userCoord = customerAddress.location.coordinates;
    }

    let distance;

    if (companyCoord && userCoord) {
      distance = distanteFormat(
        {
          latitude: userCoord[1],
          longitude: userCoord[0],
        },
        {
          latitude: companyCoord[1],
          longitude: companyCoord[0],
        },
      );
    }

    return distance;
  };

  const deliveryPrice = price => {
    try {
      if (price > 0) {
        return `${formatMoney(price, configurations?.coin)}`;
      }
      return 'Grátis';
    } catch (err) {
      return '';
    }
  };

  const getDeliveryFree = distance => {
    if (!distance) {
      return false;
    }

    const result = distance.filter(d => d.minPriceDeliveryFree);

    return result.length > 0;
  };

  const getValueDeliveryFree = distance => {
    if (!distance) {
      return false;
    }

    const result = distance.filter(d => d.minPriceDeliveryFree);

    return result[0].minPriceDeliveryFree.toFixed(0);
  };

  const goCompany = company => {
    navigation.replace('Product', {
      company,
    });
  };

  return (
    <Container haveCoupon={item.cupom} onPress={() => goCompany(item)}>
      <Content haveCoupon={item.cupom}>
        <ViewImage>
          <ImageFast
            source={{
              uri: item.images[0],
              priority: FastImage.priority.normal,
            }}
            isClosed={!item.companyDelivery?.isOpen}
            resizeMode={FastImage.resizeMode.contain}
          />
          {item.companyDelivery?.isOpen === false ? (
            <TextImage>Fechado</TextImage>
          ) : null}
        </ViewImage>
        <ViewData>
          <TextCompany>{item.name}</TextCompany>
          <ViewInfo>
            <ViewInfoLine>
              <ViewInfoItem>
                <Image resizeMode="contain" source={place} />
                <TextInfo>{txtDistante(item)}</TextInfo>
              </ViewInfoItem>
              {getDeliveryFree(item.companyDelivery?.distance) && (
                <ViewInfoItem>
                  <Image resizeMode="contain" source={deliveryFree} />
                  <TextInfo>
                    Acima de {configurations?.coin}{' '}
                    {getValueDeliveryFree(item.companyDelivery?.distance)}
                  </TextInfo>
                </ViewInfoItem>
              )}
            </ViewInfoLine>
            <ViewInfoLine>
              <ViewInfoItem>
                <Image resizeMode="contain" source={priceDelivery} />
                <TextInfo>{deliveryPrice(item.deliveryPrice)}</TextInfo>
              </ViewInfoItem>
              {item.companyDelivery?.withdrawMarket && (
                <ViewInfoItem>
                  <Image resizeMode="contain" source={withdrawOnSite} />
                  <TextInfo>Retirar no local</TextInfo>
                </ViewInfoItem>
              )}
            </ViewInfoLine>
          </ViewInfo>
        </ViewData>
      </Content>
      {item.cupom ? (
        <Footer>
          <TextFooter>
            Cupom de {configurations?.coin} {item.cupom} disponível
          </TextFooter>
        </Footer>
      ) : null}
    </Container>
  );
};

export default CardCompany;
