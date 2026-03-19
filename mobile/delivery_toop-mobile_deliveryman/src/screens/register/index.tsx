/* eslint-disable react-hooks/exhaustive-deps */
import React, {useRef, useState, FunctionComponent, useEffect} from 'react';
import {StatusBar, Alert} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {
  customPickerStyles,
  Container,
  Title,
  KeyboardAvoidingView,
  ButtonWrapper,
  Row,
  CustomHeader,
  HeaderTitle,
  View,
  ViewText,
  ViewSubText,
  ViewItem,
  ImageVehicle,
  ImageDocuments,
  TouchImageVehicle,
  TouchImageDocuments,
  ViewSubTextVehicle,
  ViewSubTextDocument,
  SafeAreaView,
} from './styles';
import InputText from '../../components/shared/input/inputText';
import InputTextMaskPhone from '../../components/shared/InputTextMaskPhone/inputTextMaskPhone';
import InputTextMaskCpf from '../../components/shared/InputTextMaskCpf/inputTextMaskCpf';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import ButtonDisable from '../../components/shared/button/ButtonDisable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import carUnselected from '../../assets/images/register/carUnselected.png';
import carSelected from '../../assets/images/register/carSelected.png';
import motorcycleUnselected from '../../assets/images/register/motorcycleUnselected.png';
import motorcycleSelected from '../../assets/images/register/motorcycleSelected.png';
import bikeUnselected from '../../assets/images/register/bikeUnselected.png';
import bikeSelected from '../../assets/images/register/bikeSelected.png';
import selfieUnselectedDisable from '../../assets/images/register/selfieUnselectedDisable.png';
import selfieSelectedDisable from '../../assets/images/register/selfieSelectedDisable.png';
import selfieUnselected from '../../assets/images/register/selfieUnselected.png';
import selfieSelected from '../../assets/images/register/selfieSelected.png';
import cnhUnselectedDisable from '../../assets/images/register/cnhUnselectedDisable.png';
import cnhSelectedDisable from '../../assets/images/register/cnhSelectedDisable.png';
import cnhUnselected from '../../assets/images/register/cnhUnselected.png';
import cnhSelected from '../../assets/images/register/cnhSelected.png';
import documentUnselectedDisable from '../../assets/images/register/documentUnselectedDisable.png';
import documentSelectedDisable from '../../assets/images/register/documentSelectedDisable.png';
import documentUnselected from '../../assets/images/register/documentUnselected.png';
import documentSelected from '../../assets/images/register/documentSelected.png';
import {replaceSpecialChars} from '../../utils';
import {StorageGet, StorageSet} from '../../services/deviceStorage';
import Permission from '../../services/permissions/permissions';
import {locationCurrent} from '../../services/location/watchPosition';

/** Service */
import {listState, listCity} from '../../services/provider/address/list';

type RegisterProps = {
  navigation: any;
};

