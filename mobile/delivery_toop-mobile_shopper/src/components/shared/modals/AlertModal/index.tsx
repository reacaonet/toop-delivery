import React from 'react';
import Modal from 'react-native-modal';
import LootieView from 'lottie-react-native';
import alertAnimation from '../../../../assets/animations/alert.json';
import {
  Container,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalButtonWrapper,
  ModalButton,
  ModalButtonText,
} from './styles';

interface ModalProps {
  title: string;
  description: string;
  modalIsVisible: boolean;
  onPress: Function;
}

const AlertModal: React.FC<ModalProps> = ({
  title,
  description,
  modalIsVisible,
  onPress,
}) => {
  return (
    <Container>
      <Modal isVisible={modalIsVisible}>
        <ModalContent>
          <LootieView
            source={alertAnimation}
            style={{marginTop: -35, height: 110}}
            autoPlay
            loop
          />
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
          <ModalButtonWrapper>
            <ModalButton {...{onPress}}>
              <ModalButtonText>OK</ModalButtonText>
            </ModalButton>
          </ModalButtonWrapper>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AlertModal;
