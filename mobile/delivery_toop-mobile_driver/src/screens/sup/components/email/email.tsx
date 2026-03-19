import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList
} from 'react-native';


import EmailFragment from './emailFragment'
import { Typography, Colors } from '../../../../styles';

import Icon from 'react-native-vector-icons/MaterialIcons';


interface Props {
  navigation: any
}

const SendEmail : React.FC<Props> = ({navigation}) => {

 
  function back () {
    navigation.navigate('Sup')
  }

  function corrida () {
    navigation.navigate('HistoryRunning')
  }


  return (

    <View style={{flex: 1, backgroundColor: Colors.WHITE}}>

        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={back} >
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
          <Text style={styles.title}>SUPORTE</Text>
        </SafeAreaView>

        <FlatList 
          data={[{ title: 'Title Text', key: 'item1' }]}
          style={{marginTop: 10}}
          renderItem={() => (
            <EmailFragment
              corrida={corrida}
            />
          )}
        />
    
    </View>
 
  );
};



const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5
  },

  iconDanger: {
    color: Colors.DANGER,
    marginRight: 10,
    marginTop: 20
  },

  safeAreaView: {
    flexDirection:'row',
    justifyContent: 'space-between',
    marginTop: 10
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

  image: {
    borderRadius: 60,
    marginTop: 15,
    marginRight: 10,
    width: 55,
    height: 55
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

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  title2: {
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  title3: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  value: {
    bottom: 10,
    paddingRight: 20,
    position:'absolute',
    width: '100%',
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_30,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  subTitle: {
    marginTop: 5,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  titleStreet: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },
  line: {
    flexDirection: 'column',
    justifyContent:'center',
    marginLeft: 10
  },


  box: {
    flexDirection:'column',
    justifyContent: 'center',
    marginTop: 10
  },

  containButton:{
    marginTop: 15,
    height: '100%'
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  button2: {
    flexDirection: 'row',

  },

  history: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  cnh: {
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.DANGER,
  },

  pend: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  profile: {
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  aprove: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_MEDIUM,
  },

  iconNext: {
    color: Colors.BLACK,
    marginRight: 5
  },
  iconInd: {
    color: Colors.BLACK,
    textAlign: 'right',
    marginLeft: 130,
  },

  hands: {
    color: Colors.BLACK,
    marginLeft: 20
  },
  balance: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_20,
    marginRight: 50,
    marginLeft: 50,
  },

  containGain: {
   flexDirection: 'row',
   justifyContent: 'space-between',
  },
 
});

export default SendEmail;