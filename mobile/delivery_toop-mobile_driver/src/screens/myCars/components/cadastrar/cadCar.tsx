import React, { useState, useEffect } from 'react';

import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors } from '../../../../styles';

interface Props {
  send: any;
}

const CadCar: React.FC<Props> = ({ send }) => {
  const route = useRoute();
  const [text, setText] = React.useState('');
  const [car, setCar] = useState<any>({});

  useEffect(() => {
    setCar(route.params);
  }, [route.params]);

  return (
    <View style={styles.containerView}>
      <View style={styles.containerTwo}>
        <Image
          source={require('../../../../assets/images/palio.png')}
          style={styles.iconCar}
        />
        <View style={styles.containCar}>
          <Text style={styles.carName}>
            {car?.vehicleManufacturer} {car?.vehicleModel}
          </Text>
          <Text style={styles.placa}>{car?.vehicleNameplate}</Text>
        </View>
      </View>

      {car && !car?.carsDocument ? (
        <Text style={styles.title}>ENVIAR DOCUMENTO</Text>
      ) : (
        <Text style={styles.title}>DOCUMENTO ENVIADO</Text>
      )}

      <View style={styles.containerTwo}>
        <TouchableOpacity
          onPress={() =>
            send({
              car,
            })
          }>
          <View style={styles.button}>
            <View style={styles.containCar}>
              <Text style={styles.text}>
                CERTIFICADO DE REGISTRO DE{'\n'}LICENCIAMENTO DO VEÍCULO - CRLV
              </Text>
            </View>

            <Icon name="navigate-next" size={30} style={styles.iconInd} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  containerTwo: {
    width: '90%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },
  containCar: {
    flexDirection: 'column',
    marginTop: 12,
  },

  title: {
    marginTop: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.DANGER,
  },

  carName: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  text: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  placa: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
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

  iconNext: {
    color: Colors.BLACK,
    marginRight: 5,
  },
  iconCar: {
    marginTop: 20,
    marginLeft: 20,
  },
  iconInd: {
    color: Colors.BLACK,
    marginLeft: 50,
    width: '50%',
    marginTop: 25,
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

export default CadCar;
