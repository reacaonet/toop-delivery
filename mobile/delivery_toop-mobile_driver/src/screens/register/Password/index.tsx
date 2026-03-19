import React from 'react';

import {
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePreRegistration } from '../../../services/provider/preRegistration/update';
import { Typography, Colors } from '../../../styles';
import { CustomModal } from '../../../components/Modal';

import { ContinueButton } from '../components/ContinueButton';

interface Props { }

const ConfirmPassword: React.FC<Props> = ({ }) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const state: any = useSelector((state: any) => state?.preRegistration);

  const [text, setText] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [passVisible, setPassVisible] = React.useState(false);

  const sendData = async (value: string) => {
    const id = state?.id;

    if (!value || value === '') {
      setMessage('Por favor, digite uma senha');
      setShowModal(true);

      return;
    }

    const objectTosend = {
      password: value,
    };

    setLoading(true);

    try {
      const response = await updatePreRegistration(id, objectTosend);
      setLoading(false);

      if (response && response.errMessage) {
        return Alert.alert('Cadastro', response.errMessage);
      }

      if (state && state.data) {
        state.data.password = value;
      } else {
        state.data = {};
        state.data.password = value;
      }

      dispatch({
        type: 'SET_REGISTRATION',
        payload: {
          ...state,
          id: id,
          password: value,
        },
      });
      navigation.navigate('Register', { screen: 'ConfirmPassword' });
    } catch (error) {
      console.log(error, ' error');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={{ flex: 1 }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.center}>
          <View style={styles.loginPhoneContainer}>
            <Text style={styles.title}>
              Crie uma <Text style={styles.sub}>senha</Text>
            </Text>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPhone}
              placeholder=""
              value={text}
              onChangeText={(value: string) => setText(value)}
              autoFocus
              secureTextEntry={!passVisible}
              keyboardType="default"
              autoCapitalize="sentences"
              returnKeyType="done"
            />
            <Icon
              name={!passVisible ? 'visibility' : 'visibility-off'}
              size={25}
              style={styles.iconEye}
              onPress={() => {
                setPassVisible(!passVisible);
              }}
            />
          </View>
        </View>
        <ContinueButton loading={loading} onPress={() => sendData(text)} />

        {showModal ? (
          <CustomModal
            isVisible={showModal}
            setModalVisible={setShowModal}
            message={message}
          />
        ) : null}
      </View>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    marginTop: 25,
  },
  loginPhoneContainer: {
    width: '90%',
  },
  title: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },
  sub: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  passwordContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  iconEye: {
    position: 'absolute',
    marginTop: 25,
    right: 10,
  },
  iconView: {
    justifyContent: 'center',
    alignContent: 'center',
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
});

export default ConfirmPassword;
