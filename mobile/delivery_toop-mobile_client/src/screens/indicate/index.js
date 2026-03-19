/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {TouchableOpacity, Share, Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';

import {
  styles,
  ContainIndex,
  Area,
  ContainSubTitle,
  LongText,
  ImageIndique,
  SubText,
  ImageCard,
  TextCard,
  ViewCard,
  TextFooter,
} from './styles';

import IconIndi from '../../assets/images/Indique-2.svg';

/** Service */
import {listPassengerOne} from '../../services/provider/passenger/list';

const Indique = ({navigation}) => {
  const dispatch = useDispatch();
  const {
    user: {user = null},
    configurations = null,
  } = useSelector(state => state);
  const {t} = useTranslation();
  const [referralCode, setReferralCode] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (user && !user?.referralCode) {
        listPassengerOne(user?.passenger?._id).then(result => {
          if (result.referralCode) {
            user.referralCode = result.referralCode;
            setReferralCode(result.referralCode);
          }
        });
      } else {
        setReferralCode(user?.referralCode);
      }
    }, [user]),
  );

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Faça seu cadastro no Toop e infome o código ${user?.referralCode}`,
      });

      if (result.action === Share.sharedAction) {
        // if (result.activityType) {} else {}
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <ContainIndex>
      {/*  Header */}
      <Area>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      </Area>

      <ImageIndique
        source={require('../../assets/images/indique.png')}
        resizeMode="contain"
      />
      <SubText>Indique e ganhe!</SubText>
      <LongText>
        Indique amigosm vizinhos,{'\n'}parentes... Quem quiser! e ganhe{'\n'}
        {configurations?.coin}
        20,00 em cada indicação!
      </LongText>

      <ContainSubTitle onPress={onShare} disabled={!referralCode}>
        <ViewCard>
          <IconIndi style={styles.icon} />
          <TextCard>Indicar</TextCard>
        </ViewCard>
      </ContainSubTitle>

      <TextFooter>
        Após a primeira viagem da pessoa{'\n'}indicada o valor é convertido em
        créditos{'\n'}e transferidos para carteira.
      </TextFooter>
    </ContainIndex>
  );
};

export default Indique;
