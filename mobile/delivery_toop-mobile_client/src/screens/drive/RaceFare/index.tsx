/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, memo } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Modalize } from 'react-native-modalize';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

/** Styles */
import { Colors } from '../../../styles';
import {
  styles,
  Container,
  Header,
  HeaderViewIcon,
  HeaderTitle,
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
  FooterTimeTitle,
} from './styles';

// import env from '../../../config';
import { formatMoney } from '../../../utils';

const RaceFare = ({ service, showRaceFare, setShowRaceFare }: any) => {
  const { configurations = null } = useSelector(state => state);
  const modalizeRef = useRef<Modalize>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (modalizeRef.current && showRaceFare) {
      setTimeout(() => {
        modalizeRef.current?.open();
      }, 300);
    } else if (modalizeRef.current) {
      modalizeRef.current.close();
      setShowRaceFare(false);
    }
  }, [modalizeRef.current, showRaceFare]);

  return (
    <Modalize
      ref={modalizeRef}
      modalStyle={styles.modalize}
      adjustToContentHeight={false}
      onClose={() => {
        setShowRaceFare(false);
      }}>
      <Container>
        <Header>
          <HeaderTitle>{t('tariffsRace')}</HeaderTitle>
          <HeaderViewIcon
            onPress={() => {
              if (modalizeRef.current) {
                modalizeRef.current.close();
                setShowRaceFare(false);
              }
            }}>
            <Icon name="close" size={25} color={Colors.GRAY_DARK} />
          </HeaderViewIcon>
        </Header>

        <ContentPrice>
          <ServiceNameView>
            <ServiceName numberOfLines={1}>{service?.name}</ServiceName>
          </ServiceNameView>

          <PriceDriverContent>
            <CurrencySymbol>{configurations?.coin || ''}</CurrencySymbol>
            <PriceDriver>{formatMoney(service?.price || 0)}</PriceDriver>
          </PriceDriverContent>
        </ContentPrice>

        <Card>
          <CardTitle>Tarifas</CardTitle>
        </Card>

        <Card color={Colors.WHITE}>
          <DetailView>
            <DetailTxt>Tarifa Base</DetailTxt>
            <DetailTxt>
              {formatMoney(service?.basePrice || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>Tarifa mínima</DetailTxt>
            <DetailTxt>
              {formatMoney(service?.minimumRate || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>+ por quilómetro</DetailTxt>
            <DetailTxt>
              {formatMoney(service?.currencyPrice || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>+ por minuto</DetailTxt>
            <DetailTxt>
              {formatMoney(service?.ratePerMinute || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>{t('raceFare.estimatedTool')}</DetailTxt>
            <DetailTxt>
              {formatMoney(service?.tagCost || 0, configurations?.coin)}
            </DetailTxt>
          </DetailView>
        </Card>

        <Footer>
          <FooterTimeTitle>
            Podem ser aplicados custos adicionais se o tempo de espera do
            motorista for superior a 2min
          </FooterTimeTitle>
        </Footer>
      </Container>
    </Modalize>
  );
};

export default memo(RaceFare);
