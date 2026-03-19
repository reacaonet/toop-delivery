import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';

import {ButtonData, ButtonDataText} from './stylesButton';

import {useNavigation} from '@react-navigation/native';
import {Input, CheckBox} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Entypo';

const EmailFragment = () => {
  const navigation = useNavigation();

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={{height: '90%', width: '100%', alignItems: 'center'}}>
        <View style={{width: '90%', alignSelf: 'center'}}>
          <Text style={styles.name}>Nome Completo</Text>
          <Input placeholder="Digite o nome" placeholderTextColor={'#992326'} />

          <Text style={styles.name}>Email</Text>
          <Input
            placeholder="Digite seu email"
            placeholderTextColor={'#992326'}
          />
          <Text style={styles.name}>Número do Titular</Text>
          <Input
            placeholder="Digite o número"
            placeholderTextColor={'#992326'}
          />
          <Text style={styles.name}>Número da Viagem</Text>
        </View>

        <View style={styles.containerThree}>
          <View>
            <TouchableOpacity
              style={styles.containButton}
              onPress={() => navigation.navigate('RunCar')}>
              <Text style={styles.corrida}>Selecione a Viagem</Text>
              <Icon
                name="chevron-thin-right"
                size={20}
                style={styles.iconGoBack}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.msg}>Mensagem</Text>

        <View>
          <KeyboardAvoidingView>
            <TextInput
              placeholder="Ex: Esqueci um objeto e não consigo entrar em contato..."
              style={styles.input}
              placeholderTextColor={'#747474'}
            />
          </KeyboardAvoidingView>
        </View>

        <ButtonData>
          <ButtonDataText>Enviar</ButtonDataText>
        </ButtonData>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    color: '#438AD1',
    marginRight: 20,
  },

  iconDanger: {
    color: 'red',
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
    backgroundColor: '#e2e2e2',
    alignSelf: 'center',
  },

  containerTwo: {
    width: '90%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: '#e2e2e2',
    alignSelf: 'center',
  },
  containerThree: {
    width: '100%',
    height: 50,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: '#e2e2e2',
    alignSelf: 'center',
  },

  containerFour: {
    width: '90%',
    height: 80,
    borderRadius: 2,
    marginTop: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#e2e2e2',
    alignSelf: 'center',
  },

  name: {
    marginTop: 10,
    marginLeft: 15,
    width: '100%',
    textAlign: 'left',
    fontSize: 13,
    color: '#747474',
  },

  msg: {
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 65,
    width: '100%',
    textAlign: 'left',
    fontSize: 13,
    color: '#747474',
  },

  box2: {
    height: 100,
    width: '90%',
    marginTop: 20,
    textAlign: 'left',
    backgroundColor: '#fff',
    alignSelf: 'center',
  },

  text: {
    flexDirection: 'column',
  },

  containButton: {
    marginTop: 15,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button2: {
    flexDirection: 'row',
  },

  corrida: {
    fontSize: 15,
    color: '#992336',
    marginLeft: 30,
  },

  input: {
    borderColor: '#747474',
    borderWidth: 1,
    borderRadius: 8,
    height: 150,
    alignSelf: 'center',
    textAlignVertical: 'top',
    width: '95%',
    fontSize: 12,
  },
});

export default EmailFragment;
