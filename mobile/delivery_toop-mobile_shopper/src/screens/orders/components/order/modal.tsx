import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
    Container,
    ContainInput,
    InputModal,
    Inputqtd,
    BarCode,
    ImageCode,
    Button,
    TitleButton,
    Minus,
    InputView,
    Plus,
    Sinal
} from './styles'
import {Colors} from '../../../../styles'
import AsyncStorage from '@react-native-community/async-storage';
/* interface Props {
    value?: any
    name?: any
    code?: any
} */
import NumericInput from 'react-native-numeric-input'

const ModalView: React.FC = ({navigation}: any) => {
  
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [value, setValue] = useState('')
    const [input, setInput] = useState('')
    const [count, setCount] = useState(0);

    const save = async () => {
        try {
          await AsyncStorage.setItem("@Myname", name)
          navigation.navigate('Detail', { name, value, code } )
        } catch (err) {
          alert(err);
        }
      }
  return (
    <Container>
        
        
     
            <ContainInput>
                <InputModal
                    value={code}
                    placeholder='Código de barras'
                    onChangeText={text => setCode(text)}
                />
                <BarCode>
                    <ImageCode
                        source={require('../../../../assets/images/qr.png')}
                    />
                </BarCode>

                
            </ContainInput>
            <InputModal
                    value={name}
                    placeholder='Nome do produto'
                    style={{width: '82%', alignSelf: 'center', marginTop: 15}}
                    onChangeText={text => setName(text)}
            />

            <InputModal
                    value={value}
                    placeholder='Valor do produto'
                    style={{width: '82%', alignSelf: 'center', marginTop: 15}}
                    onChangeText={text => setValue(text)}
            />
            
           
            <NumericInput 
                containerStyle={{alignSelf: 'center', marginTop: 10, borderColor: Colors.GRAY, borderRadius: 12}}
                value={count} 
                onChange={count => setCount(count)} 
                onLimitReached={(isMax,msg) => console.log(isMax,msg)}
                totalWidth={362} 
                totalHeight={50} 
                iconSize={30}
                step={1}
                valueType='integer'
                rounded 
                textColor={Colors.GRAY} 
                iconStyle={{alignSelf: 'center', width: 20}}
                rightButtonBackgroundColor='#ffff' 
                leftButtonBackgroundColor='#ffff'
            />
            <Button disabled={!count} onPress={save}>
                <TitleButton>Adicionar produto</TitleButton>    
            </Button>           
    </Container>
  );
};



export default ModalView;
