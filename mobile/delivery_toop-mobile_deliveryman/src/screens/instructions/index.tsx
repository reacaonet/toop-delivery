import React, {FunctionComponent, useState} from 'react';
import {StatusBar, View, Modal} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  Container,
  CustomHeader,
  ViewText,
  HeaderTitle,
  ViewBox,
  ButtonDocument,
  TextButtonDocument,
  ViewButtonWrapper,
  SafeAreaView,
  ContainerHeader,
} from './styles';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import {Colors} from '../../styles';
import TypeDocuments from './components/typeDocuments';

type InstructionsProps = {
  navigation: any;
  route: any;
};

const Instructions: FunctionComponent<InstructionsProps> = ({
  navigation,
  route: Route,
}: InstructionsProps) => {
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [type, setType] = useState(() => {
    return Route.params.type ?? '';
  });

  const goTakePictures = (quantityDocuments: number) => {
    navigation.navigate('TakePictures', {
      screen: 'TakePictures',
      type,
      quantityDocuments,
    });
  };

  const nextStep = () => {
    if (type === 'documents') {
      setIsModalConfirm(true);
      return;
    }

    goTakePictures(2);
  };

  return (
    <ContainerHeader>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalConfirm}
        onRequestClose={() => setIsModalConfirm(false)}>
        <TypeDocuments
          modal={setIsModalConfirm}
          goTakePictures={goTakePictures}
        />
      </Modal>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <CustomHeader>
        <IconMaterialIcons
          name="chevron-left"
          size={50}
          color={Colors.PRIMARY}
          style={{position: 'absolute', left: 0}}
          onPress={() => navigation.goBack()}
        />
      </CustomHeader>
      <SafeAreaView>
        <Container>
          <HeaderTitle>
            Siga as instruções para tirar a sua selfie e fotos dos documentos
            solicitados para cadastro.
          </HeaderTitle>
          <ViewBox>
            <View style={{flexDirection: 'row'}}>
              <IconMaterialIcons
                name="lens"
                size={8}
                style={{marginTop: 10, marginRight: 5}}
              />
              <ViewText>
                Tire uma foto que garanta boa leitura das informações
              </ViewText>
            </View>
            <View style={{flexDirection: 'row'}}>
              <IconMaterialIcons
                name="lens"
                size={8}
                style={{marginTop: 10, marginRight: 5}}
              />
              <ViewText>
                Aproxime bem a câmera e ajuste o foco para um melhor resultado
              </ViewText>
            </View>
            <View style={{flexDirection: 'row'}}>
              <IconMaterialIcons
                name="lens"
                size={8}
                style={{marginTop: 10, marginRight: 5}}
              />
              <ViewText>
                É necessário frente e verso dos documentos solicitados
              </ViewText>
            </View>
          </ViewBox>
        </Container>
        <View style={{alignItems: 'center'}}>
          <ViewButtonWrapper>
            <ButtonPrimary title="Continuar" onPress={() => nextStep()} />
          </ViewButtonWrapper>
        </View>
      </SafeAreaView>
    </ContainerHeader>
  );
};

export default Instructions;
