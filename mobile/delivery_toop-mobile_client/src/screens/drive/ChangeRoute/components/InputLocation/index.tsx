/* eslint-disable prettier/prettier */
import React, { memo } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

/* Styles*/
import { Colors } from '../../../../../styles';

/** Styles */
import { Container, Title, CloseContainer } from './styles';

const InputLocation = ({ placeholder, key, setShowModal, disabled = false, btClose = false, btnCloseClick }: any) => {
  return (
    <Container key={key ? key : Math.random()} activeOpacity={0.8} onPress={() => setShowModal(true)} disabled={disabled}>
      <Title numberOfLines={1} >{placeholder}</Title>

      {btClose ? (
        <CloseContainer onPress={btnCloseClick}>
          <Icon name="close" size={20} color={Colors.BLACK} />
        </CloseContainer>
      ) : null}
    </Container>
  );
};

export default memo(InputLocation);
