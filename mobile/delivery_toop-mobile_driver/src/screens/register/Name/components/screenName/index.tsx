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
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePreRegistration } from '../../../../../services/preRegistration/update';
import { Typography, Colors } from '../../../../../styles';

import { ContinueButton } from '../../../components/ContinueButton';

const Name: React.FC<any> = () => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const state: any = useSelector((state: any) => state?.preRegistration);

  const [name, setName] = React.useState(state?.data?.name ?? '');
  const [loading, setLoading] = React.useState(false);

  const sendName = async (value: string) => {
    if (value === null || `${value}`.trim().length < 6) {
      return Alert.alert('Nome', 'Informe um Nome com pelo menos 6 caracteres');
    }

    const id = state?.id;
    const objectTosend = {
      name: value,
    };

    setLoading(true);

    try {
      const resp: any = await updatePreRegistration(id, objectTosend);
      setLoading(false);

      if (resp && resp.errMessage) {
        return Alert.alert('Cadastro', resp.errMessage);
      }

      dispatch({
        type: 'SET_REGISTRATION',
        payload: {
          ...state,
          id: id,
          name: value,
        },
      });

      navigation.navigate('Email');
    } catch (error) {
      console.log(error, ' error');
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <View style={styles.center}>
            <View style={styles.loginPhoneContainer}>
              <Text style={styles.title}>
                Falta Pouco para fazer seu cadastro
              </Text>
              <Text style={styles.title}>
                antes precisamos do seu{' '}
                <Text style={styles.sub}>nome completo</Text>
              </Text>
            </View>
            <TextInput
              style={styles.inputPhone}
              placeholder="Digite seu nome"
              value={name}
              onChangeText={(value: string) => setName(value)}
              autoCapitalize="sentences"
              autoFocus
            />
          </View>
          <ContinueButton onPress={() => sendName(name)} loading={loading} />
        </KeyboardAvoidingView>
      </View>
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
    borderLeftColor: Colors.GRAY,
    borderLeftWidth: 1,
    borderStyle: 'solid',
    backgroundColor: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    lineHeight: Typography.FONT_SIZE_16,
  },
  safeAreaView: {
    marginTop: 20,
  },
});

export default Name;
