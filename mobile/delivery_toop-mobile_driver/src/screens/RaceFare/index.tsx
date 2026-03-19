import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../styles';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

/** Styles */
import {
  Container,
  Header,
  HeaderTitle,
  HeaderViewIcon,
  Card,
  CardTitle,
  DetailTxt,
  DetailView,
  ContentPrice,
  ServiceNameView,
  ServiceName,
  PriceDriverContent,
  PriceDriver,
  CurrencySymbol,
  Footer,
  FooterTime,
  FooterDistance,
  FooterLine,
  FooterTimeTitle,
  FooterTimeSubTitle,
  FooterDistanceTitle,
  FooterDistanceSubTitle,
} from './styles';

import env from '../../config/index';
import { formatMoney } from '../../utils';

const RaceFare = () => {
  const navigation = useNavigation<any>();

  const { configurations = null }: any = useSelector((state: any) => state);

  const route = useRoute<any>();
  const { t } = useTranslation();
  const booking = route.params;

  return (
    <>
      <Container
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <Header>
          <HeaderViewIcon
            onPress={() => {
              navigation.navigate('HistoryCar');
            }}>
            <Icon name="navigate-before" size={45} color={Colors.BLACK} />
          </HeaderViewIcon>
          <HeaderTitle>{t('raceFees')}</HeaderTitle>
        </Header>

        <ContentPrice>
          <ServiceNameView>
            <ServiceName numberOfLines={1}>
              {booking?.service?.name}
            </ServiceName>
          </ServiceNameView>

          <PriceDriverContent>
            <CurrencySymbol>{configurations?.coin}</CurrencySymbol>
            <PriceDriver>
              {formatMoney(booking?.priceDriver || 0, false)}
            </PriceDriver>
          </PriceDriverContent>
        </ContentPrice>

        <Card>
          <CardTitle>Valor pago pelo passageiro</CardTitle>
        </Card>

        <Card color={Colors.WHITE}>
          <DetailView>
            <DetailTxt color={Colors.PRIMARY}>Valor Pago</DetailTxt>
            <DetailTxt color={Colors.PRIMARY}>
              {formatMoney(booking?.price || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>{env.nameApp} recebeu</DetailTxt>
            <DetailTxt>
              {formatMoney(
                booking?.amountReceivable || 0,
                configurations?.coin,
              )}
            </DetailTxt>
          </DetailView>
        </Card>

        <Card>
          <CardTitle>Tarifas</CardTitle>
        </Card>

        <Card color={Colors.WHITE}>
          <DetailView>
            <DetailTxt>Valor Base</DetailTxt>
            <DetailTxt>
              {formatMoney(
                booking?.service?.basePrice || 0,
                configurations?.coin,
              )}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>Custo por minuto</DetailTxt>
            <DetailTxt>
              {formatMoney(
                booking?.service?.timePrice || 0,
                configurations?.coin,
              )}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>Custo por KM</DetailTxt>
            <DetailTxt>
              {formatMoney(
                booking?.service?.currencyPrice || 0,
                configurations?.coin,
              )}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>{t('raceFare.estimatedTool')}</DetailTxt>
            <DetailTxt>
              {formatMoney(booking?.tagCost || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>Gorjeta</DetailTxt>
            <DetailTxt>
              {formatMoney(booking?.payment?.tip || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>
        </Card>
      </Container>

      <Footer>
        <FooterTime>
          <FooterTimeTitle>Duração da Viagem</FooterTimeTitle>
          <FooterTimeSubTitle>{booking?.routeTime}</FooterTimeSubTitle>
        </FooterTime>
        <FooterLine />
        <FooterDistance>
          <FooterDistanceTitle>Distância da viagem</FooterDistanceTitle>
          <FooterDistanceSubTitle>{booking?.distance}</FooterDistanceSubTitle>
        </FooterDistance>
      </Footer>
    </>
  );
};

export default RaceFare;
