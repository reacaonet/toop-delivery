import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import {
  styles,
  ContainIndex,
  Area,
  LongText,
  ImageEmpresa,
  SubText,
  TextButton,
  Button,
} from './styles';

/* Components */
import QrCode from './components/QrCode';

const AutoBoard: React.FC = ({ navigation }: any) => {
  const [activeQR, setActiveQR] = useState(false);
  const { t } = useTranslation();

  return (
    <ContainIndex>
      {!activeQR ? (
        <>
          <Area>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Home', {
                  screen: 'Home',
                  params: {},
                })
              }>
              <Icon
                name="navigate-before"
                size={40}
                style={styles.iconGoBack}
              />
            </TouchableOpacity>
          </Area>

          <ImageEmpresa
            source={require('../../../assets/images/QR.png')}
            resizeMode="contain"
          />
          <SubText>Embarque Rápido</SubText>
          <LongText>{t('autoBoard.longText')}</LongText>
          <LongText>
            Escaneie o código QR no aplicativo do{'\n'}motorista. Conecte-se,
            insira seu destino{'\n'}e tenha uma viagem mais segura
          </LongText>

          <Button
            onPress={() => {
              // navigation.navigate('Cam')
              setActiveQR(true);
            }}>
            <TextButton>Escanear Código</TextButton>
          </Button>
        </>
      ) : (
        <QrCode setActiveQR={setActiveQR} />
      )}
    </ContainIndex>
  );
};

export default AutoBoard;
