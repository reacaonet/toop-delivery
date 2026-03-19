/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/** Components */
import Button from '../Button';

/** Styles */
import { Container, ContentImage, Image, TextSelectDocument } from './styles';
import { Colors } from '../../../../../styles';

/** Service */
import pickDocument from '../../../../../services/documents';
import { t } from 'i18next';

const Document = ({ name, item, payload, scrollRef }: any) => {
  const [picture, setPicture] = useState<any>();
  const [type, setType] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!picture) {
        const current = { ...payload.current };
        if (item.inputGroup) {
          if (!current[`${item.inputGroup}`]) {
            current[`${item.inputGroup}`] = {};
          }

          current[`${item.inputGroup}`][`${name}`] = '';
        } else {
          current[`${name}`] = '';
        }

        payload.current = current;
      }
    }, []),
  );

  const selectDocument = async () => {
    try {
      const data = await pickDocument();

      if (!data) {
        return Alert.alert(
          item?.error?.notFound?.title,
          item?.error?.notFound?.message,
        );
      }

      setPicture(data);

      if (data?.type && `${data?.type}`.toLowerCase().search('image') > -1) {
        setType('photo');
      } else {
        setType('doc');
      }

      const current = { ...payload.current };
      if (item.inputGroup) {
        if (!current[`${item.inputGroup}`]) {
          current[`${item.inputGroup}`] = {};
        }

        current[`${item.inputGroup}`][`${name}`] = data?.uri;
      } else {
        current[`${name}`] = data?.uri;
      }

      payload.current = current;

      if (scrollRef && scrollRef.current) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    } catch (err) {
      return Alert.alert(
        item?.error?.catch?.title,
        item?.error?.catch?.message,
      );
    }
  };

  return (
    <Container>
      {type === 'photo' &&
        picture &&
        picture?.uri ? (
        <ContentImage>
          <Image resizeMode="contain" source={{ uri: picture.uri }} />
        </ContentImage>
      ) : null}

      {type === 'doc' &&
        picture &&
        picture?.uri ? (
        <ContentImage>
          <TextSelectDocument>• {t('dataDriver.documentSelect')}</TextSelectDocument>
        </ContentImage>
      ) : null}



      <Button
        text={item?.title}
        textColor={Colors.WHITE}
        color={Colors.BUTTOM_PRIMARY}
        onPress={() => selectDocument()}
      />
    </Container>
  );
};

export default Document;
