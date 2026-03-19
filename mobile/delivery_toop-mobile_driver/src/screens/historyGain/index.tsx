import React from 'react';


/** Components */
import History from './screemHistory/historyGain';


interface Props {
    navigation: any
  }

const HistoryGain = ({navigation} : Props) => {
   

    function handleGoBack() {
        navigation.navigate('Gain');
      }
     

    function submit () {
          navigation.navigate('Email')
      }

  return (
  
  
      <History 
        goBack={handleGoBack}
      />
    
  );
};

export default HistoryGain;
