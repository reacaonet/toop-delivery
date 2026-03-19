/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, memo } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Modalize } from 'react-native-modalize';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../styles';

/** Styles */
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
            <CurrencySymbol>{t('monetary')}</CurrencySymbol>
            <PriceDriver>{formatMoney(service?.price || 0, false)}</PriceDriver>
          </PriceDriverContent>
        </ContentPrice>

        <Card>
          <CardTitle>{t('raceFare.rate')}</CardTitle>
        </Card>

        <Card color={Colors.WHITE}>
          <DetailView>
            <DetailTxt>{t('raceFare.baseRate')}</DetailTxt>
            <DetailTxt>{formatMoney(service?.basePrice || 0)}</DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>{t('raceFare.minimunRate')}</DetailTxt>
            <DetailTxt>{formatMoney(service?.minimumRate || 0)}</DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>{t('raceFare.perKM')}</DetailTxt>
            <DetailTxt>{formatMoney(service?.currencyPrice || 0)}</DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>+ {t('raceFare.perMinute')}</DetailTxt>
            <DetailTxt>{formatMoney(service?.ratePerMinute || 0)}</DetailTxt>
          </DetailView>

          <DetailView>
            <DetailTxt>{t('raceFare.estimatedTool')}</DetailTxt>
            <DetailTxt>{formatMoney(service?.tagCost || 0)}</DetailTxt>
          </DetailView>
        </Card>

        <Footer>
          <FooterTimeTitle>
            {t('raceFare.application')}: {t('monetary')}{' '}
            {formatMoney(service?.ratePerMinute || 0, false)} por minuto
          </FooterTimeTitle>
        </Footer>
      </Container>
    </Modalize>
  );
};

export default memo(RaceFare);
