import React from 'react';

import { TouchableOpacity, KeyboardAvoidingView } from 'react-native';

import { Typography, Colors } from '../../../styles'
import {
  styles,
  ContainCard,
  ViewText,
  ContainIndex,
  Area,
  Title,
  Input,
  Cards,
  ContainInputVal,
  InputVal,
  ButtonCard,
  ButtonCardText
} from '../styles'

import Icon from 'react-native-vector-icons/MaterialIcons';

import {useNavigation} from '@react-navigation/native';






const CardPag = ({ navigation }) => {



  return (
    <ContainIndex>
      <Area>
        <TouchableOpacity onPress={() => navigation.navigate('Pag')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Title>ADICIONAR CARTÃO</Title>
      </Area>
        
      <ContainCard >

        <ViewText>
              <Cards source={require('../../../assets/images/h.png')} resizeMode='contain' style={{borderRadius: 2}}/>
              <Cards source={require('../../../assets/images/card.png')} resizeMode='contain' />
              <Cards source={require('../../../assets/images/visa.png')} resizeMode='contain' />
              <Cards source={require('../../../assets/images/amex.png')} resizeMode='contain' />
              <Cards source={require('../../../assets/images/elo.png')} resizeMode='contain' style={{borderRadius: 2}}/>
              <Cards source={require('../../../assets/images/diners.png')} resizeMode='contain' style={{borderRadius: 2}}/>
        </ViewText>

      </ContainCard>
        
            <Input
                placeholder='Número do cartão'
                placeholderTextColor={'#000'}
            />
            <ContainInputVal>
                <InputVal
                    placeholder='Validade'
                    placeholderTextColor={'#000'}
                />
                <InputVal
                    placeholder='CVV'
                    placeholderTextColor={'#000'}
                />
            </ContainInputVal>
            <Input
                placeholder='Nome do titular'
                placeholderTextColor={'#000'}
            />
        <KeyboardAvoidingView>
            <Input
                placeholder='CPF/CNPJ do titular'
                placeholderTextColor={'#000'}
            />
        </KeyboardAvoidingView>

        <ButtonCard>
            <ButtonCardText>Adicionar</ButtonCardText>
        </ButtonCard>
    </ContainIndex>

  );
};



export default CardPag;

