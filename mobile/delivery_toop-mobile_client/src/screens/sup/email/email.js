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
import { Typography, Colors } from '../../../styles';
import {useNavigation} from '@react-navigation/native';

import Icon from 'react-native-vector-icons/MaterialIcons';



const SendEmail  = () => {

 
  function back () {
    navigation.navigate('Sup')
  }


  const navigation = useNavigation();
  



  return (

    <View style={{flex: 1, backgroundColor: '#fff'}}>

        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.navigate('Sup')} >
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
          <Text style={styles.title}>SUPORTE</Text>
        </SafeAreaView>

        <FlatList 
          data={[{ title: 'Title Text', key: 'item1' }]}
          style={{marginTop: 10}}
          renderItem={() => (
            <EmailFragment/>
          )}
        />
    
    </View>
 
  );
};



const styles = StyleSheet.create({
  iconGoBack: {
    color: '#992336',
    marginLeft: 5
  },

  iconDanger: {
    color: 'red',
    marginRight: 10,
    marginTop: 20
  },

  safeAreaView: {
    flexDirection:'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginLeft: 20,
    marginRight: 15
  },
  container: {
    width: '95%',
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: '#e2e2e2',
    alignSelf:'center'
  },

  containerTwo: {
    width: '90%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 2,
    marginTop: 10,
    backgroundColor:'#e2e2e2',
    alignSelf:'center'
  },
  containerThree: {
    width: '100%',
    height: 50,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor:'#e2e2e2',
    alignSelf:'center'
  },

  containerFour: {
    width: '90%',
    height: 80,
    borderRadius: 2,
    marginTop: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor:'#e2e2e2',
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
    fontSize: 13,
    color: '#e2e2e2',
  },

  box2: {
    height: 100,
    width: '90%',
    marginTop: 20,
    textAlign: 'left',
    backgroundColor: '#fff',
    alignSelf: 'center'
},

  text: {
    flexDirection:'column',
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: 15,
    color: '#992336',
  },

  title2: {
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: 15,
    color: '#e2e2e2',
  },

  title3: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: 13,
    color: '#e2e2e2',
  },

  value: {
    bottom: 10,
    paddingRight: 20,
    position:'absolute',
    width: '100%',
    textAlign: 'right',
    fontSize: 30,
    color: '#000',
  },

  subTitle: {
    marginTop: 5,
    marginRight: 10,
    marginLeft: 20,
    fontSize: 14,
    color: '#e2e2e2',
  },

  titleStreet: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 20,
    fontSize: 14,
    color: '#e2e2e2',
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
    fontSize: 15,
    color: '#000',
  },

  cnh: {
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: 13,
    color: 'red',
  },

  pend: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: 13,
    color: '#e2e2e2',
  },

  profile: {
    marginRight: 20,
    marginLeft: 20,
    marginTop: 5,
    fontSize: 13,
    color: '#e2e2e2',
  },

  aprove: {
    marginRight: 20,
    marginLeft: 20,
    fontSize: 13,
    color: '#e2e2e2',
  },

  iconNext: {
    color: '#000',
    marginRight: 5
  },
  iconInd: {
    color: '#000',
    textAlign: 'right',
    marginLeft: 130,
  },

  hands: {
    color: '#000',
    marginLeft: 20
  },
  balance: {
    color: '#fff',
    fontSize: 20,
    marginRight: 50,
    marginLeft: 50,
  },

  containGain: {
   flexDirection: 'row',
   justifyContent: 'space-between',
  },
 
});

export default SendEmail;