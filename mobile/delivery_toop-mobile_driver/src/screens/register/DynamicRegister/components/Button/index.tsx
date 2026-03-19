import React from 'react';
import { Colors } from '../../../../../styles';

/** Styles */
import { Container, Text, LoadIndicator } from './styles';

const Button = ({ text, textColor, color, onPress, load }: any) => {
  return (
    <Container color={color} onPress={onPress}>
      {!load ? (
        <Text textColor={textColor}>{text}</Text>
      ) : (
        <LoadIndicator color={Colors.WHITE} size="small" />
      )}
    </Container>
  );
};

export default Button;
