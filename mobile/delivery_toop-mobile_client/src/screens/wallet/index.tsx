/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { Image, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors } from '../../styles';

import {
  Container,
  ContainerScroll,
  Header,
  HeaderTitle,
  BalanceBox,
  Title,
  Footer,
  Currency,
  Balance,
  AddValue,
  DescriptionOfBalance,
  TextDescription,
  TextButtonAdd,
  BoxButtonInfo,
  FooterButton,
  Divider,
  FooterButtonBox,
  IconTitle,
  TitleFooter,
  InputCoupon,
  SuccessMessage,
  ErrorMessage,
} from './styles';
import { useTranslation } from 'react-i18next';
import { generateByVoucher } from '../../services/provider/wallet/generate';
import { getBalance } from '../../services/provider/wallet/balance';

const wallet = () => {
  const configurations = useSelector((state: any) => state?.configurations || null);
  const user = useSelector((state: any) => state?.user?.user || null);

  const isFocused = useIsFocused();
  const { goBack, navigate } = useNavigation();
  const { t } = useTranslation();

  const [balance, setBalance] = React.useState(0);
  const [showCouponModal, setShowCouponModal] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');
  const [couponCodeError, setCouponCodeError] = React.useState('');
  const [couponCodeSuccess, setCouponCodeSuccess] = React.useState('');

  const balanceFormatted = balance.toFixed(2).toString();

  const loadBalance = async () => {
    const response = await getBalance({ customer: user?._id, passenger: user?.passenger?._id, franchise: user.franchise });
    if (response.errMessage) {
      console.log('Error', response.errMessage)
      return;
    }

    setBalance(response.balance);
  };

  const sendCouponCode = async () => {
    if (couponCode.length <= 3) {
      setCouponCodeError('Digite um cupom válido.');
    }

    try {
      const response = await generateByVoucher({
        code: couponCode,
        customer: user._id,
        passenger: user?.passenger?._id
      });

      if (response.message && response.message != 'ok')
        setCouponCodeSuccess(response.message);
      else
        setCouponCodeSuccess('Cupom resgatado com sucesso!');
      setCouponCodeError('');

      loadBalance();
    } catch (error: any) {
      console.log('Error voucher', error)
      setCouponCodeSuccess('');
      setCouponCodeError(error.response?.data?.message || 'Error');
    }
  };

  React.useEffect(() => {
    loadBalance();
  }, [isFocused]);

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
            color={Colors.PRIMARY}
          />
          <HeaderTitle>CARTEIRA</HeaderTitle>
        </Header>
        <ContainerScroll>
          <BalanceBox>
            <Title>Saldo</Title>
            <Footer>
              <Currency>{configurations?.coin}</Currency>
              <Balance>{balanceFormatted.replace('.', ',')}</Balance>
            </Footer>
          </BalanceBox>
          <AddValue>
            <BoxButtonInfo>
              <TextButtonAdd>Adicionar valor</TextButtonAdd>
              <Icon
                name="plus"
                size={20}
                onPress={goBack}
                color={Colors.WHITE}
                style={{ alignSelf: 'flex-end' }}
              />
            </BoxButtonInfo>
          </AddValue>

          {showCouponModal ? (
            <>
              <InputCoupon
                placeholder='Digite o código do cupom'
                autoCapitalize='characters'
                autoFocus
                returnKeyType='done'
                value={couponCode}
                onChangeText={(value: string) => {
                  setCouponCodeError('');
                  setCouponCodeSuccess('');
                  setCouponCode(`${value}`);
                }}
                onSubmitEditing={() => sendCouponCode()}
              />

              {couponCodeError !== '' ? (
                <ErrorMessage>{couponCodeError}</ErrorMessage>
              ) : null}
              {couponCodeSuccess !== '' ? (
                <SuccessMessage>{couponCodeSuccess}</SuccessMessage>
              ) : null}

              <AddValue onPress={() => sendCouponCode()}>
                <BoxButtonInfo>
                  <TextButtonAdd>Resgatar cupom</TextButtonAdd>
                  <Icon
                    name="receipt"
                    size={20}
                    color={Colors.WHITE}
                    style={{ alignSelf: 'flex-end' }}
                  />
                </BoxButtonInfo>
              </AddValue>
            </>
          ) : (
            <>
              <AddValue onPress={() => setShowCouponModal(true)}>
                <BoxButtonInfo>
                  <TextButtonAdd>Cupom único</TextButtonAdd>
                  <Icon
                    name="receipt"
                    size={20}
                    onPress={() => setShowCouponModal(true)}
                    color={Colors.WHITE}
                    style={{ alignSelf: 'flex-end' }}
                  />
                </BoxButtonInfo>
              </AddValue>
              <DescriptionOfBalance>
                <TextDescription>Digite o código do seu cupom único aqui.</TextDescription>
              </DescriptionOfBalance>
            </>
          )}

          <DescriptionOfBalance>
            <TextDescription>
              Coloque saldo pré-pago em sua carteira ou receba créditos do
              cashback e de premiações, podendo usar para efetuar compras com
              mais economia
            </TextDescription>
          </DescriptionOfBalance>
          <FooterButtonBox>
            <FooterButton onPress={() => navigate('cashBack')}>
              <IconTitle>
                <Image
                  source={require('../../assets/images/cashback.png')}
                  resizeMode="contain"
                  style={{ height: 30, width: 30 }}
                />
                <TitleFooter>CashBack</TitleFooter>
              </IconTitle>
              <Icon
                name="chevron-right"
                size={20}
                onPress={goBack}
                color={Colors.PRIMARY}
              />
            </FooterButton>
            <Divider />
            <FooterButton>
              <IconTitle>
                <Image
                  source={require('./assets/giftIcon.png')}
                  resizeMode="contain"
                  style={{ height: 30, width: 30 }}
                />
                <TitleFooter>Prêmios</TitleFooter>
              </IconTitle>
              <Icon
                name="chevron-right"
                size={20}
                onPress={goBack}
                color={Colors.PRIMARY}
              />
            </FooterButton>
            <Divider />
            <FooterButton onPress={() => navigate('Recommendation')}>
              <IconTitle>
                <Image
                  source={require('./assets/handsIcon.png')}
                  resizeMode="contain"
                  style={{ height: 30, width: 30 }}
                />
                <TitleFooter>Indicações</TitleFooter>
              </IconTitle>
              <Icon
                name="chevron-right"
                size={20}
                onPress={goBack}
                color={Colors.PRIMARY}
              />
            </FooterButton>
          </FooterButtonBox>
        </ContainerScroll>
      </Container>
    </>
  );
};

export default wallet;
