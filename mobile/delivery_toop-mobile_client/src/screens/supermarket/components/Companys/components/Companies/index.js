import React from 'react';

import { Container, ViewHeader, TextHeader, Line } from './Styles';
import CardCompany from '../CardCompany';

const Companies = ({
  notResult,
  companies,
  navigation,
  guestAddress,
  customerAddress,
}) => {
  if (notResult || !(companies && companies.length > 0)) {
    return null;
  }

  return (
    <Container>
      <ViewHeader>
        <TextHeader>DELIVERY</TextHeader>
        <Line />
      </ViewHeader>
      {companies.map(item => (
        <CardCompany
          item={item}
          key={item._id}
          navigation={navigation}
          guestAddress={guestAddress}
          customerAddress={customerAddress}
        />
      ))}
    </Container>
  );
};

export default Companies;
