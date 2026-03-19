import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native';

import {
  ButtonData, 
  ButtonDataText 
  } from './stylesButton'

import { Typography, Colors } from '../../../../styles';

import { Input, CheckBox} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Entypo';


interface Props{
  corrida: any
}

const EmailFragment : React.FC<Props>= ({corrida}) => {


  return (
    <View style={{flex: 1, backgroundColor: Colors.WHITE}}>

      <View style={{height: '90%',width: '100%', alignItems:'center'}}>
       
     

        
        <View style={{width: '90%', alignSelf: 'center'}}>
            <Text style={styles.name}>Nome Completo</Text>
                <Input 
                    placeholder='Digite o nome'
                />

                <Text style={styles.name}>Email</Text>    
                <Input
                    placeholder='Digite seu email'
                />
                <Text style={styles.name}>Número do Titular</Text>    
                <Input
                    placeholder='Digite o número'
                        
                />
                <Text style={styles.name}>Número da corrida</Text>    
               
        </View>
        
          <View style={styles.containerThree}>
            
            <View >
             
              <TouchableOpacity style={styles.containButton} onPress={corrida}>
                <Text style={styles.corrida}>Selecione a corrida</Text>
                <Icon name="chevron-thin-right" size={20} style={styles.iconGoBack} />
              </TouchableOpacity>
              
            </View>
      
          </View>
          <Text style={styles.msg}>Mensagem</Text>   
          
         <View>
           <KeyboardAvoidingView>
            <TextInput 
                  placeholder='Ex: Esqueci um objeto e não consigo entrar em contato...'
                  style={styles.input}
                  placeholderTextColor={Colors.GRAY_TEXT}
                  
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
    color: Colors.ARROW,
    marginRight: 20,
  },

  iconDanger: {
    color: Colors.DANGER,
    marginRight: 10,
    marginTop: 20
  },

  safeAreaView: {
    flexDirection:'row',
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
    backgroundColor:Colors.GRADIENTE_GREY_BOX,
    alignSelf:'center'
  },

  containerTwo: {
    width: '90%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 2,
    marginTop: 10,
    backgroundColor:Colors.GRADIENTE_GREY_BOX,
    alignSelf:'center'
  },
  containerThree: {
    width: '100%',
    height: 50,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor:Colors.GRADIENTE_GREY_BOX,
    alignSelf:'center'
  },

  containerFour: {
    width: '90%',
    height: 80,
    borderRadius: 2,
    marginTop: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor:Colors.GRADIENTE_GREY_BOX,
    alignSelf:'center'
  },


  name: {
    marginTop: 10,
    marginLeft: 15,
    width: '100%',
    textAlign: 'left',
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  msg: {
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 65,
    width: '100%',
    textAlign: 'left',
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  box2: {
    height: 100,
    width: '90%',
    marginTop: 20,
    textAlign: 'left',
    backgroundColor: Colors.WHITE,
    alignSelf: 'center'
},

  text: {
    flexDirection:'column',
  },


  containButton:{
    marginTop: 15,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  button2: {
    flexDirection: 'row',

  },

  corrida: {
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.BLACK,
    marginLeft: 30
  },

  input: {
      borderColor: Colors.GRAY_TEXT,
      borderWidth: 1,
      borderRadius: 8,
      height: 150,
      alignSelf: 'center',
      textAlignVertical: 'top',
      width: '95%',
      fontSize: Typography.FONT_SIZE_12
  }
 
});

export default EmailFragment;