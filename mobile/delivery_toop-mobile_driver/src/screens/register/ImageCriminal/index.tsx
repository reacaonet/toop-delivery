/* eslint-disable prettier/prettier */
import React from 'react';
import messaging from '@react-native-firebase/messaging';
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

import { updatePreRegistration } from '../../../services//provider/preRegistration/update';
import { uploadDocument } from '../../../services/sendImages/fileUpload';

import { Typography, Colors } from '../../../styles';

/** Service */
import pickFile from './../Camera';
import pickDocument from '../../../services/documents';

interface Props { }

const ImageCriminal: React.FC<Props> = ({ }) => {
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
    const data = await pickDocument();

    if (!data) {
      return Alert.alert(
        'Selecionar Documento',
        'Não foi possível selecionar arquivo',
      );
    }

    setPicture(data);

    const id = state?.id;

    try {
      setLoad(true);
      const response = await uploadDocument(data, 'mobility/driver');
      const token = await refreshToken();

      if (response.url) {
        const objectToPhoto = {
          CriminalRecord: response.url,
          token: token,
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
              CriminalRecord: response.url,
            },
          });

          navigation.navigate('Register', { screen: 'Bank' });
        } catch (error) {
          setPicture(null);
          console.log(error, ' error');
        }
      } else {
        return Alert.alert(
          'Selecionar Documento',
          'Não foi possível enviar documento, por favor tente mais tarde!',
        );
      }
    } catch (error) {
      setPicture(null);
      console.log(error, ' error');
    }

    setLoad(false);
  };

  const refreshToken = async () => {
    return await messaging().getToken();
  };

  const sendData = async () => {
    const id = state?.id;
    try {
      setLoad(true);
      const response: any = await uploadDocument(picture, 'mobility/driver');

      if (response.url) {
        let token = await refreshToken();

        const objectToPhoto = {
          CriminalRecord: response.url,
          token: token,
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
              CriminalRecord: response.url,
            },
          });

          navigation.navigate('Register', { screen: 'Bank' });
        } catch (error) {
          console.log(error, ' error');
        }
      } else {
        Alert.alert(
          'Enviar Arquivo',
          'Não foi possível enviar arquivo, por favor tente novamente!',
        );
      }
    } catch (error) {
      console.log(error, ' error');
      Alert.alert(
        'Selecionar Documento',
        'Não foi possível enviar o documento #criminal',
      );
    }

    setLoad(false);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>
        <KeyboardAvoidingView>
          {!picture?.uri ? (
            <View style={styles.center}>
              <View style={styles.loginPhoneContainer}>
                <Text style={styles.title}>
                  {'Anexar Certificado de \n'}
                  <Text style={styles.sub}>Registro Criminal</Text>
                </Text>
              </View>

              <Text style={styles.req}>
                • Anexar pdf ou uma imagem legível.
              </Text>

              <Image
                style={styles.image}
                resizeMode="contain"
                source={require('../../../assets/images/criminal.png')}
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
                  onPress={() => sendData()}>
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
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 7,
  },
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    alignItems: 'stretch',
    justifyContent: 'center',
    flexGrow: 1,
    marginTop: 0,
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
    fontFamily: Typography.FONT_FAMILY_BOLD,
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
    height: 200,
    marginTop: 40,
    marginBottom: 10,
    borderRadius: 5,
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
    marginBottom: 10,
  },
  touchButtonSelectImage: {
    padding: 10,
    width: '48%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    elevation: 3,
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

export default ImageCriminal;
