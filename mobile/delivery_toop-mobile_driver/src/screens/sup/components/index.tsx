import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList
} from 'react-native';

import {
  ButtonData, 
  ButtonDataText 
  } from './email/stylesButton'

import Icon from 'react-native-vector-icons/MaterialIcons';
import Email from 'react-native-vector-icons/Fontisto';
import WhatsApp from 'react-native-vector-icons/FontAwesome';
import Call from 'react-native-vector-icons/Ionicons';

import { Typography, Colors } from '../../../styles';


interface Props {
  goBack: any
  SendEmail: any
}


const Sup : React.FC<Props> = ({ 
  goBack,
  SendEmail,
}) => {

  const [text, setText] = React.useState('');



  return (
    <View style={{flex: 1, backgroundColor: Colors.WHITE}}>
      
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={goBack} >
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
          <Text style={styles.title}>SUPORTE</Text>
        </SafeAreaView>

      
        <View style={styles.container}>
            <View style={styles.containButton}>
              <TouchableOpacity style={styles.button} onPress={SendEmail}>
                <Email name="email" size={20} style={styles.icon}/>
                <Text style={styles.text}>E-mail</Text>
              </TouchableOpacity> 
            </View>

            <View style={styles.containButton}>
              <TouchableOpacity style={styles.button}>
                <WhatsApp name="whatsapp" size={20} style={styles.icon}/>
                <Text style={styles.text}>Whatsapp</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.containButton, {borderBottomWidth: 0}]}>
              <TouchableOpacity style={styles.button}>
               <Call name="call" size={20} style={styles.icon}/>
                <Text style={styles.text}>Ligação</Text>
              </TouchableOpacity>
            </View>
        </View>
            

       
      
   </View>
  );
};



const styles = StyleSheet.create({
  safeAreaView: {
    flexDirection:'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  container: {
    flexDirection: 'column',
  },

  containButton: {
    borderBottomColor: Colors.GRAY_LIGHT,
    borderBottomWidth: 1,
    width: '90%',
    alignSelf: 'center'
  },
  
  button: {
    flexDirection:'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 50
  },
  
  text: {
    color: Colors.GRAY_TEXT,
    fontSize: Typography.FONT_SIZE_16
  },

  icon: {
    marginLeft: 20,
    marginRight: 20
  }
});

export default Sup;