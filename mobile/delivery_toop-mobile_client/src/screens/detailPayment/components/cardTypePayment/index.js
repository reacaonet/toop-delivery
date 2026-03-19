import React from 'react';
import FastImage from 'react-native-fast-image';
import {Container, ViewBody, TextName, ImageCard, TextCard} from './Styles';

const MoneyTypePayment = ({card, typeCard, paymentType, paymentsAccepted}) => {
  if (
    !paymentType ||
    (paymentType && paymentType !== 'CARD') ||
    !paymentsAccepted.find(i => i.type === 'CARD')
  ) {
    return null;
  }

  return (
    <Container>
      <ImageCard
        source={{
          uri: card.image[0],
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.stretch}
      />
      <ViewBody>
        <TextName>Pagamento com cartão na entrega</TextName>
        <TextCard>
          {card.name} - {typeCard}
        </TextCard>
      </ViewBody>
    </Container>
  );
};

export default MoneyTypePayment;
