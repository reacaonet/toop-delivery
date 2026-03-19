import styled from 'styled-components/native';

export const Container = styled.View``;

export const ModalContent = styled.View`
  background: #fff;
  height: 180px;
  border-radius: 10px;
  padding: 15px 20px;
  align-items: center;
  justify-content: center;
`;

export const ModalTitle = styled.Text`
  margin-top: -40px;
  color: #972c1b;
  font-size: 22px;
  letter-spacing: 1px;
  font-weight: bold;
  text-transform: uppercase;
`;

export const ModalDescription = styled.Text`
  margin-top: 4px;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.8);
`;

export const ModalButtonWrapper = styled.View`
  margin-top: auto;
  width: 90%;
  height: 40px;
`;

export const ModalButton = styled.TouchableOpacity`
  border-radius: 20px;
  border: 2px solid #c3c3c3;
  flex: 1;
`;

export const ModalButtonText = styled.Text`
  margin: auto;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.8);
`;
