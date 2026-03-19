import React from 'react';
import {Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {
  styles,
  BoxInformation,
  BoxInformationTitle,
  TitleCompany,
  Informations,
  BoxInformationIcon,
  CircleIconInformation,
  ContentSocial,
  ContainerService,
  ContainerAddress,
  AddressText,
  ContainerSocial,
  ImageSocial,
} from './Styles';

import IconMaterialCommunity from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import {
  deliveryTime,
  minPurchase,
  deliveryPrice,
} from '../../../../../utils/screens/product';
import {formatMoney} from '../../../../../utils/index';

/** Image */
import IconWhatsapp from '../../../../../assets/images/whatsapp.png';
import IconInstagram from '../../../../../assets/images/instagram.png';
import IconFacebook from '../../../../../assets/images/facebook.png';

const CompanyInformation = ({company}) => {
  const {configurations = null} = useSelector(state => state);

  const clickWhatsapp = () => {
    Linking.openURL(
      `https://api.whatsapp.com/send?phone=${company?.socialNetwork?.whatsapp}&text=Olá! Vim através do App TOOP Delivery`,
    );
  };

  const clickInstagram = () => {
    Linking.openURL(company?.socialNetwork?.instagram);
  };

  const clickFacebook = () => {
    Linking.openURL(company?.socialNetwork?.facebook);
  };

  return (
    <>
      <BoxInformation>
        <BoxInformationTitle>
          <TitleCompany numberOfLines={1}>
            {company.name && company.name.length > 0 ? `${company.name}` : '-'}{' '}
            {company && company.companyDelivery?.isOpen === false
              ? '- Fechado'
              : null}
          </TitleCompany>
          <Informations>
            {deliveryPrice(company, 'Entrega', configurations?.coin)} •{' '}
            {deliveryTime(company, false)} • {minPurchase(company)}
          </Informations>
        </BoxInformationTitle>
        <BoxInformationIcon>
          <CircleIconInformation>
            <IconMaterialCommunity
              name="information-variant"
              size={20}
              style={styles.iconInformation}
            />
          </CircleIconInformation>
        </BoxInformationIcon>
      </BoxInformation>
      {company?.companyCategory === 'service' ? (
        <ContainerService>
          <ContainerAddress>
            <AddressText numberOfLines={2}>
              Endereço: {company?.address}
            </AddressText>
          </ContainerAddress>

          <ContentSocial>
            {company?.socialNetwork?.whatsapp ? (
              <ContainerSocial onPress={() => clickWhatsapp()}>
                <ImageSocial source={IconWhatsapp} />
              </ContainerSocial>
            ) : null}

            {company?.socialNetwork?.instagram ? (
              <ContainerSocial onPress={() => clickInstagram()}>
                <ImageSocial source={IconInstagram} />
              </ContainerSocial>
            ) : null}

            {company?.socialNetwork?.facebook ? (
              <ContainerSocial onPress={() => clickFacebook()}>
                <ImageSocial source={IconFacebook} />
              </ContainerSocial>
            ) : null}
          </ContentSocial>
        </ContainerService>
      ) : null}
    </>
  );
};

export default CompanyInformation;
