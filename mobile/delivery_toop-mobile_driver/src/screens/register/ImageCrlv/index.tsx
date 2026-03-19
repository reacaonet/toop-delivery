import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePreRegistration } from '../../../services/provider/preRegistration/update';
import {
  fileUpload,
  uploadDocument,
} from '../../../services/sendImages/fileUpload';

import { Typography, Colors } from '../../../styles';

/** Service */
import pickFile from './../Camera';
import pickDocument from '../../../services/documents';

interface Props { }

const ImageCrlv: React.FC<Props> = ({ }) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const state: any = useSelector((state: any) => state?.preRegistration);

  const [load, setLoad] = React.useState(false);
  const [picture, setPicture] = React.useState<any>();
  const [vehicleManufacturer, setVehicleManufacturer] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNameplate, setVehicleNameplate] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  const selectImage = async (type: any) => {
    try {
      const data = await pickFile(type, 'photo');

      if (!data?.uri) {
        return;
      }

      setPicture(data);
    } catch (err) {
      Alert.alert(
        'Tirar Foto',
        'Não foi possível tirar foto, por favor tente novamente!',
      );
    }
  };

  const selectDocument = async () => {
    const data = await pickDocument();

    if (!data) {
      return Alert.alert(
        'Download de Documento',
        'Não foi possível selecionar arquivo',
      );
    }

    setPicture(data);
  };

  const sendData = async () => {
    if (!vehicleManufacturer) {
      return Alert.alert('Formulário', 'Informe a Marca');
    }

    if (!vehicleModel) {
      return Alert.alert('Formulário', 'Informe o Modelo');
    }

    if (!vehicleNameplate) {
      return Alert.alert('Formulário', 'Informe a placa');
    }

    if (!vehicleYear || !Number(vehicleYear)) {
      return Alert.alert('Formulário', 'Informe o ano corretamente');
    }

    if (!vehicleColor) {
      return Alert.alert('Formulário', 'Informe a cor do veículo');
    }

    await sendForm();
  };

  const sendForm = async () => {
    try {
      const id = state?.id;
      setLoad(true);
      const response: any = await uploadDocument(picture, 'mobility/driver');

      if (response.url) {
        const objectToPhoto = {
          CRLVDocumentPhoto: response.url,
          vehicleManufacturer:
            vehicleManufacturer.charAt(0).toUpperCase() +
            vehicleManufacturer.slice(1),
          vehicleModel:
            vehicleModel.charAt(0).toUpperCase() + vehicleModel.slice(1),
          vehicleNameplate: vehicleNameplate.toUpperCase(),
          vehicleYear,
          vehicleColor:
            vehicleColor.charAt(0).toUpperCase() + vehicleColor.slice(1),
        };
        try {
          const respRegister = await updatePreRegistration(id, objectToPhoto);
          setLoad(false);

          if (respRegister && respRegister.errMessage) {
            return Alert.alert('Cadastro', respRegister.errMessage);
          }

          dispatch({
            type: 'SET_REGISTRATION',
            payload: {
              ...state,
              id: id,
              CRLVDocumentPhoto: response.url,
            },
          });

          navigation.navigate('Register', { screen: 'ImageCriminal' });
        } catch (error) {
          console.log(error, ' error');
          Alert.alert(
            'Selecionar Documento',
            'Não foi possível enviar o documento #crlv',
          );
        }
      } else {
        Alert.alert(
          'Enviar Arquivo',
          'Não foi possível enviar arquivo, por favor tente novamente!',
        );
      }
    } catch (err) {
      console.log(err, ' error');
      Alert.alert(
        'Selecionar Documento',
        'Não foi possível enviar o documento #crlv',
      );
    }

    setLoad(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
      <ScrollView contentContainerStyle={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.content}>
          {!picture?.uri ? (
            <View style={styles.center}>
              <View style={styles.loginPhoneContainer}>
                <Text style={styles.title}>
                  Tire ou envie uma <Text style={styles.sub}>foto</Text> do
                  Livrete
                </Text>
              </View>

              <Text style={styles.req}>
                • A categoria do veículo precisa ser “particular”
              </Text>
              <Text style={styles.req}>
                • Veículo 4 portas - Ano mínimo: 2010
              </Text>
              <Text style={styles.req}>
                • Certifique-se de que todas as informações estejam legíveis e
                sem cortes
              </Text>
              <Text style={styles.req}>
                • O documento deve estar aberto como na figura abaixo
              </Text>

              <Image
                style={styles.image}
                resizeMode="contain"
                source={require('../../../assets/images/crlv.png')}
              />

              <TouchableOpacity
                style={[
                  styles.touchButtonSelectDocument,
                  { width: Dimensions.get('window').width - 50 },
                ]}
                onPress={() => selectDocument()}>
                <Text style={styles.txtButtonLogin}>DOWNLOAD DE DOCUMENTO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.touchButtonSelectImage, { width: '100%' }]}
                onPress={() => selectImage('camera')}>
                <Text style={styles.txtButtonLogin}>TIRAR FOTO</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.center}>
              <View style={styles.loginPhoneContainer}>
                <Text style={styles.title}>Usar esta foto?</Text>
              </View>

              <Text style={styles.req}>
                Os seus documentos serão analisados para validação. Poderá
                acompanhar o processo no menu motorista.
              </Text>

              {picture &&
                picture.type &&
                `${picture.type}`.search('image') >= 0 &&
                picture?.uri ? (
                <Image style={[styles.image]} source={{ uri: picture.uri }} />
              ) : null}

              <TextInput
                style={styles.inputStyle}
                editable={true}
                placeholder="Fabricante"
                placeholderTextColor={Colors.GRAY_MAX_DARK}
                value={vehicleManufacturer}
                onChangeText={setVehicleManufacturer}
                returnKeyType="done"
              />

              <TextInput
                style={styles.inputStyle}
                editable={true}
                placeholder="Modelo"
                placeholderTextColor={Colors.GRAY_MAX_DARK}
                value={vehicleModel}
                onChangeText={setVehicleModel}
                returnKeyType="done"
              />

              <TextInput
                style={styles.inputStyle}
                editable={true}
                placeholder="Ano"
                placeholderTextColor={Colors.GRAY_MAX_DARK}
                value={vehicleYear}
                onChangeText={setVehicleYear}
                returnKeyType="done"
              />

              <TextInput
                style={styles.inputStyle}
                editable={true}
                placeholder="Matricula"
                placeholderTextColor={Colors.GRAY_MAX_DARK}
                value={vehicleNameplate}
                onChangeText={setVehicleNameplate}
                returnKeyType="done"
              />

              <TextInput
                style={styles.inputStyle}
                editable={true}
                placeholder="Cor"
                placeholderTextColor={Colors.GRAY_MAX_DARK}
                value={vehicleColor}
                onChangeText={setVehicleColor}
                returnKeyType="done"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  disabled={load}
                  style={styles.touchButtonNewImage}
                  onPress={() => selectImage('camera')}>
                  <Text style={styles.txtButtonNewImage}>TIRAR OUTRA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={load}
                  style={styles.touchButtonSelectImage}
                  onPress={sendData}>
                  {load ? (
                    <ActivityIndicator size="small" color={Colors.WHITE} />
                  ) : (
                    <Text style={styles.txtButtonLogin}>ENVIAR</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 7,
    // paddingBottom: 50,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    // alignItems: 'stretch',
    // justifyContent: 'center',
    flex: 1,
    padding: 15,
  },
  loginPhoneContainer: {
    width: '100%',
  },
  title: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
    marginBottom: 20,
  },
  sub: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  inputPhone: {
    color: Colors.BLACK,
    marginTop: 30,
    alignSelf: 'flex-start',
    width: '90%',
    padding: 5,
    marginLeft: 15,
    borderBottomColor: Colors.GRAY,
    borderBottomWidth: 0.7,
    borderStyle: 'solid',
    backgroundColor: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    lineHeight: Typography.FONT_SIZE_16,
  },

  safeAreaView: {
    marginTop: 20,
  },

  req: {
    fontSize: Typography.FONT_SIZE_15,
    alignSelf: 'flex-start',
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_DARK,
  },

  image: {
    width: '100%',
    height: 120,
    marginTop: 40,
    marginBottom: 10,
    borderRadius: 5,
  },
  containerVehicle: {
    // flex: 1,
    // backgroundColor: 'red',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  touchButtonSelectDocument: {
    padding: 10,
    width: '48%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.GRAY_MEDIUM,
    elevation: 3,
    marginTop: 5,
  },
  touchButtonSelectImage: {
    padding: 10,
    width: '48%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    elevation: 3,
    marginBottom: 10,
    marginTop: 10,
  },
  touchButtonNewImage: {
    padding: 10,
    width: '48%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.GRAY_LIGHT,
    elevation: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  txtButtonLogin: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: 14,
    color: Colors.WHITE,
  },
  txtButtonNewImage: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: 14,
    color: Colors.GRAY_MAX_DARK,
  },
  inputStyle: {
    backgroundColor: Colors.WHITE,
    elevation: 3,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: Colors.TEXT,
  },
});

export default ImageCrlv;
