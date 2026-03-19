import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {
  Container,
  ContainerText,
  Text,
  SubText,
  Border,
  Button,
  ButtonContain,
  ButtonContainText,
} from './styles';

// import { Container } from './styles';
import {useNavigation} from '@react-navigation/native';

const History = () => {
  const navigation = useNavigation();
  const {configurations = null} = useSelector(state => state);
  const {t} = useTranslation();

  return (
    <View>
      {/* CONTAINER 2 */}
      <Container>
        <ContainerText>
          <Text>Qui, 24 de abr.</Text>
          <Text style={{color: '#000'}}>{configurations?.coin} 30,05</Text>
        </ContainerText>

        <ContainerText>
          <SubText>13:23 - 14:07</SubText>
          <SubText style={{color: '#000'}}>
            Gorjeta {configurations?.coin} 5,00
          </SubText>
        </ContainerText>

        <Border />
        <Button>
          <ButtonContain>
            <ButtonContainText>Volkswagen Gol Cinza QQK-8645</ButtonContainText>
          </ButtonContain>
        </Button>
      </Container>
      {/* FIM CONTAINER 2 */}

      {/* CONTAINER 2 */}
      <Container>
        <ContainerText>
          <Text>Sáb, 19 de abr.</Text>
          <Text style={{color: '#000'}}>{configurations?.coin} 24,40</Text>
        </ContainerText>

        <ContainerText>
          <SubText>13:23 - 14:07</SubText>
          <SubText style={{color: '#000'}}>
            Gorjeta {configurations?.coin} 5,00
          </SubText>
        </ContainerText>

        <Border />
        <Button>
          <ButtonContain onPress={() => navigation.navigate('Email')}>
            <ButtonContainText>Volkswagen Gol Cinza QQK-8645</ButtonContainText>
          </ButtonContain>
        </Button>
      </Container>
      {/* FIM CONTAINER 2 */}

      {/* CONTAINER 2 */}
      <Container>
        <ContainerText>
          <Text>Sáb, 18 de abr.</Text>
          <Text style={{color: '#000'}}>{configurations?.coin} 33,00</Text>
        </ContainerText>

        <ContainerText>
          <SubText>13:23 - 14:07</SubText>
          <SubText style={{color: '#000'}}>
            Gorjeta {configurations?.coin} 5,00
          </SubText>
        </ContainerText>

        <Border />
        <Button>
          <ButtonContain onPress={() => navigation.navigate('Email')}>
            <ButtonContainText>Volkswagen Gol Cinza QQK-8645</ButtonContainText>
          </ButtonContain>
        </Button>
      </Container>
      {/* FIM CONTAINER 2 */}
    </View>
  );
};

export default History;
