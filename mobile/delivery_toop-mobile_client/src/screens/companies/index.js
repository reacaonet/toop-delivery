import React from 'react';

import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import{
  styles,
  ContainIndex,
  Area,
  ContainSubTitle,
  LongText,
  ImageEmpresa,
  SubText,
  ImageCard,
  TextCard,
  ViewCard,
  TextFooter,
  ContainFooter,
  TextContainFooter
}from './styles'

/* import Pag from './components/index' */
import {useNavigation} from '@react-navigation/native';

const Empresas = () => {

 

  const navigation = useNavigation();
  
  

  return (
    <ContainIndex>
     {/*  Header */}
     <Area>
        <TouchableOpacity style={{marginTop: 20}} onPress={() => navigation.navigate('Home')}>
          <Icon name="navigate-before" size={50} style={styles.iconGoBack} />
        </TouchableOpacity>
      
      </Area>

      <ImageEmpresa source={require('../../assets/images/Empresa_mapa.png')} resizeMode='contain'/>
        <SubText>Empresas</SubText>
      <LongText>Solicite aprovação de uma empresa{"\n"}parceira ou cadastre a sua. E tenha toda a{"\n"}nossa frota a disposição dos seus trabalhos</LongText>
     
     <ContainSubTitle>
        <ViewCard onPress={() => navigation.navigate('Cob')}>
            <ImageCard source={require('../../assets/images/email2.png')} resizeMode='contain'/>
            <TextCard>Solicitar cobertura</TextCard>
        </ViewCard>
     </ContainSubTitle>
     <TextFooter>Regras e informações, regras e{"\n"}informações, regras e informações{"\n"}regras e informações.</TextFooter>
  
     <ContainFooter onPress={() => navigation.navigate('Reg')}>
            <TextContainFooter>Cadastre sua empresa</TextContainFooter>
     </ContainFooter>
    </ContainIndex>

  );
};



export default Empresas;

