import React from 'react';

import {
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePreRegistration } from '../../../services/provider/preRegistration/update';
import { Typography, Colors } from '../../../styles';
import { maskDateToPt } from '../../../utils';

import { ContinueButton } from '../components/ContinueButton';

interface Props { }

const Email: React.FC<Props> = ({ }) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const state: any = useSelector((state: any) => state?.preRegistration);

  const [birthDate, setBirthDate] = React.useState(state?.birthDate ?? '');
  const [loading, setLoading] = React.useState(false);

  const sendData = async (value: string) => {
    if (value === null || `${value}`.length < 5) {
      return Alert.alert('Data Nascimento', 'Informe a data de nascimento');
    }

    const id = state?.id;

    const objectTosend = {
      birthDate: value,
    };

    setLoading(true);

    try {
      const response = await updatePreRegistration(id, objectTosend);
      setLoading(false);

      if (response && response.errMessage) {
        return Alert.alert('Cadastro', response.errMessage);
      }

      dispatch({
        type: 'SET_REGISTRATION',
        payload: {
          ...state,
          id: id,
          birthDate: value,
        },
      });

      navigation.navigate('Register', { screen: 'CPF' });
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
              Insira sua <Text style={styles.sub}>data de nascimento</Text>
            </Text>
          </View>
          <TextInput
            style={styles.inputPhone}
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChangeText={(value: string) =>
              setBirthDate(maskDateToPt(value ?? ''))
            }
            autoCapitalize="none"
            autoFocus
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>

        <ContinueButton loading={loading} onPress={() => sendData(birthDate)} />
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

export default Email;
