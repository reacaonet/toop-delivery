import React from 'react';

import {Container} from './styles';


/** Components */
import Sup from './components/index';


interface Props {
    navigation: any
  }

const ViewGain = ({navigation} : Props) => {
   

    function gain() {
        navigation.navigate('HistoryGain');
      }
     

    function historyRun () {
          navigation.navigate('HistoryRun')
      }

    function back () {
        navigation.navigate('DriverMap')
    }

    function email () {
      navigation.navigate('SendEmail')
    }
    
  return (
   
      <Sup 
        goBack={back}
        SendEmail={email}
      />
 
  );
};

export default ViewGain;
