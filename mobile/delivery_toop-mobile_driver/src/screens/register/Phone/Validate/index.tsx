/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FirebaseAuthTypes } from '@react-native-firebase/auth/lib/index';
import { useFocusEffect } from '@react-navigation/core';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

/** Services */
import { createPreRegistration } from '../../../../services/provider/preRegistration/create';
import { updatePreRegistration } from '../../../../services/provider/preRegistration/update';
import { StorageClean, StorageSet } from './../../../../services/deviceStorage';
import { CustomModal } from '../../../../components/Modal';

/** Styles */
import { Typography, Colors } from '../../../../styles';

/** Components */
import TimeRestartCode from '../components/timeRestartCode';

interface Props {
  ddi: string;
  phone: string;
  confirmCode: FirebaseAuthTypes.ConfirmationResult | undefined;
  setConfirmCode: Function;
  setShowValidate: Function;
  showValidate?: any;
}

const Validade: React.FC<Props> = ({
  ddi,
  phone,
  confirmCode,
  setShowValidate,
  setConfirmCode,
}) => {
  const dispatch = useDispatch();
  const state: any = useSelector((state: any) => state?.preRegistration);
  const navigation: any = useNavigation();

  const AuthStateChanged = useRef<any>(null);

  const [codeSMS, setCodeSMS] = React.useState('');

  const [showModal, setShowModal] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [reinvent, setReinvent] = useState(false);

  useEffect(() => {
    if (AuthStateChanged.current === null) {
      AuthStateChanged.current = auth().onAuthStateChanged(async user => {
        if (user && phone && `${phone}`.length >= 8) {
          registration();
        } else {
          let currentUser = auth().currentUser;
          if (currentUser) {
            await auth().signOut();
          }
        }
      });
    }

    return () => {
      if (AuthStateChanged.current !== null) {
        AuthStateChanged.current;
      }
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (codeSMS && codeSMS.length === 6) {
        codeConfirmSMS();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeSMS]),
  );

  const codeConfirmSMS = async () => {
    try {
      let currentUser = auth().currentUser;

      if (currentUser) {
        await auth().signOut();
      }

      await confirmCode?.confirm(codeSMS);
      // registration(); - duplicado
    } catch (err) {
      setMessage('Código inválido ou já utilizado');
      setShowModal(true);

      console.log('fail auth', err);
    }
  };

  const registration = async () => {
    try {
      let response: any;

      await StorageClean('@pre_register');
      response = await createPreRegistration(ddi, phone);

      if (response && response.errMessage) {
        return Alert.alert('Err', response.errMessage);
      }

      if (response.data) {
        response = response.data;
      }

      if (response && response && response?.terms === true) {
        let msg = 'Você já realizou o cadastro anteriormente';

        if (response?.status === 'ANALYZE') {
          msg = 'Seu registo está em análise, aguarde pela nossa aprovação';
        } else if (
          response?.status === 'PENDENTE' ||
          response?.status === 'PENDING'
        ) {
          msg = 'Seu registo está em análise, aguarde pela nossa aprovação';
        } else if (response?.status === 'RESENT') {
          msg =
            'Documentação reenviada, aguarde até que seja analisado novamente';
        } else if (response?.status === 'APPROVED') {
          msg = 'Seu registo se encontra aprovado, faça o login para entrar';
        }

        let currentUser = auth().currentUser;
        if (currentUser) {
          await auth().signOut();
        }

        await StorageClean('@pre_register');
        setToast(msg);
        navigation.navigate('Login');
        return;
      }

      // cadastro reprovado aguardando reenvio
      if (
        response &&
        response?.terms !== true &&
        response?.status === 'RESENT'
      ) {
        let currentUser = auth().currentUser;
        if (currentUser) {
          await auth().signOut();
        }

        setToast(
          'Cadastro Reprovado, aguardando reenvio da documentação para uma nova análise',
        );

        dispatch({
          type: 'SET_REGISTRATION',
          payload: {
            id: response._id,
            _id: response._id,
            data: {
              phone: phone,
            },
          },
        });

        await StorageSet('@pre_register', {
          phone: phone,
          ddi: ddi ?? '+351',
        });
        setShowValidate(false);
        return navigation.navigate('Register', { screen: 'DynamicRegister' });
      }

      if (response && response._id) {
        dispatch({
          type: 'SET_REGISTRATION',
          payload: {
            ...state,
            id: response._id,
            _id: response._id,
            phone: phone,
          },
        });

        await StorageSet('@pre_register', {
          phone: phone,
          ddi: ddi ?? '+351',
        });
        setShowValidate(false);
        return navigation.navigate('Register', { screen: 'DynamicRegister' });
      } else {
        throw 'Erro desconhecio';
      }
    } catch (error) {
      console.log(error, ' error');
      setMessage('Erro ao tentar registrar novo usuário');
      setShowModal(true);
    }
  };

  const resetTime = async () => {
    try {
      let currentUser = auth().currentUser;
      if (currentUser) {
        // await currentUser.delete();
        await auth().signOut();
      }

      await StorageSet('@dateSMS', moment().format());
      setReinvent(false);

      let phoneTxt = ddi + `${phone}`.replace(/\D/g, '');
      let confirmation = await auth().signInWithPhoneNumber(phoneTxt, true);
      setConfirmCode(confirmation);
    } catch (err) {
      console.log('resetTime Error', err);
    }
  };

  const setToast = (msg: string) => {
    dispatch({
      type: 'SET_MESSAGE_SAGA',
      payload: {
        title: '',
        description: msg,
      },
    });
  };

  return (
    <>
      <View style={styles.center}>
        <View style={styles.loginPhoneContainer}>
          <Text style={styles.title}>Digite o código enviado para </Text>
          <Text style={styles.phoneTag}>{phone}</Text>

          <TextInput
            style={styles.inputPhone}
            value={codeSMS}
            onChangeText={(value: string) => setCodeSMS(value)}
            autoCapitalize="none"
            keyboardType="numeric"
          />

          {reinvent === true ? (
            <>
              <Text style={styles.txtQuestion}>
                Não recebeu o código de segurança?
              </Text>

              <TouchableOpacity onPress={() => resetTime()}>
                <Text style={styles.sendText}>Reenviar código</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TimeRestartCode setReinvent={setReinvent} />
          )}
        </View>
      </View>
      <CustomModal
        isVisible={showModal}
        setModalVisible={setShowModal}
        message={message}
      />
    </>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 55,
    flexGrow: 1,
  },
  loginPhoneContainer: {
    width: '90%',
    marginTop: 20,
  },
  title: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GREY,
  },
  phoneTag: {
    fontSize: Typography.FONT_SIZE_17,
    color: '#999a99',
    fontWeight: 'bold',
    marginRight: 12,
  },
  inputPhone: {
    color: Colors.BLACK,
    borderWidth: 1,
    marginTop: 40,
    width: '50%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_13,
  },
  sendText: {
    marginTop: 10,
    fontSize: Typography.FONT_SIZE_17,
    color: Colors.BLACK,
    fontWeight: 'bold',
  },
  guest: {
    flexShrink: 1,
    width: '100%',
    backgroundColor: Colors.GRAY_DARK,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 30,
    height: 45,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
    letterSpacing: 1,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  safeAreaView: {
    marginTop: 20,
  },
  resendCode: {
    marginTop: 10,
    padding: 10,
  },
  otherLoginText: {
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
  },
  txtQuestion: {
    textAlign: 'left',
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.GRAY_DARK,
    marginTop: 10,
    width: '90%',
  },
});

export default React.memo(Validade);
