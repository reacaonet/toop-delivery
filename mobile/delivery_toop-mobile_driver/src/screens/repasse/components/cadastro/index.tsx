import React from 'react';

import {Container} from './styles';


/** Components */
import CadastroDados from './components';


interface Props {
    navigation: any
  }

const ViewGain = ({navigation} : Props) => {
   

   /*  function gain() {
        navigation.navigate('HistoryGain');
      }
     

    function historyRun () {
          navigation.navigate('HistoryRun')
      } */

    function back () {
        navigation.navigate('Repasse')
    }
  return (
   
      <CadastroDados 
        goBack={back}
        /* submit={historyRun}
        gain={gain} */
      />
 
  );
};

export default ViewGain;
