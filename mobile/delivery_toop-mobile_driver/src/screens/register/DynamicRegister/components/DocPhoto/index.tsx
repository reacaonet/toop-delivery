/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { openSettings } from 'react-native-permissions';

import {
  Container,
  Title,
  SubTitle,
  Content,
  UploadDocument,
  UploadPhoto,
  TextDocument,
  TextPhoto,
  ContentImage,
  Image,
  ConfirmPhoto,
  ConfirmTextPhoto,
  CancelButton,
  LoadContent,
  LoadIndicator,
  TextSelectDocument,
} from './styles';
import { Colors } from '../../../../../styles';

/** Service */
import { updatePreRegistration } from '../../../../../services/provider/preRegistration/dynamic/updateRegister';
import pickDocument from '../../../../../services/documents';
import pickFile from './../../../Camera';
import {
  uploadDocument,
} from '../../../../../services/sendImages/fileUpload';
import { requestCameraPermission, requestExternalWritePermission, requestReadPermission } from '../../../../../services/permissions';
import PermissionModalComponent from '../../../../../components/PermissionModal';


const DocPhoto = ({ item, getCurrentRegister }: any) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const state: any = useSelector((state: any) => state?.preRegistration);

  const [picture, setPicture] = useState<any>();
  const [type, setType] = useState<string | null>(null);
  const [load, setLoad] = useState(false);
  const [isVisiblePermissionModal, setIsVisiblePermissionModal] = useState(false);

  const selectDocument = async () => {
    const isStoragePermitted = await requestExternalWritePermission();
    const isReadPermitted = await requestReadPermission();
    const isCameraPermitted = await requestCameraPermission();

    if (!isStoragePermitted || !isReadPermitted || !isCameraPermitted) {
      setIsVisiblePermissionModal(true);
      return;
    }

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
    } catch (err) {
      return Alert.alert(
        item?.error?.catch?.title,
        item?.error?.catch?.message,
      );
    }
  };

  const selectImage = async (typePhoto: any) => {
    try {
      let isReadPermitted = await requestReadPermission();
      let isCameraPermitted = await requestCameraPermission();
      let isStoragePermitted = await requestExternalWritePermission();

      if (!isStoragePermitted || !isReadPermitted || !isCameraPermitted) {
        setIsVisiblePermissionModal(true);
        return;
      }

      const data = await pickFile(typePhoto, 'photo');

      if (!data || !data?.uri) {
        return Alert.alert(
          item?.error?.notFound?.title,
          item?.error?.notFound?.message,
        );
      }


      setPicture(data);
      setType('photo');
    } catch (err) {
      return Alert.alert(
        item?.error?.catch?.title,
        item?.error?.catch?.message,
      );
    }
  };

  const confirmImage = async () => {
    try {
      if (!picture || !picture?.uri) {
        return;
      }

      setLoad(true);
      const response: any = await uploadDocument(picture, 'mobility/driver');

      if (!response.url) {
        setLoad(false);
        return Alert.alert('Upload', t('DynamicRegister.unableSendFile'));
      }

      let payload: any = {
        viewStopRegister: item?.view || '',
        viewNextRegister: item?.nextView || '',
      };

      payload[`${item?.name}`] = response.url;

      const respUpRegister = await updatePreRegistration(state.id, payload);
      setLoad(false);

      if (!respUpRegister || respUpRegister?.errMessage) {
        return dispatch({
          type: 'SET_MESSAGE_SAGA',
          payload: {
            title: '',
            description: response?.errMessage || t('DynamicRegister.couldNotSave'),
          },
        });
      }

      getCurrentRegister();
    } catch (err) {
      console.log('oops fail', err);
      setLoad(false);
    }
  };

  return (
    <>
      <Container>
        <Title>{item?.title}</Title>
        {item?.subtitle ? (
          <SubTitle>{item?.subtitle}</SubTitle>
        ) : null}


        {!picture && item?.image ? (
          <ContentImage>
            <Image resizeMode="contain" source={{ uri: item?.image }} />
          </ContentImage>
        ) : null}

        {picture &&
          picture?.type &&
          `${picture?.type}`.toLowerCase().search('image') > -1 &&
          picture?.uri ? (
          <ContentImage>
            <Image resizeMode="contain" source={{ uri: picture.uri }} />
          </ContentImage>
        ) : null}

        {picture &&
          picture?.type && type === 'doc' &&
          `${picture?.type}`.toLowerCase().search('pdf') > -1 &&
          picture?.uri ? (
          <ContentImage>
            <TextSelectDocument>{t('DynamicRegister.title')}</TextSelectDocument>
          </ContentImage>
        ) : null}

        {!load ? (
          <Content >
            {picture && picture?.uri ? (
              <>
                <CancelButton onPress={() => setPicture(undefined)}>
                  <ConfirmTextPhoto>{t('DynamicRegister.goBack')}</ConfirmTextPhoto>
                </CancelButton>
                <ConfirmPhoto onPress={() => confirmImage()} disabled={load}>
                  <ConfirmTextPhoto>{t('DynamicRegister.confirm')}</ConfirmTextPhoto>
                </ConfirmPhoto>
              </>
            ) : (
              <>
                {item?.disableDocument !== true ? (
                  <UploadDocument onPress={() => selectDocument()}>
                    <TextDocument>{t('DynamicRegister.generateDoc')}</TextDocument>
                  </UploadDocument>
                ) : null}

                <UploadPhoto onPress={() => selectImage('camera')}>
                  <TextPhoto>{t('DynamicRegister.takePicture')}</TextPhoto>
                </UploadPhoto>
              </>
            )}
          </Content>
        ) : (
          <LoadContent>
            <LoadIndicator color={Colors.PRIMARY} size="large" />
          </LoadContent>
        )}
      </Container>
      <PermissionModalComponent
        isVisible={isVisiblePermissionModal}
        title={t('DynamicRegister.cameraPermission.title')}
        description={t('DynamicRegister.cameraPermission.description')}
        confirmButtonColor="green"
        cancelButtonColor="#ddd"
        onConfirm={() => {
          openSettings().catch(() => { setIsVisiblePermissionModal(true); });
          setIsVisiblePermissionModal(false);
        }}
        onCancel={() => setIsVisiblePermissionModal(false)}
      />
    </>
  );
};

export default DocPhoto;