const Register: FunctionComponent<RegisterProps> = ({
  navigation,
}: RegisterProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [celphone, setCelphone] = useState('');
  const [city, setCity] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [selfie, setSelfie] = useState('');
  const [cnh, setCnh] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [enabledSendButton, setEnabledSendButton] = useState(false);
  const [location, setLocation]: any = useState(null);
  const attemps = useRef(0);
  const [states, setStates] = useState([]);
  const [citys, setCitys] = useState([]);

  const currentState: any = useRef(null);
  const currentCity: any = useRef(null);

  useEffect(() => {
    const verifyPermissions = async () => {
      const isPermission = await Permission().isPermission();
      if (!isPermission) {
        return navigation.navigate('LocationPermition');
      }

      getCoordinates();
      // console.log('resp', resp);
    };

    verifyPermissions();
    stateSelect();
  }, []);

  useEffect(() => {
    const getRegister = async () => {
      const register = await StorageGet('Register');
      if (!register) {
        return;
      }

      setEmail(register.email ?? '');
      setName(register.name ?? '');
      setCpf(register.cpf ?? '');
      setCelphone(register.celphone ?? '');
      setCity(register.city ?? '');
      setVehicle(register.vehicle ?? '');
      setSelfie(register.selfie ?? '');
      setCnh(register.cnh ?? '');
      setDocuments(register.documents ?? '');
      setVehicle(register.typeVehicle ?? '');
    };

    getRegister();
  }, []);

  useEffect(() => {
    let validateData = false;
    if (
      email !== '' &&
      name !== '' &&
      cpf !== '' &&
      celphone !== '' &&
      city !== '' &&
      vehicle !== ''
    ) {
      validateData = true;
    }

    let validatePictureDocuments = false;

    if (vehicle === 'BIKE' && selfie !== '' && documents.length >= 2) {
      validatePictureDocuments = true;
    } else if (selfie !== '' && cnh.length === 2) {
      validatePictureDocuments = true;
    }

    setEnabledSendButton(validateData && validatePictureDocuments);
  }, [email, name, cpf, celphone, city, vehicle, selfie, cnh, documents]);

  const getCoordinates: any = async () => {
    const resp: any = await locationCurrent();

    if (attemps.current <= 5 && (!resp || !resp.latitude)) {
      attemps.current = attemps.current + 1;
      setTimeout(() => {
        return getCoordinates();
      }, 1000);
    } else {
      setLocation({
        lat: resp.latitude,
        lng: resp.longitude,
      });
    }
  };

  const getVehicle = (type: string) => {
    if (vehicle === type) {
      setVehicle('');
    } else {
      setVehicle(type);
    }
  };

  const getImageCar = () => {
    if (vehicle === 'CAR') {
      return carSelected;
    } else {
      return carUnselected;
    }
  };

  const getImageMotorcycle = () => {
    if (vehicle === 'MOTORCYCLE') {
      return motorcycleSelected;
    } else {
      return motorcycleUnselected;
    }
  };

  const getImageBike = () => {
    if (vehicle === 'BIKE') {
      return bikeSelected;
    } else {
      return bikeUnselected;
    }
  };

  const getImageSelfie = () => {
    if (vehicle !== '') {
      if (selfie !== '') {
        return selfieSelected;
      }
      return selfieUnselected;
    } else {
      if (selfie !== '') {
        return selfieSelectedDisable;
      }
      return selfieUnselectedDisable;
    }
  };

  const getImageCnh = () => {
    if (vehicle === 'CAR' || vehicle === 'MOTORCYCLE') {
      if (cnh && cnh.length > 0) {
        return cnhSelected;
      }
      return cnhUnselected;
    } else {
      if (cnh && cnh.length > 0) {
        return cnhSelectedDisable;
      }
      return cnhUnselectedDisable;
    }
  };

  const getImageDocument = () => {
    if (vehicle === 'BIKE') {
      if (documents && documents.length > 0) {
        return documentSelected;
      }
      return documentUnselected;
    } else {
      if (documents && documents.length > 0) {
        return documentSelectedDisable;
      }
      return documentUnselectedDisable;
    }
  };

  const updateRegister = async () => {
    const register = {
      name: name,
      location: {
        lat: currentCity.current?.latitude,
        lng: currentCity.current?.longitude,
      },
      cpf: replaceSpecialChars(cpf),
      celphone: replaceSpecialChars(celphone),
      email: email,
      city: currentCity.current?.name,
      city_id: currentCity.current?._id,
      state: currentState.current?.name,
      state_id: currentState.current?._id,
      typeVehicle: vehicle,
      selfie: selfie,
      cnh: cnh,
      documents: documents,
    };

    await StorageSet('Register', register);
  };

  const goInstructions = async (type: string) => {
    await updateRegister();

    navigation.navigate('Instructions', {screen: 'Instructions', type});
  };

  const goSendRegister = async () => {
    if (celphone.length < 11) {
      Alert.alert('Oops', 'Informe um número de celular válido.');
      return;
    }

    if (!currentState.current || !currentState.current._id) {
      return Alert.alert('Formulário', 'Selecione um Estado');
    }

    if (!currentCity.current || !currentCity.current._id) {
      return Alert.alert('Formulário', 'Selecione uma Cidade');
    }

    if (!location) {
      Alert.alert(
        'Formulário',
        'Não conseguimos obter sua localização, por favor ative o GPS para continuar',
      );
      return;
    }

    await updateRegister();
    navigation.navigate('SendRegister', {screen: 'SendRegister'});
  };

  const goLogin = async () => {
    navigation.navigate('Login', {screen: 'Login'});
  };

  const AlterEnabledSelfie = () => {
    if (vehicle !== '') {
      return false;
    } else {
      return true;
    }
  };

  const AlterEnabledCnh = () => {
    if (vehicle === 'CAR' || vehicle === 'MOTORCYCLE') {
      return false;
    } else {
      return true;
    }
  };

  const AlterEnabledDocument = () => {
    if (vehicle === 'BIKE') {
      return false;
    } else {
      return true;
    }
  };

  const stateSelect = async () => {
    let resp = await listState({hasFranchise: true});
    resp = resp.map((item: any) => {
      return {
        ...item,
        label: item.name,
        value: item._id,
      };
    });
    console.log(resp);
    setStates(resp);
  };

  const citySelect = async (state: number) => {
    if (!state) {
      return;
    }

    let resp = await listCity({state: state});
    resp = resp.map((item: any) => {
      return {
        ...item,
        label: item.name,
        value: item._id,
      };
    });

    setCitys(resp);

    const findState = states.find((item: any) => item._id === state);

    if (findState) {
      currentState.current = findState;
    }
  };

  const selectCurrent = (id: string) => {
    if (!id) {
      return;
    }

    const findCity: any = citys.find((item: any) => item._id === id);
    if (findCity) {
      currentCity.current = findCity;
      setCity(findCity.name);
    }
  };

  return (
    <>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />
      <CustomHeader>
        <Icon
          name="chevron-left"
          size={38}
          color="#fff"
          style={{position: 'absolute', left: 0}}
          onPress={() => goLogin()}
        />
        <HeaderTitle>Cadastro</HeaderTitle>
      </CustomHeader>

      <SafeAreaView>
        <Container>
          <KeyboardAvoidingView>
            <Row>
              <InputText
                title="Nome completo"
                value={name}
                setValue={setName}
              />
            </Row>
            <Row>
              <InputTextMaskCpf
                title="CPF"
                subTitle="Digite apenas os números do seu CPF"
                value={cpf}
                setValue={setCpf}
              />
            </Row>
            <Row>
              <InputTextMaskPhone
                title="Telefone"
                subTitle="Número pessoal para o retorno desta solicitação"
                value={celphone}
                setValue={setCelphone}
              />
            </Row>
            <Row>
              <InputText
                title="E-mail"
                subTitle="Para confirmações, avisos e atualizações"
                value={email}
                setValue={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Row>

            <Title>Estado</Title>
            <RNPickerSelect
              style={customPickerStyles}
              onValueChange={(value) => citySelect(value)}
              useNativeAndroidPickerStyle={false}
              placeholder={{
                label: 'Selecione Estado',
                value: null,
              }}
              items={states}
            />

            <Title>Cidade</Title>
            <RNPickerSelect
              style={customPickerStyles}
              onValueChange={(value) => selectCurrent(value)}
              useNativeAndroidPickerStyle={false}
              placeholder={{
                label: 'Selecione Estado',
                value: null,
              }}
              items={citys}
            />

            {/* <Row>
              <InputText title="Cidade" value={city} setValue={setCity} />
            </Row> */}

            <View>
              <ViewText>Tipo de veiculo</ViewText>
              <ViewSubText>
                Escolha um tipo de condução para suas entregas:
              </ViewSubText>

              <ViewItem>
                <TouchImageVehicle onPress={() => getVehicle('CAR')}>
                  <ImageVehicle source={getImageCar()} />
                  <ViewSubTextVehicle>Carro</ViewSubTextVehicle>
                </TouchImageVehicle>
                <TouchImageVehicle onPress={() => getVehicle('MOTORCYCLE')}>
                  <ImageVehicle source={getImageMotorcycle()} />
                  <ViewSubTextVehicle>Moto</ViewSubTextVehicle>
                </TouchImageVehicle>
                <TouchImageVehicle onPress={() => getVehicle('BIKE')}>
                  <ImageVehicle source={getImageBike()} />
                  <ViewSubTextVehicle>Bicicleta</ViewSubTextVehicle>
                </TouchImageVehicle>
              </ViewItem>

              <ViewText>Fotos e documentos</ViewText>
              <ViewSubText>Informe os documentos solicitados:</ViewSubText>

              <ViewItem>
                <TouchImageDocuments
                  disabled={AlterEnabledSelfie()}
                  onPress={() => goInstructions('selfie')}>
                  <ImageDocuments source={getImageSelfie()} />
                  <ViewSubTextDocument>Selfie</ViewSubTextDocument>
                </TouchImageDocuments>
                <TouchImageDocuments
                  disabled={AlterEnabledCnh()}
                  onPress={() => goInstructions('cnh')}>
                  <ImageDocuments source={getImageCnh()} />
                  <ViewSubTextDocument>CNH</ViewSubTextDocument>
                </TouchImageDocuments>
                <TouchImageDocuments
                  disabled={AlterEnabledDocument()}
                  onPress={() => goInstructions('documents')}>
                  <ImageDocuments source={getImageDocument()} />
                  <ViewSubTextDocument>RG - CPF</ViewSubTextDocument>
                </TouchImageDocuments>
              </ViewItem>
            </View>

            <ButtonWrapper>
              {enabledSendButton ? (
                <ButtonPrimary
                  onPress={() => goSendRegister()}
                  title="Enviar cadastro"
                />
              ) : (
                <ButtonDisable title="Enviar cadastro" />
              )}
            </ButtonWrapper>
          </KeyboardAvoidingView>
        </Container>
      </SafeAreaView>
    </>
  );
};

export default Register;
