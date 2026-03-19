import React from 'react';

import {
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePreRegistration } from '../../../services/provider/preRegistration/update';
import { CustomModal } from '../../../components/Modal';
import { RadioButton } from './components/RadioButton';
import { Typography, Colors } from '../../../styles';
import { ScrollView } from 'react-native-gesture-handler';
import { clearMask } from '../../../utils';

interface Props { }

const BankScreen: React.FC<Props> = ({ }) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const state: any = useSelector((state: any) => state?.preRegistration);

  const [showModal, setShowModal] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [load, setLoad] = React.useState(false);
  const [name, setName] = React.useState('');
  const [cpfCnpj, setCpfCnpj] = React.useState('');
  const [city, setCity] = React.useState('');
  const [bank, setBank] = React.useState('');
  const [agency, setAgency] = React.useState('');
  const [account, setAccount] = React.useState('');
  const [type, setTtype] = React.useState<'Corrente' | 'Poupança'>('Corrente');

  const sendData = async () => {
    const id = state?.id;

    if (!name || !cpfCnpj || !city || !bank || !agency || !account || !type) {
      setMessage('Por favor, informe todos os campos para continuar');
      setShowModal(true);

      return;
    }

    const objectTosend = {
      bankData: {
        name,
        cpfCnpj,
        city,
        bank,
        agency,
        account,
        type,
      },
    };

    try {
      setLoad(true);
      const response = await updatePreRegistration(id, objectTosend);
      setLoad(false);

      if (response && response.errMessage) {
        return Alert.alert('Cadastro', response.errMessage);
      }

      dispatch({
        type: 'SET_REGISTRATION',
        payload: {
          ...state,
          id: id,
          name,
          cpfCnpj,
          city,
          bank,
          agency,
          account,
          type,
        },
      });

      navigation.navigate('Password');
    } catch (error) {
      console.log(error, ' error');
    }
    setLoad(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.center}>
            <View style={styles.loginPhoneContainer}>
              <Text style={styles.title}>Associe uma conta bancária</Text>
              <Text style={styles.sub}>
                Nesta conta receberá os valores em crédito.
              </Text>
              <Text style={styles.sub}>
                Poderá alterar os dados bancários, a qualquer momento em
                configurações
              </Text>
            </View>
            <Text style={styles.atribute}>Nome do Titular</Text>
            <TextInput
              style={styles.inputPhone}
              value={name}
              keyboardType="default"
              onChangeText={(value: any) => setName(value)}
              returnKeyType="done"
            />
            <Text style={styles.atribute}>NIF/NIPC</Text>
            <TextInput
              style={styles.inputPhone}
              value={cpfCnpj}
              keyboardType="number-pad"
              onChangeText={(value: any) => setCpfCnpj(clearMask(value))}
              returnKeyType="done"
            />
            <Text style={styles.atribute}>Cidade</Text>
            <TextInput
              style={styles.inputPhone}
              value={city}
              keyboardType="default"
              onChangeText={(value: any) => setCity(value)}
              returnKeyType="done"
            />
            <Text style={styles.atribute}>Nome do banco</Text>
            <TextInput
              style={styles.inputPhone}
              value={bank}
              keyboardType="default"
              onChangeText={(value: any) => setBank(value)}
              returnKeyType="done"
            />
            <Text style={styles.atribute}>Swift</Text>
            <TextInput
              style={styles.inputPhone}
              value={agency}
              keyboardType="default"
              onChangeText={(value: any) => setAgency(value)}
              returnKeyType="done"
            />
            <Text style={styles.atribute}>IBAN</Text>
            <TextInput
              style={styles.inputPhone}
              value={account}
              keyboardType="default"
              onChangeText={(value: any) => setAccount(value)}
              returnKeyType="done"
            />

            {/* <Text style={styles.atribute}>Tipo de conta</Text>

            <TouchableOpacity
              style={{ width: '90%' }}
              onPress={() => setTtype('Corrente')}>
              <RadioButton label="Corrente" selected={type === 'Corrente'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: '90%' }}
              onPress={() => setTtype('Poupança')}>
              <RadioButton label="Poupança" selected={type === 'Poupança'} />
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.touchButton}
              disabled={load}
              onPress={sendData}>
              {!load ? (
                <Text style={styles.txtButton}>Enviar</Text>
              ) : (
                <ActivityIndicator size="small" color={Colors.WHITE} />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <CustomModal
          isVisible={showModal}
          setModalVisible={setShowModal}
          message={message}
        />
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
    justifyContent: 'space-around',
    flexGrow: 1,
    marginTop: 25,
  },
  loginPhoneContainer: {
    width: '90%',
  },
  title: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
    marginBottom: 20,
  },
  sub: {
    fontSize: Typography.FONT_SIZE_15,
    alignSelf: 'flex-start',
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_DARK,
  },
  inputPhone: {
    color: Colors.BLACK,
    marginTop: 4,
    alignSelf: 'flex-start',
    width: '90%',
    padding: 10,
    marginLeft: 15,
    backgroundColor: Colors.GRAY_LIGHT,
    fontSize: Typography.FONT_SIZE_16,
    lineHeight: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    borderRadius: 5,
  },
  touchButton: {
    padding: 10,
    width: '90%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    elevation: 3,
    marginTop: 30,
  },

  txtButton: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: 14,
    color: Colors.WHITE,
  },

  safeAreaView: {
    marginTop: 20,
  },
  atribute: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    alignSelf: 'flex-start',
    color: Colors.GRAY_MAX_DARK,
    marginTop: 20,
    marginLeft: 15,
  },
});

export default BankScreen;
