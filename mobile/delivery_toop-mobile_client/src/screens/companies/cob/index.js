import React from 'react';

import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import{
  styles,
  ContainIndex,
  Area,
  SubTitle,
  Title,
  Input
}from './styles'

/* import Pag from './components/index' */
import {useNavigation} from '@react-navigation/native';

const Cob  = () => {

 
  const navigation = useNavigation();
  
  


  

  return (
    <ContainIndex>
     {/*  Header */}
     <Area>
        <TouchableOpacity onPress={() => navigation.navigate('Companies')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
      
      </Area>

      <Title>Para solicitar cobertura, escreva o{"\n"}endereço de <SubTitle>email </SubTitle>da empresa em que{"\n"}trabalha responsável pela aprovação</Title>
       <Input
            placeholder='Digite aqui o email'
            onSubmitEditing={() => navigation.navigate('Companies')}

       />
    </ContainIndex>

  );
};



export default Cob;

