import React, {useEffect} from 'react';
import LootieView from 'lottie-react-native';
import {styles, Container, Header, Content, Title} from './styles';
import animatedMessage from '../../../assets/animations/message.json';

const NewMessage = ({modal, setModal}) => {
  useEffect(() => {
    setTimeout(() => {
      setModal(false);
    }, 4000);
  }, [setModal]);

  return (
    <Container
      transparent
      animationType="slide"
      visible={modal}
      onRequestClose={() => setModal(false)}>
      <Header onPress={() => setModal(false)} />
      <Content>
        <Title>Nova Mensagem</Title>
        <LootieView
          source={animatedMessage}
          style={styles.lottieStyle}
          resizeMode="contain"
          loop
          autoPlay
        />
      </Content>
    </Container>
  );
};

export default NewMessage;
