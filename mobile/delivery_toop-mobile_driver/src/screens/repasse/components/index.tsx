import React, {useState} from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView } from 'react-native';
import Icon2 from 'react-native-vector-icons/EvilIcons';
import { Typography, Colors } from '../../../styles';
// import { Container } from './styles';
import { Input, CheckBox, Icon} from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
  edit: any
}

const Repa: React.FC<Props> = ({edit}) => {

    const [check2, setCheck2] = useState(false);

  return (
      <View style={styles.container}>
          <View style={styles.box}>
            <Text style={styles.text}>O repasse é feito toda xxxx-feira da semana.</Text>
            <Text style={styles.text2}>Escolha a forma qque quer receber</Text>
          </View>
          <Text style={styles.title}>Forma de repasse ativo</Text>
        <View style={styles.box2}>
        <Input
            inputContainerStyle={{borderBottomWidth:0}}
            placeholder='Conta corrente ***90-7'
            rightIcon={
              <TouchableOpacity onPress={edit}>
                  <Icon2
                    name='pencil'
                    size={24}
                    color='black'
                  />
              </TouchableOpacity>
               
            }
            
        />
        </View>
        <Text style={styles.title}>Outras formas de repasse</Text>
        <View style={styles.box3}>
        
      <KeyboardAvoidingView>
        <Input
            inputContainerStyle={{height: 50}}
            placeholder='Conta corrente'
            rightIcon={
                <CheckBox
                
                checkedIcon={
                  <Icon
                    name="radio-button-checked"
                    type="material"
                    color="blue"
                    size={10}
                    
                  />
                }
                uncheckedIcon={
                  <Icon
                    name="radio-button-unchecked"
                    type="material"
                    color="grey"
                    size={10}
                   
                  />
                }
                checked={check2}
                onPress={() => setCheck2(!check2)}
              />
            }
         
            
        />

        <Input
            inputContainerStyle={{height: 50}}
            placeholder='PIX'
            rightIcon={
                <CheckBox
                
                checkedIcon={
                  <Icon
                    name="radio-button-checked"
                    type="material"
                    color="blue"
                    size={10}
                    
                  />
                }
                uncheckedIcon={
                  <Icon
                    name="radio-button-unchecked"
                    type="material"
                    color="grey"
                    size={10}
                   
                  />
                }
                checked={check2}
                onPress={() => setCheck2(!check2)}
              />
            }
            
        />
        <Input
            inputContainerStyle={{height: 50}}
            placeholder='PICPAY'    
            rightIcon={
                <CheckBox
                
                checkedIcon={
                  <Icon
                    name="radio-button-checked"
                    type="material"
                    color="blue"
                    size={10}
                    
                  />
                }
                uncheckedIcon={
                  <Icon
                    name="radio-button-unchecked"
                    type="material"
                    color="grey"
                    size={10}
                   
                  />
                }
                checked={check2}
                onPress={() => setCheck2(!check2)}
              />
            }
        />
        </KeyboardAvoidingView>
        </View>
      
      </View>
  );
}

export default Repa;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    box: {
        height: 70,
        width: '90%',
        marginTop: 20,
        backgroundColor: Colors.GRAY_LIGHT,
        alignSelf: 'center'
    },

    box2: {
        height: 50,
        width: '90%',
        marginTop: 20,
        backgroundColor: Colors.GRAY_LIGHT,
        alignSelf: 'center'
    },

    box3: {
        height: 220,
        width: '90%',
        marginTop: 20,
        backgroundColor: Colors.GRAY_LIGHT,
        alignSelf: 'center'
    },

    text: {
        marginLeft: 20,
        marginTop: 15,
        fontSize: Typography.FONT_SIZE_14,
        color: Colors.GRAY_TEXT,
    },
    text2: {
        marginLeft: 20,
        fontSize: Typography.FONT_SIZE_14,
        color: Colors.GRAY_TEXT,
    },
    title: {
        marginLeft: 30,
        marginTop: 15,
        fontSize: Typography.FONT_SIZE_14,
        color: Colors.BLACK, 
    }
})