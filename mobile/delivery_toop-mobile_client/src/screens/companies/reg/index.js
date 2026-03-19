import React, { useState } from 'react';

import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
    styles,
    ContainIndex,
    Area,
    Title,
    Devider,
    Input,
    SubTitle,
    Sub,
    ViewInput,
    InputAddress,
    InputNum,
    Button,
    TextContainFooter,
    ViewCheck,
    Check,

} from '../styles'
import {useNavigation} from '@react-navigation/native';


import { CheckBox } from 'react-native-elements';


const Empresas = ({
    onPress
}) => {



    const [check, setCheck] = useState(false);
    const [checked, setChecked] = useState(false);
    const navigation = useNavigation();
  
  
    return (
        <ContainIndex>

            <Area>
                <TouchableOpacity  onPress={() => navigation.navigate('Companies')}>
                    <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
                </TouchableOpacity>
                <Title>CADASTRO EMPRESARIAL</Title>
            </Area>
            
            <SubTitle>Razão social</SubTitle>
                
                <Devider />
                
                <Input />

            <SubTitle>CNPJ</SubTitle>
            
               
                
                <Sub>Digite apenas números.</Sub>
                
                <Devider />

                <Input />
            
                <Devider />
            
            <SubTitle>Telefone</SubTitle>

            <Sub>Números para possível retorno{"\n"}desta solicitação</Sub>
                <Devider />
            <Input
                placeholder='(    )'
            />

            <Input
                placeholder='(    )'
            />
            <SubTitle>Rua, avenida, travessa</SubTitle>
            <Sub>Endereço da empresa</Sub>
            <Devider />

            <Input />

            <ViewInput>
                <SubTitle>CEP</SubTitle>
                <SubTitle>Número</SubTitle>
            </ViewInput>

            <Devider />

            <ViewInput>
                <InputAddress />
                <InputNum />
            </ViewInput>

            <SubTitle>Complemento</SubTitle>
            <Devider />
            <Input />


            <SubTitle>Formas de pagamento</SubTitle>

            <Devider />

            <Input />

            <Devider />

            <ViewCheck>
                <CheckBox
                    center
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checked={check}
                    checkedColor='black'
                    onPress={() => setCheck(!check)}
                />
                <Check>Cartão</Check>
            </ViewCheck>

            <ViewCheck>
                <CheckBox
                    center
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    checked={checked}
                    checkedColor='black'
                    onPress={() => setChecked(!checked)}
                />
                <Check>Convênio</Check>
            </ViewCheck>

            <Button>
                <TextContainFooter>Continuar</TextContainFooter>
            </Button>

            <Devider />

        </ContainIndex>

    );
};



export default Empresas;

