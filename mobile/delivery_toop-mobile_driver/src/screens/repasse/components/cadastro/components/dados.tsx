import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { ButtonData, ButtonDataText } from './stylesButton';

import { Typography, Colors } from '../../../../../styles';
import userAvatar from '../../../../../assets/images/avatar.jpg';
import { Input, CheckBox } from 'react-native-elements';
import { GRAY_TEXT } from '../../../../../styles/colors';

const Cadastro: React.FC = () => {
  const [text, setText] = React.useState('');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <View style={{ height: '90%', width: '100%', alignItems: 'center' }}>
        <Text style={styles.name}>Nome do titular</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite o nome do titular"
        />
        <Text style={styles.name}>CPF/CNPJ</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite o seu CPF/CNPJ"
        />
        <Text style={styles.name}>Cidade</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite a cidade"
        />
        <Text style={styles.name}>Nome do banco</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite o nome do banco"
        />
        <Text style={styles.name}>Número da agência</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite o número da agência"
        />

        <Text style={styles.name}>Número da conta bancária</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite o número da conta"
        />

        <Text style={styles.name}>Tipo de conta</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite sua senha"
        />

        <ButtonData>
          <ButtonDataText>Enviar</ButtonDataText>
        </ButtonData>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  name: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 60,
    width: '100%',
    textAlign: 'left',
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  input: {
    borderBottomWidth: 0,
    backgroundColor: Colors.GRAY_LIGHT,
    borderRadius: 8,
    width: '90%',
    alignSelf: 'center',
  },
});

export default Cadastro;
