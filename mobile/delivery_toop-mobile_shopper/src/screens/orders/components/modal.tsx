import React, {useState} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Colors} from '../../../styles';

interface Props {
  visible: any;
  onRequestClose: any;
  close?: () => void;
  accept: () => void;
}

const ModalView: React.FC<Props> = ({
  visible,
  onRequestClose,
  close,
  accept,
}) => {
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.titles}>
              {/*       <View style={styles.ball} /> */}
              <Text style={styles.titleText}>AVISO</Text>
              <Text style={styles.modalText}>Aceitar pedido ?</Text>
            </View>

            <View style={styles.containButton}>
              <TouchableOpacity style={styles.buttonCancel} onPress={close}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={accept}>
                <Text style={styles.textStyle}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  ball: {
    borderRadius: 20,
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    width: 40,
    height: 40,
    backgroundColor: Colors.WHITE,
    elevation: 3,
  },

  modalView: {
    margin: 20,
    height: 120,
    width: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  titles: {
    marginTop: 25,
    borderBottomColor: Colors.GRAY,
    borderBottomWidth: 1,
    width: '100%',
  },

  button: {
    width: '50%',
  },
  buttonCancel: {
    width: '50%',
    borderRightColor: Colors.GRAY,
    borderRightWidth: 1,
    height: 40,
  },
  textStyle: {
    color: Colors.PRIMARY,
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  containButton: {
    flexDirection: 'row',
  },
  titleText: {
    color: Colors.PRIMARY,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ModalView;
