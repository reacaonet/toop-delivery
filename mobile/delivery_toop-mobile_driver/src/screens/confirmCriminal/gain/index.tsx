import React from 'react';

import {Container} from './styles';


/** Components */
import Gain from './components/screenName';


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
        navigation.navigate('Login')
    }
  return (
   
      <Gain 
        goBack={back}
        submit={historyRun}
        gain={gain}
      />
 
  );
};

export default ViewGain;
