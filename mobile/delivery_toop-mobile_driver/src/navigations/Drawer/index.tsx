/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Typography, Colors } from '../../styles';
import { TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import { useTranslation } from 'react-i18next';
import {
  styles,
  Container,
  DrawerHeaderWrapper,
  AvatarName,
  AvatarInfo,
  AvatarPlaca,
  DrawerHeaderTextWrapper,
  DrawerHeaderAvatar,
  MenuCategory,
  Viewer,
} from './styles';
import Icon from './icons';
import userAvatar from '../../assets/images/photo.png';

/** Service */
import { stopBackground } from '../../services/Background/backgroundActions';
import { updateDriver } from '../../services/provider/user/update';

import config from '../../config';

const DrawerContent = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const exitUser = async () => {
    await updateDriver(user?._id, {
      online: false,
    });

    database()
      .ref(`${config.FIREBASE_PATH}blacklist/driver/${user._id}`)
      .remove();

    dispatch({
      type: 'SET_USER_SAGA',
      payload: {},
    });

    stopBackground();

    setTimeout(() => {
      return navigation.navigate('Splash');
    }, 1000);
  };

  return (
    <Container colors={[Colors.PRIMARY, Colors.PRIMARY]}>
      <DrawerHeaderWrapper>
        <TouchableOpacity onPress={() => navigation.navigate('Dados')}>
          {user?.selfiePhoto &&
            Array.isArray(user?.selfiePhoto) &&
            user?.selfiePhoto.length > 0 ? (
            <DrawerHeaderAvatar
              source={{
                uri: user?.selfiePhoto[0],
              }}
            />
          ) : (
            <DrawerHeaderAvatar source={userAvatar} />
          )}
        </TouchableOpacity>
        <DrawerHeaderTextWrapper>
          <AvatarName
            style={{ fontSize: Typography.FONT_SIZE_15 }}
            numberOfLines={1}>
            {user?.name}
          </AvatarName>
          <AvatarInfo style={{ fontSize: Typography.FONT_SIZE_15 }}>
            {user?.vehicleManufacturer} {user?.vehicleModel}{' '}
            {user?.vehicleColor}
          </AvatarInfo>
          <AvatarPlaca style={{ fontSize: Typography.FONT_SIZE_15 }}>
            {user?.vehicleNameplate}
          </AvatarPlaca>
          {/* <AvatarLocation>R. 27 Qd: 14 Conj: Hélio III</AvatarLocation> */}
        </DrawerHeaderTextWrapper>
      </DrawerHeaderWrapper>

      <ScrollView
        style={styles.scrollStyle}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.navigate('Msg')}>
          <Viewer>
            <Icon.Message
              name="message-square"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory> Mensagens</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // navigation.navigate('HistoryRunning')
            navigation.navigate('HistoryCar');
          }}>
          <Viewer>
            <Icon.Car
              name="car"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Histórico de {t('races')}</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Repasse')}>
          <Viewer>
            <Icon.Card
              name="creditcard"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Repasse de ganhos</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Viewer>
            <Icon.Wallet
              name="wallet"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Minha carteira</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cars')}>
          <Viewer>
            <Icon.Car
              name="car"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Meus carros</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Dados')}>
          <Viewer>
            <Icon.People
              name="people"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Meus dados</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => navigation.navigate('Send')}>
          <Viewer>
            <Icon.Share
              name="share-square-o"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Indique e ganhe</MenuCategory>
          </Viewer>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => navigation.navigate('Sup')}>
          <Viewer>
            <Icon.Support
              name="support-agent"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Suporte</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('QrStack')}>
          <Viewer>
            <Icon.Scan
              name="qrcode-scan"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Embarque rápido</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        {/* <TouchableOpacity>
          <Viewer>
            <Icon.Settings
              name="settings"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Configurações</MenuCategory>
          </Viewer>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => navigation.navigate('TermsDrawer')}>
          <Viewer>
            <Icon.Terms
              name="file-contract"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>{t('termsOfUse')}</MenuCategory>
          </Viewer>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => exitUser()}>
          <Viewer>
            <Icon.Out
              name="logout"
              size={16}
              color={Colors.WHITE}
              style={{ marginLeft: 15, fontSize: Typography.FONT_SIZE_18 }}
            />
            <MenuCategory>Sair</MenuCategory>
          </Viewer>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

export default DrawerContent;
