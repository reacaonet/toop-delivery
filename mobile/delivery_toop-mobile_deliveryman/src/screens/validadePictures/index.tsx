import React, { FunctionComponent, useState, useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  Container,
  CustomHeader,
  ViewText,
  ButtonWrapper,
  HeaderTitle,
  ViewBox,
  ImageSelfie,
  ViewImage,
  ViewBoxImages,
  ScrollViewImages,
  SafeAreaView,
} from './styles';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import { Colors } from '../../styles';
import { StorageGet, StorageSet } from '../../services/deviceStorage';

type ValidadePicturesProps = {
  navigation: any;
  route: any;
};

interface Register {
  name: string;
  celphone: string;
  city: string;
  cpf: string;
  selfie: string;
  cnh: [string];
  documents: [string];
}

const ValidadePictures: FunctionComponent<ValidadePicturesProps> = ({
  navigation,
  route: Route,
}: ValidadePicturesProps) => {
  const [register, setRegister] = useState<Register | null>(null);
  const [pictures, setPictures] = useState(() => {
    return Route.params.pictures;
  });
  const [type, setType] = useState(() => {
    return Route.params.type ?? '';
  });

  useEffect(() => {
    const getRegister = async () => {
      const registerResult = await StorageGet('Register');

      if (!registerResult) {
        return;
      }

      setRegister(registerResult);
    };

    getRegister();
  }, []);

  const goRegister = async () => {
    if (register) {
      if (type === 'selfie') {
        register.selfie = pictures;
      }

      if (type === 'cnh') {
        register.cnh = pictures;
      }

      if (type === 'documents') {
        register.documents = pictures;
      }
    }

    await StorageSet('Register', register);

    navigation.navigate('Register', { screen: 'Register' });
  };

  return (
    <SafeAreaView>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor={Colors.WHITE}
      />
      <CustomHeader>
        <IconMaterialIcons
          name="chevron-left"
          size={38}
          color={Colors.PRIMARY}
          style={{ position: 'absolute', left: 0 }}
          onPress={() => navigation.goBack()}
        />
        <HeaderTitle>Selfie</HeaderTitle>
      </CustomHeader>

      <Container>
        {pictures && pictures.length > 0 ? (
          <ViewBoxImages>
            <ScrollViewImages>
              {pictures.map((picture: any) => (
                <ViewImage key={picture}>
                  <ImageSelfie source={{ uri: picture }} />
                </ViewImage>
              ))}
            </ScrollViewImages>
          </ViewBoxImages>
        ) : null}
        <HeaderTitle>
          Antes de enviar, confira se as fotos atendem às espeficações
        </HeaderTitle>
        <ViewBox>
          <View style={{ flexDirection: 'row' }}>
            <IconMaterialIcons
              name="lens"
              size={8}
              style={{ marginTop: 10, marginRight: 5 }}
            />
            <ViewText>
              Tire uma foto que garanta boa leitura das informações
            </ViewText>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconMaterialIcons
              name="lens"
              size={8}
              style={{ marginTop: 10, marginRight: 5 }}
            />
            <ViewText>
              Aproxime bem a câmera e ajuste o foco para um melhor resultado
            </ViewText>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconMaterialIcons
              name="lens"
              size={8}
              style={{ marginTop: 10, marginRight: 5 }}
            />
            <ViewText>
              É necessário frente e verso dos documentos solicitados
            </ViewText>
          </View>
        </ViewBox>
      </Container>
      <View style={{ alignItems: 'center' }}>
        <ButtonWrapper>
          <ButtonPrimary title="Usar fotos" onPress={() => goRegister()} />
        </ButtonWrapper>
      </View>
    </SafeAreaView>
  );
};

export default ValidadePictures;
