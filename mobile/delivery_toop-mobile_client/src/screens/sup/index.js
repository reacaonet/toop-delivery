import React from 'react';

import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import WhatsApp from '../../assets/images/whats-icon.svg'
import{
  styles,
  Area,
  Title,
  ContainIndex,
  Text,
  ViewCardList,
  ImageCard,
  Devider,
  Button
}from './styles'

 
const Sup = () => {

 

  const navigation = useNavigation();
  

  

  return (
    <ContainIndex>
     {/*  Header */}
     <Area style={{marginTop: 20}}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="navigate-before" size={50} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Title >SUPORTE</Title>
      </Area>

      <ViewCardList>

          <Button style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('Email')}>

          <ImageCard source={require('../../assets/images/email.png')} resizeMode='contain'/>
          <Text>E-mail</Text>

          </Button>



      </ViewCardList>
      <Devider/>
     <ViewCardList>

        <Button style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('Email')}>
      
        <WhatsApp 
          width="20px"
          height="20px"
          style={{marginLeft: 20, marginTop: 10}} 
          resizeMode='contain'
        />
        <Text>Whatsapp</Text>

        </Button>



    </ViewCardList>
        <Devider/>
    <ViewCardList>

        <Button style={{ flexDirection: 'row' }}>
      
        <ImageCard source={require('../../assets/images/Ligar.png')} resizeMode='contain'/>
        <Text>Ligação</Text>

        </Button>

       

    </ViewCardList>
  {/*   <FlatList 
      data={[{ title: 'Title Text', key: 'item1' }]}
      style={{marginBottom: 5, marginTop: 10}}
      renderItem={() => (
        <Pag/>    
      )}
    /> */}

    </ContainIndex>

  );
};



export default Sup;

