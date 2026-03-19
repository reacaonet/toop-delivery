import React from 'react';

import {View} from 'react-native'


/** Components */
import Indique from './components/indique'

interface Props {
    navigation: any
  }



const Send = ({navigation} : Props) => {

    function back () {
        navigation.navigate('DriverMap')
    }
       
  return (
    <View style={{backgroundColor: 'white', height: '100%'}}>
      <Indique 
        goBack={back}
      />
    </View>
  );
};

export default Send;
