import React from 'react';

import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import Right from 'react-native-vector-icons/AntDesign';
import { Typography, Colors } from '../../../styles'
import {
  Contain,
  ViewText,
  TextTitle,
  ContainIndex,
  Text,
  ImageCard,
  ViewCard,
  ViewCardList,
  Devider,
  Footer
} from '../styles'


 
import {useNavigation} from '@react-navigation/native';

const Pag = () => {


  const navigation = useNavigation();
  

  return (
    <ContainIndex>
      {/* BODY */}
      <Contain >
        <ViewText style={{justifyContent: 'flex-start'}}>
          <TextTitle>Forma de pagamento selecionada</TextTitle>
        </ViewText>

      </Contain>

      <ViewCard>
        <ImageCard source={require('../../../assets/images/card.png')} resizeMode='contain' />
        <Text style={{color: '#992326'}}>****8765</Text>
      </ViewCard>

      <Contain >
        <ViewText style={{justifyContent: 'flex-start'}}>
          <TextTitle>Forma de pagamento selecionada</TextTitle>
        </ViewText>
      </Contain>
      <ViewCardList>
  
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('CardPag')}>
            <ImageCard source={require('../../../assets/images/addCard.png')} resizeMode='contain' />
            <Text >Cartão de Crédito</Text>
          </TouchableOpacity>
        </View>

        <Right name='right' size={25} style={{ marginTop: 10, width: '15%' }} />

      </ViewCardList>
      <Devider />

      <ViewCardList>
        <View style={{ flexDirection: 'row' }}>
          <ImageCard source={require('../../../assets/images/dindin.png')} resizeMode='contain' />
          <Text>Pagar com dinheiro</Text>
        </View>
        <Right name='right' size={25} style={{ marginTop: 10, width: '15%' }} />

      </ViewCardList>

      <Devider />

      <ViewCardList>
        <View style={{ flexDirection: 'row' }}>
          <ImageCard source={require('../../../assets/images/Picpay.png')} resizeMode='contain' />
          <Text>PicPay</Text>
        </View>
        <Right name='right' size={25} style={{ marginTop: 10, width: '15%' }} />

      </ViewCardList>
      <Devider />

      <ViewCardList>
        <View style={{ flexDirection: 'row' }}>
          <ImageCard source={require('../../../assets/images/PayPal.png')} resizeMode='contain' />

          <Text>PayPal</Text>
        </View>
        <Right name='right' size={25} style={{ marginTop: 10, width: '15%' }} />

      </ViewCardList>

      <Devider />

      <Contain >
        <ViewText style={{justifyContent: 'flex-start'}}>
          <TextTitle>Cartões cadastrados</TextTitle>
        </ViewText>
      </Contain>

      <ViewCardList>
        
        <View style={{ flexDirection: 'row' }}>
          
          <ImageCard source={require('../../../assets/images/card.png')} resizeMode='contain' />

          <Text style={{color: '#992326'}}>****8765</Text>
          
        </View>
        
        <Icon name='pencil' size={25} style={{ marginTop: 10, width: '15%' }} />
      
      </ViewCardList>

      <Devider />

      <ViewCardList>

        <View style={{ flexDirection: 'row' }}>

          <ImageCard source={require('../../../assets/images/visa.png')} resizeMode='contain' />
          
          <Text style={{color: '#992326'}}>****8765</Text>

        </View>

        <Icon name='pencil' size={25} style={{ marginTop: 10, width: '15%' }} />

      </ViewCardList>

      <Devider />

      <ViewCardList>

        <View style={{ flexDirection: 'row' }}>
          
          <ImageCard source={require('../../../assets/images/amex.png')} resizeMode='contain' />

          <Text style={{color: '#992326'}}>****8765</Text>

        </View>

        <Icon name='pencil' size={25} style={{ marginTop: 10, width: '15%' }} />

      </ViewCardList>

    
    </ContainIndex>

  );
};



export default Pag;

