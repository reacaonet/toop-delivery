import React, { useState } from 'react';
import { Text, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';

import { ButtonData, ButtonDataText } from './stylesButton';

import { Typography, Colors } from '../../../../../styles';
import { Input } from 'react-native-elements';

/** Service */
import { createVehicleDocuments } from '../../../../../services/provider/user/vehicleDocuments';

interface Props {
  submit: any;
}

const Cadastro: React.FC<Props> = ({ submit }) => {
  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const [text, setText] = useState('');
  const [load, setLoad] = useState(false);

  const [vehicleManufacturer, setVehicleManufacturer] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNameplate, setVehicleNameplate] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  const sendDocuments = async () => {
    try {
      if (!vehicleManufacturer) {
        return Alert.alert('Formulário', 'Informe a Marca');
      }

      if (!vehicleModel) {
        return Alert.alert('Formulário', 'Informe o Modelo');
      }

      if (!vehicleNameplate) {
        return Alert.alert('Formulário', 'Informe a placa');
      }

      if (!vehicleYear || !Number(vehicleYear)) {
        return Alert.alert('Formulário', 'Informe o ano corretamente');
      }

      if (!vehicleColor) {
        return Alert.alert('Formulário', 'Informe a cor do veículo');
      }

      setLoad(true);
      const car = await createVehicleDocuments({
        vehicleManufacturer:
          vehicleManufacturer.charAt(0).toUpperCase() +
          vehicleManufacturer.slice(1),
        vehicleModel:
          vehicleModel.charAt(0).toUpperCase() + vehicleModel.slice(1),
        vehicleNameplate: vehicleNameplate.toUpperCase(),
        vehicleYear,
        vehicleColor:
          vehicleColor.charAt(0).toUpperCase() + vehicleColor.slice(1),
        driver: user?._id,
      });
      setLoad(false);

      if (!car) {
        return Alert.alert(
          'Cadastro',
          'Não foi possível enviar informações, verifique sua conexão com a internet',
        );
      }

      if (car && car?.errMessage) {
        return Alert.alert('Cadastro', car?.errMessage);
      }

      // cadastar depois enviar o carro
      submit({
        car,
      });
    } catch (err) {
      //
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <Text style={styles.title}>Condições de cadastro</Text>

      <Text style={styles.subtitle}>
        O veículo precisa ter no mínimo 4 portas, fabricado{'\n'}entre 2010 e o
        ano atual, em ótimo estado.
      </Text>

      <View style={{ height: '90%', width: '100%', alignItems: 'center' }}>
        <View style={styles.containerThree}>
          <View style={styles.containButton}>
            <Text style={styles.history}>INFORMAÇÕES DO VEÍCULO:</Text>
          </View>
        </View>

        <Text style={styles.name}>Marca</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite a marca"
          value={vehicleManufacturer}
          onChangeText={setVehicleManufacturer}
        />
        <Text style={styles.name}>Modelo</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite o modelo"
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />
        <Text style={styles.name}>Ano</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite o ano"
          value={vehicleYear}
          onChangeText={setVehicleYear}
        />
        <Text style={styles.name}>Placa</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite a placa"
          value={vehicleNameplate}
          onChangeText={setVehicleNameplate}
        />

        <Text style={styles.name}>Cor</Text>
        <Input
          inputContainerStyle={styles.input}
          placeholder="Digite a cor"
          value={vehicleColor}
          onChangeText={setVehicleColor}
        />

        <ButtonData onPress={() => sendDocuments()}>
          {!load ? (
            <ButtonDataText>Continuar</ButtonDataText>
          ) : (
            <ActivityIndicator color={'white'} size={'small'} />
          )}
        </ButtonData>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 20,
    marginLeft: 30,
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  subtitle: {
    marginBottom: 20,
    marginLeft: 30,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

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

  containerThree: {
    width: '95%',
    height: 50,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containButton: {
    marginTop: 15,
    height: '100%',
  },

  history: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },
});

export default Cadastro;
