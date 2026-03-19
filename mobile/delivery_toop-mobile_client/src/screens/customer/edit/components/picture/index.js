import React from 'react';
import {Alert} from 'react-native';

import {ViewPicture, TextPicture, Image, TouchPicture} from './Styles';

import {uploadDocument} from '../../../../../services/service/sendImages';
import {pickFile} from '../../../../paymentStatus/ChatPayment/chatUtils';

const Picture = ({picture, setPicture, setModalLoad}) => {
  const iconDefault = require('../../../../../assets/images/icon_user.png');

  const selectImage = async () => {
    const data = await pickFile('camera', 'photo');
    setModalLoad(true);

    if (!data?.uri) {
      Alert.alert(
        'Oops',
        'Ocorreu um erro ao tirar sua foto, tente novamente.',
      );
      return;
    }

    const image = await uploadDocument(data, 'profile_customer');

    if (!image?.url) {
      Alert.alert(
        'Oops',
        'Ocorreu um erro ao tirar sua foto, tente novamente.',
      );
      setModalLoad(false);
      return;
    }

    setPicture(image?.url);
    setModalLoad(false);
  };

  return (
    <ViewPicture>
      <TouchPicture onPress={() => selectImage()}>
        <TextPicture>Editar foto</TextPicture>
      </TouchPicture>
      {picture ? (
        <Image source={{uri: picture}} resizeMode="cover" />
      ) : (
        <Image source={iconDefault} resizeMode="cover" />
      )}
    </ViewPicture>
  );
};

export default Picture;
