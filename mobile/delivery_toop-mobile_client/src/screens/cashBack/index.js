/* eslint-disable react-hooks/rules-of-hooks */
import React, {useState, useEffect} from 'react';
import {Image, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../styles';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {
  Container,
  ContainerScroll,
  Header,
  BalanceBox,
  Title,
  Footer,
  Currency,
  Balance,
  DescriptionOfBalance,
  TextDescription,
  CancelFooter,
  TextTitle,
  StatementBox,
  TitleStatment,
} from './styles';

/** Services */
import {
  cashBackMouthTotal,
  cashBackBalance,
} from '../../services/service/cashback/list';

/** Util */
import {formatMoney} from '../../utils';

const cashBack = ({navigation}) => {
  const user = useSelector(state => state?.user?.user);
  const {configurations = null} = useSelector(state => state);

  const {goBack} = useNavigation();
  const [money, setMoney] = useState(0);
  const {t} = useTranslation();

  useEffect(() => {
    if (user && user._id) {
      cashBackBalance(user._id).then(result => {
        if (!result || result.length <= 0) {
          return setMoney(0);
        }
        setMoney(result.balance);
      });
    }
  }, [user]);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Container>
        <Header>
          <Icon
            name="chevron-left"
            size={20}
            onPress={goBack}
            color={Colors.BLUE}
          />
        </Header>
        <ContainerScroll>
          <Image
            source={require('./assets/cashBackIcon.png')}
            resizeMode="contain"
            style={{height: 60, width: 60, alignSelf: 'center'}}
          />
          <Title style={{alignSelf: 'center', fontSize: 18, marginTop: 17}}>
            CashBack
          </Title>
          <TextTitle>
            Toda vez que efetuar pagamento de um serviço pelo Meu Vip, você
            receberá parte do valor para poder usar em outros serviços. Podera
            demorar até 24h para aparecer o cashBack
          </TextTitle>
          <BalanceBox>
            <Title>Saldo</Title>
            <Footer>
              <Currency>{formatMoney(money, configurations?.coin)}</Currency>
              <Balance>{}</Balance>
            </Footer>
          </BalanceBox>
          <StatementBox
            onPress={() =>
              navigation.navigate('CashBackStack', {screen: 'bankStatement'})
            }>
            <TitleStatment>Extrato</TitleStatment>
          </StatementBox>
          <DescriptionOfBalance>
            <TextDescription
              style={{
                width: 242,
                fontSize: 15,
              }}>
              Saldo mínimo de {configurations?.coin} 10,00 para a utilização do
              CashBack como forma de pagamento ou descontos.
            </TextDescription>
          </DescriptionOfBalance>
          <CancelFooter>
            <TextDescription
              style={{
                color: Colors.SECONDARY,
                height: 33,
                width: 258,
                fontSize: 13,
              }}>
              Cancelamentos fora do prazo terão saldo de créditos abatidos
              podendo ficar negativo.
            </TextDescription>
          </CancelFooter>
        </ContainerScroll>
      </Container>
    </>
  );
};

export default cashBack;
