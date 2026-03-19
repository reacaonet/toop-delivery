import React from 'react';

import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {
  styles,
  ContainIndex,
  Area,
  R,
  LongText,
  ImageEmpresa,
  SubText,
  Numb,
  ContainPrice,
  Text,
  Container,
  TextFooter,
  ContainFooter,
  TextContainFooter,
} from './styles';

/* import Pag from './components/index' */
import {useNavigation} from '@react-navigation/native';

const CashBack = () => {
  const navigation = useNavigation();
  const {configurations = null} = useSelector(state => state);
  const {t} = useTranslation();

  return (
    <ContainIndex>
      {/*  Header */}
      <Area>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      </Area>

      <ImageEmpresa
        source={require('../../../assets/images/cashback.png')}
        resizeMode="contain"
      />
      <SubText>CashBack</SubText>
      <LongText>
        Toda vez que efetuar pagamento o pelo{'\n'}Toop, você receberá 2% do
        valor em{'\n'}créditos para ser usado em outra viagem.
      </LongText>

      <Container>
        <ContainPrice>
          <Text>Saldo</Text>
          <Numb>
            {' '}
            <R>{configurations?.coin}</R> 3,75
          </Numb>
        </ContainPrice>
      </Container>
      <TextFooter>
        A cada {configurations?.coin} 10,00 somados{'\n'}pelo cashback o valor é
        convertido em{'\n'}
        créditos e transferidos para a carteira.
      </TextFooter>

      <ContainFooter>
        <TextContainFooter>
          Cancelamentos fora do prazo terão saldo de{'\n'}créditos abatidos
          podendo ficar negativo.
        </TextContainFooter>
      </ContainFooter>
    </ContainIndex>
  );
};

export default CashBack;
