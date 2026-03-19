/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ButtonData, ButtonDataText } from './stylesButton';

import Icon from 'react-native-vector-icons/FontAwesome';
import { Typography, Colors } from '../../../styles';
import userAvatar from '../../../assets/images/photo.png';
import { Input, CheckBox } from 'react-native-elements';

import { maskDateToPt } from '../../../utils';
import database from '@react-native-firebase/database';

/** Service */
import { updateDriver } from '../../../services/provider/user/update';
import {
  fileUpload,
  uploadDocument,
} from '../../../services/sendImages/fileUpload';
import pickFile from '../../register/Camera';
import { deleteDriver } from '../../../services/provider/user/delete';
import config from '../../../config';

interface Props {
  cnh: any;
}

const DadosComp: React.FC<Props> = ({ cnh }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const [load, setLoad] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [picture, setPicture] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setName(user?.name || '');
      setPhone(user?.phone || '');
      setEmail(user?.email || '');
      setBirthDate(user?.birthDate || '');
    }
  }, [user]);

  const sendForm = async () => {
    try {
      setLoad(true);

      let payload = {
        name,
        phone,
        email,
        birthDate,
        password,
      };

      const response = await updateDriver(user?._id, payload);
      setLoad(false);

      if (response.errMessage) {
        return Alert.alert('Formulário', response.errMessage);
      }

      dispatch({
        type: 'SET_USER_SAGA',
        payload: {
          ...user,
          ...payload,
        },
      });

      navigation.navigate('DriverMap');
    } catch (err) {
      setLoad(true);
    }
  };

  const selectImage = async (type: any) => {
    try {
      const data = await pickFile(type, 'photo');

      if (!data?.uri) {
        return;
      }

      setLoad(true);
      const response: any = await uploadDocument(data, 'mobility/driver');

      if (response.url) {
        const objectToPhoto = {
          selfiePhoto: response.url,
        };

        const respUpdate = await updateDriver(user?._id, objectToPhoto);

        if (respUpdate.errMessage) {
          setLoad(false);
          return Alert.alert('Foto', respUpdate.errMessage);
        }

        dispatch({
          type: 'SET_USER_SAGA',
          payload: {
            ...user,
            selfiePhoto: [response.url],
          },
        });

        setLoad(false);
        navigation.navigate('DriverMap');
      }
    } catch (err) {
      console.log('fail select image', err);
    }

    setLoad(false);
  };

  const handleDeleteAccount = async () => {
    Alert.alert('Excluir Conta', 'Tem certeza que deseja excluir a conta?', [
      {
        text: 'Cancelar',

        onPress: () => console.log('Cancel Pressed'),

        style: 'cancel',
      },

      {
        text: 'Excluir',

        onPress: async () => {
          try {
            const response = await deleteDriver(user?._id);

            if (response.errMessage) {
              return Alert.alert('Formulário', response.errMessage);
            }

            database()
              .ref(`${config.FIREBASE_PATH}blacklist/driver/${user._id}`)

              .remove();

            dispatch({
              type: 'SET_USER_SAGA',

              payload: {},
            });

            setTimeout(() => {
              return navigation.navigate('Splash');
            }, 1000);
          } catch (err) {
            setLoad(true);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <View style={{ height: '90%', width: '100%', alignItems: 'center' }}>
        <TouchableOpacity style={styles.container}>
          <View style={styles.text}>
            <Text style={styles.title2}>ID PESSOAL:</Text>
            <Text style={styles.title3}>{user?._id}</Text>
          </View>

          {user?.selfiePhoto &&
            Array.isArray(user?.selfiePhoto) &&
            user?.selfiePhoto.length > 0 ? (
            <Image
              style={styles.image}
              source={{
                uri: user?.selfiePhoto[0],
              }}
            />
          ) : (
            <Image style={styles.image} source={userAvatar} />
          )}
        </TouchableOpacity>

        <View style={{ width: '90%', alignSelf: 'center' }}>
          <Text style={styles.name}>Nome Completo</Text>
          <Input
            placeholder="Digite o nome"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.name}>Data Nascimento</Text>
          <Input
            placeholder="Digite data nascimento"
            value={birthDate}
            onChangeText={(value: string) =>
              setBirthDate(maskDateToPt(value ?? ''))
            }
          />

          <Text style={styles.name}>Telefone</Text>
          <Input
            placeholder="Telefone"
            value={phone}
            editable={false}
            onChangeText={setPhone}
          />

          <Text style={styles.name}>Email</Text>
          <Input
            placeholder="Digite seu email"
            value={email}
            editable={false}
            onChangeText={setEmail}
          />

          <Text style={styles.name}>Senha</Text>
          <Input
            placeholder="Digite sua senha"
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={{
              type: 'font-awesome',
              name: !showPassword ? 'eye' : 'eye-slash',
              onPress: () => {
                setShowPassword(!showPassword);
              },
            }}
          />
        </View>

        {/* <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <Text style={styles.history}>Documentos</Text>
          </View>
        </View> */}

        {/* <View style={styles.containerFour}>
          <View style={styles.containButton}>
            <TouchableOpacity onPress={cnh}>
              <Text style={styles.cnh}>CNH - CARTEIRA DE HABILITAÇÃO</Text>
              <Text style={styles.pend}>
                {user?.cnhDocuments &&
                  Array.isArray(user?.cnhDocuments) &&
                  user?.cnhDocuments.length > 0
                  ? 'Aprovado'
                  : 'Pendente'}
              </Text>
            </TouchableOpacity>
          </View>

          {user?.cnhDocuments &&
            Array.isArray(user?.cnhDocuments) &&
            user?.cnhDocuments.length > 0 ? (
            <Icon name="check" size={40} style={styles.iconSucess} />
          ) : (
            <Icon
              name="exclamation-triangle"
              size={40}
              style={styles.iconDanger}
            />
          )}
        </View> */}

        {/* <TouchableOpacity
          style={styles.containerTwo}
          disabled={user?.selfiePhoto && Array.isArray(user?.selfiePhoto) && user?.selfiePhoto.length > 0}
          onPress={() => selectImage('camera')}
        >
          <View style={styles.containButton}>
            <Text style={styles.profile}>FOTO DE PERFIL</Text>
            <Text style={styles.pend}>
              {user?.selfiePhoto &&
                Array.isArray(user?.selfiePhoto) &&
                user?.selfiePhoto.length > 0
                ? 'Aprovado'
                : 'Pendente'}
            </Text>
          </View>
        </TouchableOpacity> */}

        <ButtonData primary onPress={() => sendForm()} disabled={load}>
          {!load ? (
            <ButtonDataText>Confirmar</ButtonDataText>
          ) : (
            <ActivityIndicator size={'small'} color="white" />
          )}
        </ButtonData>
        <ButtonData onPress={() => handleDeleteAccount()} disabled={load}>
          {!load ? (
            <ButtonDataText>Excluir Conta</ButtonDataText>
          ) : (
            <ActivityIndicator size={'small'} color="white" />
          )}
        </ButtonData>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },
  iconDanger: {
    color: Colors.DANGER,
    marginRight: 10,
    marginTop: 20,
  },
  iconSucess: {
    color: Colors.SUCCESS,
    marginRight: 10,
    marginTop: 20,
  },
  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: {
    width: '95%',
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containerTwo: {
    width: '90%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },
  containerThree: {
    width: '95%',
    height: 50,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containerFour: {
    width: '90%',
    height: 80,
    borderRadius: 2,
    marginTop: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  image: {
    borderRadius: 60,
    marginTop: 15,
    marginRight: 10,
    width: 55,
    height: 55,
  },

  name: {
    marginTop: 10,
    marginLeft: 15,
    width: '100%',
    textAlign: 'left',
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  box2: {
    height: 100,
    width: '90%',
    marginTop: 20,
    textAlign: 'left',
    backgroundColor: Colors.WHITE,
    alignSelf: 'center',
  },

  text: {
    flexDirection: 'column',
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  title2: {
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  title3: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  value: {
    bottom: 10,
    paddingRight: 20,
    position: 'absolute',
    width: '100%',
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_30,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  subTitle: {
    marginTop: 5,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  titleStreet: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },
  line: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },

  box: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
  },

  containButton: {
    marginTop: 15,
    height: '100%',
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button2: {
    flexDirection: 'row',
  },

  history: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  cnh: {
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.PRIMARY,
  },

  pend: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  profile: {
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  aprove: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_MEDIUM,
  },

  iconNext: {
    color: Colors.BLACK,
    marginRight: 5,
  },
  iconInd: {
    color: Colors.BLACK,
    textAlign: 'right',
    marginLeft: 130,
  },

  hands: {
    color: Colors.BLACK,
    marginLeft: 20,
  },
  balance: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_20,
    marginRight: 50,
    marginLeft: 50,
  },

  containGain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DadosComp;
