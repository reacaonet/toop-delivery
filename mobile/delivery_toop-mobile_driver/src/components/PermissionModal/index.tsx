import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import styled from 'styled-components/native';

interface ModalProps {
  isVisible: boolean;
  title: string;
  description: string;
  confirmButtonColor: string;
  cancelButtonColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PermissionModalComponent = ({
  isVisible,
  title,
  description,
  confirmButtonColor,
  cancelButtonColor,
  onConfirm,
  onCancel,
}: ModalProps) => {
  const screen = Dimensions.get('screen');

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      style={{ alignSelf: 'center' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Container
          style={{
            minHeight: screen.height * 0.4,
            width: screen.width * 0.9,
            shadowColor: 'black',
            shadowOpacity: 0.5,
            shadowRadius: 10,
            shadowOffset: {
              width: 0,
              height: 10,
            },
          }}>
          <Title>{title}</Title>
          <Description>{description}</Description>
          <ButtonContainer>
            <Button buttonColor={confirmButtonColor} onPress={onConfirm}>
              <ButtonText>Permitir</ButtonText>
            </Button>
            <Button buttonColor={cancelButtonColor} onPress={onCancel}>
              <ButtonText>Não quero usar o app agora</ButtonText>
            </Button>
          </ButtonContainer>
        </Container>
      </View>
    </Modal>
  );
};

export default PermissionModalComponent;

const Container = styled.View`
  background-color: white;
  padding: 27px;
  elevation: 5;
  border-radius: 13px;
  justify-content: space-between;
`;

const Title = styled.Text`
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Description = styled.Text`
  font-size: 18px;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.View``;

const Button = styled.TouchableOpacity`
  background-color: ${(props: { buttonColor: string }) =>
    props.buttonColor || '#ddd'};
  padding: 12px;
  border-radius: 12px;
  margin-top: 12px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  text-align: center;
  font-size: 17px;
`;
