import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFont from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';

import {
  styles,
  Header,
  DigiteCodeTouch,
  Area,
  DigiteCodeTxt,
  ContainerCode,
  CodeTitle,
  CodeInput,
  ConfirmTouch,
  ConfirmTxt,
} from './styles';

/** Service */
import { searchQrCodeDriver } from '../../../../../services/provider/driver/qrCode';
import { Colors } from '../../../../../styles';

const QrCode: React.FC<any> = ({ setActiveQR }: any) => {
  const [codeManual, setCodeManual] = useState(false);
  const [code, setCode] = useState<any>('');
  const navigation = useNavigation<any>();

  const { t } = useTranslation();

  const onSuccess = (e: any) => {
    // console.log('Info do QRCode', e.data);
    if (e.data) {
      sendCode(e.data);
    }
  };

  const selectRoute = () => {
    try {
      // validar código se existe
      if (!code) {
        return Alert.alert('Código de Viagem', 'Informe um código ');
      }

      sendCode(code);
    } catch (err) {
      console.log('err selectRoute', err);
    }
  };

  const sendCode = async (qrCode: any) => {
    const response = await searchQrCodeDriver(qrCode);

    if (response.errMessage) {
      return Alert.alert('Solicitação', response?.errMessage);
    }

    return navigation.navigate('RideAndTravelStack', {
      screen: 'SelectDestiny',
      params: {
        qrCode,
        driver: response.driver,
      },
    });
  };

  return (
    <>
      {!codeManual ? (
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.off}
          topContent={
            <>
              <Header>
                <IconFont
                  name="chevron-left"
                  size={20}
                  onPress={() => {
                    setActiveQR(false);
                  }}
                  color={Colors.PRIMARY}
                />
              </Header>
              <Text style={styles.centerText}>
                Escaneie o QR CODE do Motorista
              </Text>
            </>
          }
          bottomContent={
            <DigiteCodeTouch
              onPress={() => {
                setCodeManual(true);
              }}>
              <DigiteCodeTxt>{t('autoBoard.enterCode')}</DigiteCodeTxt>
            </DigiteCodeTouch>
          }
        />
      ) : (
        <>
          <Area>
            <TouchableOpacity
              onPress={() => {
                setCodeManual(false);
                setCode('');
              }}>
              <Icon
                name="navigate-before"
                size={40}
                style={styles.iconGoBack}
              />
            </TouchableOpacity>
          </Area>
          <ContainerCode>
            <CodeTitle>Digite o código do motorista</CodeTitle>
            <CodeInput onChangeText={setCode} />
            <ConfirmTouch
              onPress={() => {
                selectRoute();
              }}>
              <ConfirmTxt>Continuar</ConfirmTxt>
            </ConfirmTouch>
          </ContainerCode>
        </>
      )}
    </>
  );
};

export default QrCode;
