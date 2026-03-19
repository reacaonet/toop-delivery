import {Alert} from 'react-native';
import React, {useState, useRef} from 'react';
import {TextInputMask} from 'react-native-masked-text';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {
  Container,
  Header,
  IconGoBack,
  HeaderText,
  Body,
  InputText,
  ViewInput,
  ViewButton,
  ButtonText,
  styles,
} from './Styles';

const PaymentMoney = ({close, navigation, total}) => {
  const {configurations = null} = useSelector(state => state);

  const {t} = useTranslation();
  const [change, setChange] = useState(0);
  const moneyCurrent = useRef(0);

  const getValue = () => {
    let moneyRaw = change;

    console.log('change', change);

    if (moneyRaw < 0) {
      Alert.alert('OPS!', 'O valor não pode ser negativo.');
      return;
    }

    if (moneyRaw === 0 || moneyRaw <= total) {
      Alert.alert(
        'OPS!',
        'O valor tem que ser maior do que o total da compra.',
      );
      return;
    }

    console.log('Tudo certo ....');
    close(false);
    navigation.navigate('Shopping', {
      screen: 'DetailPayment',
      params: {
        typePayment: 'MONEY',
        changeMoney: moneyRaw,
      },
    });
  };

  return (
    <Container>
      <Header>
        <IconGoBack onPress={() => close(false)}>
          <Icon name="navigate-before" size={50} style={styles.headerBefore} />
        </IconGoBack>
        <HeaderText>PAGAR COM DINHEIRO</HeaderText>
      </Header>
      <Body>
        <InputText>Enviar troco para:</InputText>
        <ViewInput>
          <TextInputMask
            type={'money'}
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: `${configurations?.coin} `,
              suffixUnit: '',
            }}
            includeRawValueInChangeText={true}
            value={change}
            onChangeText={(text, rawText) => {
              console.log('troco', rawText);
              setChange(rawText);
            }}
            ref={moneyCurrent}
            style={styles.input}
          />
        </ViewInput>
        <ViewButton enabled={true} onPress={() => getValue()}>
          <ButtonText enabled={true}>Continuar</ButtonText>
        </ViewButton>
      </Body>
    </Container>
  );
};

export default PaymentMoney;
