/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

import { Container } from './styles';

/** Components */
import ConfirmCrlv from './components/screenConfirm';
import pickFile from './../../../register/Camera';

/** Service */
import { updateVehicleDocuments } from '../../../../services/provider/user/vehicleDocuments';
import { uploadDocument } from '../../../../services/sendImages/fileUpload';

interface Props {
  navigation: any;
}

const Confirm = ({ navigation }: Props) => {
  const route = useRoute<any>();

  const [photo, setPhoto] = useState<any>(null);
  const [car, setCar] = useState<any>({});
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (route.params?.photo) {
      setPhoto(route.params?.photo);
    }

    if (route.params?.car) {
      setCar(route.params?.car);
    }
  }, [route.params]);

  function handleGoBack() {
    navigation.navigate('CamCr');
  }

  async function submit() {
    try {
      setLoad(true);
      const response: any = await uploadDocument(photo, 'mobility/driver');
      setLoad(false);

      if (response.url) {
        await updateVehicleDocuments(car?._id, {
          carsDocument: [response.url],
        });

        setLoad(false);
        navigation.navigate('Cars');
      } else {
        setLoad(false);
        return Alert.alert('Upload', 'Não foi possível enviar sua foto');
      }
    } catch (err) {
      setLoad(false);
    }
  }

  async function again() {
    // navigation.navigate('CamCr');

    try {
      const data = await pickFile('camera', 'photo');

      if (!data?.uri) {
        return;
      }

      navigation.navigate('ConfirmCrlv', {
        photo: data,
        car: route.params?.car || {},
      });
    } catch (err: any) {
      Alert.alert('Erro ao tirar foto', err.message);
    }
  }

  return (
    <Container>
      <ConfirmCrlv
        again={again}
        submit={submit}
        goBack={handleGoBack}
        photo={photo}
        load={load}
      />
    </Container>
  );
};

export default Confirm;
