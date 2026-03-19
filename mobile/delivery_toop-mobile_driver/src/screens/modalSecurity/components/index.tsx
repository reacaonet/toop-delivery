import React, {useState} from 'react';
import { Modal, Alert, View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import {Colors, Typography} from '../../../styles';
import styles from './styles'
// import { Container } from './styles';

interface Props {
    visible: any
    onPress: any
    animationType: any
}

const ModalView: React.FC<Props> = ({
    visible,
    onPress,
    animationType
}) => {

   
  return (
    
        <Modal
            animationType={animationType}
            transparent={true}
            visible={visible}
        >
         
            
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Segurança</Text>
                        <Pressable
                        
                        onPress={onPress}
                        >
                            <Icon name="chevron-thin-down" size={30} style={styles.icon} />
                        
                        </Pressable>
                    </View>
                    
                    <View style={styles.modal}>
                        
                      <Text style={styles.title}>Gravar Corrida</Text>
                      <Text style={styles.subTitle}>Grave arquivo de ?????? e envie</Text>
                      <Text style={styles.subTitle}>para nossa central caso de suspeitas</Text>
                    
                      
                    </View>
                    <View style={styles.modal2}>
                        
                        <View style={styles.borderLine} />
                        <Text style={[styles.title,{marginLeft: 5, marginTop: 10}]}>Acompanhar viagem</Text>
                       
                    </View>
                    <View style={styles.contain}>
                        <Text style={[styles.title,{marginLeft: 42, marginTop: 20, color: Colors.POLICE, fontSize: Typography.FONT_SIZE_16}]}>Ligar para a polícia</Text>
                    </View>
        </Modal>
 
  );
}

export default ModalView;