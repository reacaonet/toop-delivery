import React from 'react';

import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import { Typography, Colors } from '../../styles';
import{
  styles,
  Area,
  Title,
  ContainIndex,
  Footer
}from './styles'

import Pag from './components/index'
import {useNavigation} from '@react-navigation/native';



const Pagment = () => {

  const navigation = useNavigation();


  return (
    <ContainIndex>
     {/*  Header */}
     <Area>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="navigate-before" size={50} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Title>FORMA DE PAGAMENTO</Title>
      </Area>

    
      
    <FlatList 
      data={[{ title: 'Title Text', key: 'item1' }]}
      style={{marginBottom: 5, marginTop: 10}}
      renderItem={() => (
        <Pag />    
      )}
    />

          <Footer/>
    </ContainIndex>

  );
};



export default Pagment;

