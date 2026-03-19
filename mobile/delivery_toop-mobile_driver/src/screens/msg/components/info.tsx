import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Typography, Colors } from '../../../styles';
// import { Container } from './styles';

interface Props {
  route?: any;
}

const Info: React.FC<Props> = () => {
  // const { open } = route.params;

  return (
    <View style={styles.centeredView}>
      {/* <View style={styles.container}>
        <Text style={styles.modalText}>Campanha de pontos</Text>
        <Text style={styles.text}>
          Olá George, sabia da nova promoção de pontos que vai começar esta
          semana ? Então se liga, is simply of the printing and typesetting
          industy. Lorem Ipsum has been the industy's standard dummy text ever.
        </Text>
      </View>
      <View style={styles.container2}>
        <Text style={styles.modalText2}>Atualize suas informações</Text>
        <Text style={styles.text}>
          Olá Georgem, vimos que falta algumas informações para completar seu
          cadastro... is simply of the printing and typesetting industy. Lorem
          Ipsum has been the industy's standard dummy text ever.
        </Text>
      </View> */}
    </View>
  );
};

export default Info;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200,
  },
  modalView: {
    margin: 20,

    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'justify',
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.RED,
  },
  modalText2: {
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'justify',
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.GRAY_TEXT,
  },
  text: {
    marginBottom: 15,
    textAlign: 'justify',
    marginLeft: 10,
    marginRight: 10,
    color: Colors.GRAY_TEXT,
    fontSize: Typography.FONT_SIZE_14,
  },
  container: {
    height: 150,
    width: '90%',
    borderColor: Colors.RED,
    borderRadius: 8,
    borderWidth: 1,
  },
  container2: {
    marginTop: 20,
    height: 150,
    width: '90%',
    borderColor: Colors.GRAY_TEXT,
    borderRadius: 8,
    borderWidth: 1,
  },
});
