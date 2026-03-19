import React from 'react';


/** Components */
import HistoryComp from './screemHistory/historyGain';


interface Props {
    navigation: any
  }

const History = ({navigation} : Props) => {
   

    function handleGoBack() {
        navigation.navigate('Wallet');
      }
     

    function submit () {
          navigation.navigate('Email')
      }

  return (
  
  
      <HistoryComp 
        goBack={handleGoBack}
      />
    
  );
};

export default History;
