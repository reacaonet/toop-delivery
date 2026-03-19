import React, {FunctionComponent} from 'react';
import {StatusBar, View, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Container,
  CustomHeader,
  ViewText,
  ButtonWrapper,
  HeaderTitle,
  ViewBox,
  SafeAreaView,
} from './styles';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import {Colors} from '../../styles';
import {registerDeliveryMan} from '../../services/provider/deliveryMan';
import {StorageGet} from '../../services/deviceStorage';

type SendRegisterProps = {
  navigation: any;
};

const SendRegister: FunctionComponent<SendRegisterProps> = ({
  navigation,
}: SendRegisterProps) => {
  const sendData = async () => {
    const {
      name,
      cpf,
      location,
      celphone,
      email,
      city,
      city_id,
      state,
      state_id,
      selfie,
      cnh,
      documents,
      typeVehicle,
    } = await StorageGet('Register');

    const data = {
      name,
      location,
      cpf,
      celphone,
      email,
      city,
      city_id,
      state,
      state_id,
      imageSelfie: selfie,
      imagesDocuments: documents,
      imagesCnh: cnh,
      vehicleType: typeVehicle,
      status: 'PENDING',
    };

    const result = await registerDeliveryMan(data);

    if (!result.data) {
      Alert.alert(
        'Oops',
        'Ocorreu um erro ao enviar o seu cadastro. Tente novamente!',
      );
    } else {
      Alert.alert('Sucesso!', 'Deu tudo certo. Agora é só aguardar!');
    }

    navigation.navigate('Login', {
      screen: 'Login',
    });
  };

  return (
    <>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <CustomHeader>
        <Icon
          name="chevron-left"
          size={50}
          color={Colors.PRIMARY}
          style={{position: 'absolute', left: 0}}
          onPress={() => navigation.goBack()}
        />
      </CustomHeader>
      <SafeAreaView style={{flex: 1}}>
        <Container>
          <HeaderTitle>Que bom que está aqui!</HeaderTitle>
          <HeaderTitle>
            Agora que concluiu seu cadastro, é só enviar e aguardar nosso
            contato após a validação de seus dados.
          </HeaderTitle>
          <ViewBox>
            <ViewText>
              Ao enviar seus dados, você se responsabiliza inteiramente com a
              sua veracidade?
            </ViewText>
          </ViewBox>
        </Container>
        <View style={{alignItems: 'center'}}>
          <ButtonWrapper>
            <ButtonPrimary
              title="Concordar e enviar"
              onPress={() => sendData()}
            />
          </ButtonWrapper>
        </View>
      </SafeAreaView>
    </>
  );
};

export default SendRegister;
