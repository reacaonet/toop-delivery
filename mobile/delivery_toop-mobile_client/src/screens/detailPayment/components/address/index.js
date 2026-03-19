import React from 'react';

import {
  Body,
  Image,
  Header,
  HeaderBody,
  TextHeader,
  TextAddress,
  TextComplement,
  TextAddressType,
  TouchAddress,
} from './Style';

import imgAddress from './images/address.png';

const address = ({delivery, navigation}) => {
  if (!delivery) {
    return null;
  }

  const currentAddress = delivery => {
    const address = delivery ? delivery : delivery?.address;
    let strAddress = '';

    if (delivery?.addressRoute && delivery?.addressRoute.length > 3) {
      strAddress = delivery.addressRoute;

      if (delivery?.streetNumber) {
        strAddress += ` ${delivery?.streetNumber}`;
      }

      if (delivery?.city) {
        strAddress += ` ${delivery?.city}`;
      }

      if (delivery?.state) {
        strAddress += ` ${delivery?.state}`;
      }
    }

    return strAddress === '' ? address : strAddress;
  };

  const changeAddres = () => {
    navigation.navigate('Customer', {
      screen: 'CustomerAddress',
    });
  };

  return (
    <>
      <Header>
        <HeaderBody>
          <TextHeader>Local de entrega</TextHeader>
          <Image source={imgAddress} />
        </HeaderBody>
      </Header>
      <Body>
        <TextAddressType>Casa</TextAddressType>
        <TouchAddress onPress={() => changeAddres()}>
          <TextAddress>{currentAddress(delivery)}</TextAddress>
          <TextComplement>
            {delivery.complement ? delivery.complement : ''}
          </TextComplement>
        </TouchAddress>
      </Body>
    </>
  );
};

export default address;
