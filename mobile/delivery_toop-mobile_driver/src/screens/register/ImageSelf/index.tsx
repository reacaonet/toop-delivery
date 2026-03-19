import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
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

import pickFile from './../Camera';
import { Dimensions } from 'react-native';

interface Props { }

const ImageSelf: React.FC<Props> = ({ }) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const state: any = useSelector((state: any) => state?.preRegistration);

  const [load, setLoad] = React.useState(false);
  const [picture, setPicture] = React.useState<any>();

  const selectImage = async () => {
    try {
      const data = await pickFile('camera', 'photo');

      if (!data?.uri) {
        return;
      }

      setPicture(data);
    } catch (err: any) {
      Alert.alert('Erro ao tirar foto', err.message);
    }
  };

  const sendData = async () => {
    try {
      const id = state?.id;
      setLoad(true);
      const response: any = await uploadDocument(picture, 'mobility/driver');
      console.log(response);
      if (response.url) {
        const objectToPhoto = {
          selfiePhoto: response.url,
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
              selfiePhoto: response.url,
            },
          });

          navigation.navigate('Register', { screen: 'ImageCnh' });
        } catch (error) {
          console.log(error, ' error');
        }
      }
    } catch (error) {
      console.log(error, ' error');
    }

    setLoad(false);
  };

  return (
    <>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>
        <ScrollView style={styles.scrollStyle}>
          {!picture?.uri ? (
            <View style={styles.center}>
              <View style={styles.loginPhoneContainer}>
                <Text style={styles.title}>
                  Tire e envie uma <Text style={styles.sub}>selfie</Text> ou{' '}
                  <Text style={styles.sub}>foto </Text>pessoal
                </Text>
              </View>

              <Text style={styles.req}>
                ∙ Tire a foto em um lugar iluminado
              </Text>
              <Text style={styles.req}>∙ Não usar bonés ou óculos escuros</Text>
              <Text style={styles.req}>
                ∙ Registe seu rosto e ombros como na figura abaixo
              </Text>
              <View style={{ marginBottom: 10 }} />
              <Image
                style={styles.image}
                source={require('../../../assets/images/photo.png')}
                resizeMode={'contain'}
              />

              <View style={styles.touchContainer}>
                <TouchableOpacity
                  style={[styles.touchButtonSelectImage, { width: '100%' }]}
                  onPress={() => selectImage()}>
                  <Text style={styles.txtButtonLogin}>TIRAR FOTO</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.center}>
              <View style={styles.loginPhoneContainer}>
                <Text style={styles.title}>Usar esta foto?</Text>
              </View>

              <Text style={styles.req}>
                Fotos são usadas para autenticação de segurança para proteção do
                cliente e do motorista. Depois de enviada a foto não poderá ser
                trocada
              </Text>

              {picture && picture?.uri ? (
                <Image
                  style={styles.image}
                  source={{ uri: picture.uri }}
                  resizeMode={'contain'}
                />
              ) : null}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  disabled={load}
                  style={styles.touchButtonNewImage}
                  onPress={() => selectImage()}>
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
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 10,
  },
  iconGoBack: {
    color: Colors.BLACK,
  },
  scrollStyle: {
    flex: 1,
  },
  center: {
    height: Dimensions.get('window').height * 0.85,
    marginTop: 0,
    paddingHorizontal: 15,
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
    height: 200,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 5,
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
  touchContainer: {
    width: '90%',
    marginLeft: '10%',
    position: 'absolute',
    bottom: 5,
  },
});

export default ImageSelf;
