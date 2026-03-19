/* eslint-disable prettier/prettier */
import React from 'react';

import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
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

const ImageCnh: React.FC<Props> = ({ }) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const state: any = useSelector((state: any) => state?.preRegistration);

  const [load, setLoad] = React.useState(false);
  const [picture, setPicture] = React.useState<any>();

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
    setLoad(true);
    const data = await pickDocument();

    if (!data) {
      setLoad(false);
      return Alert.alert(
        'Selecionar Documento',
        'Não foi possível selecionar arquivo',
      );
    } else if (data && data.errMessage) {
      setLoad(false);
      return Alert.alert(
        'Selecionar Documento',
        data.errMessage,
      );
    }

    try {
      const id = state?.id;

      setLoad(true);
      const response: any = await uploadDocument(data, 'mobility/driver');

      if (response.url) {
        const objectToPhoto = {
          CNHDocumentPhoto: response.url,
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
              CNHDocumentPhoto: response.url,
            },
          });

          return navigation.navigate('Register', { screen: 'ImageCrlv' });
        } catch (error) {
          console.log(error, ' error');
        }
      } else if (response.errMessage) {
        return Alert.alert(
          'Selecionar Documento',
          response.errMessage
        );
      }
      else {
        Alert.alert(
          'Selecionar Documento',
          'Não foi possível enviar documento, por favor tente mais tarde!',
        );
      }
    } catch (err) {
      console.log(err, ' error');
      Alert.alert(
        'Selecionar Documento',
        'Não foi possível enviar o documento #cnh',
      );
    }

    setLoad(false);
  };

  const sendData = async () => {
    const id = state?.id;

    try {
      setLoad(true);
      const response: any = await uploadDocument(picture, 'mobility/driver');

      if (response.url) {
        const objectToPhoto = {
          CNHDocumentPhoto: response.url,
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
              CNHDocumentPhoto: response.url,
            },
          });

          navigation.navigate('Register', { screen: 'ImageCrlv' });
        } catch (error) {
          console.log(error, ' error');
        }
      } else {
        Alert.alert(
          'Tirar Foto',
          'Não foi possível enviar foto, por favor tente mais tarde!',
        );
      }
    } catch (error) {
      console.log(error, ' error');
      Alert.alert('Selecionar Foto', 'Não foi possível enviar a foto #cnh');
    }

    setLoad(false);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>
        <KeyboardAvoidingView style={styles.containerKeyboard}>
          {!picture?.uri ? (
            <View style={styles.center}>
              <View style={styles.loginPhoneContainer}>
                <Text style={styles.title}>
                  Tire e envie uma <Text style={styles.sub}>foto</Text> da sua
                  Certidão Nacional de habilitação com EAR - CNH
                </Text>
              </View>

              <Text style={styles.req}>
                • CNH com nota do exercício de atividade remunerada (EAR). Na
                ausência do mesmo consulte o órgão responsável.
              </Text>
              <Text style={styles.req}>
                • Certifique-se de que todas as informações estejam legíveis e
                sem cortes
              </Text>
              <Text style={styles.req}>
                • O documento deve estar aberto como na figura abaixo
              </Text>
              <View style={{ marginBottom: 10 }} />
              <Image
                style={styles.image}
                resizeMode="contain"
                source={require('../../../assets/images/cnh.png')}
              />

              <TouchableOpacity
                disabled={load}
                style={[
                  styles.touchButtonSelectDocument,
                  { width: Dimensions.get('window').width - 50 },
                ]}
                onPress={() => selectDocument()}>
                {!load ? (
                  <Text style={styles.txtButtonLogin}>
                    DOWNLOAD DE DOCUMENTO
                  </Text>
                ) : (
                  <ActivityIndicator size={'small'} color={Colors.WHITE} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                disabled={load}
                style={[
                  styles.touchButtonSelectImage,
                  { width: Dimensions.get('window').width - 50 },
                ]}
                onPress={() => selectImage('camera')}>
                {!load ? (
                  <Text style={styles.txtButtonLogin}>TIRAR FOTO</Text>
                ) : (
                  <ActivityIndicator size={'small'} color={Colors.WHITE} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.center}>
              <View style={styles.loginPhoneContainer}>
                <Text style={styles.title}>Usar esta foto?</Text>
              </View>

              <Text style={styles.req}>
                Seus documentos serão analisados para validação. Poderá
                acompanhar o processo no menu motorista.
              </Text>

              {picture &&
                picture.type &&
                `${picture.type}`.search('image') >= 0 &&
                picture?.uri ? (
                <Image
                  style={{
                    width: Dimensions.get('window').width * 0.7,
                    height: Dimensions.get('window').width * 0.7,
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                  resizeMode="contain"
                  source={{
                    uri: picture?.uri,
                  }}
                />
              ) : null}

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
                    <Text style={styles.txtButtonLogin}>ENVIAR FOTO</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // backgroundColor: Colors.WHITE,
    paddingHorizontal: 7,
  },
  containerKeyboard: {
    marginBottom: 10,
    alignItems: 'center',
  },
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
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
    height: 200,
    marginTop: 20,
    marginBottom: 10,
    // borderRadius: 5,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  touchButtonSelectImage: {
    padding: 10,
    width: '48%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    elevation: 3,
    marginTop: 5,
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
  touchButtonNewImage: {
    padding: 10,
    width: '48%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.GRAY_LIGHT,
    elevation: 1,
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
});

export default ImageCnh;
