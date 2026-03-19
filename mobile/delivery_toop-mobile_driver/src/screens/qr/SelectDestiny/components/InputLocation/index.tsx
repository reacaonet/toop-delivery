/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { memo } from 'react';

/** Styles */
import { Container, Title } from './styles';

const InputLocation = ({ placeholder, key, setShowModal }: any) => {
  return (
    <Container key={key ? key : Math.random()} activeOpacity={0.8} onPress={() => setShowModal(true)} >
      <Title numberOfLines={1} >{placeholder}</Title>
    </Container>
  );
};

export default memo(InputLocation);
