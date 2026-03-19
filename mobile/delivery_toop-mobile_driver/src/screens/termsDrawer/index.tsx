import React from 'react';

import {Container} from './styles';


/** Components */
import Terms from './components/screenTerms';


interface Props {
    navigation: any
  }

const ScreenTerm = ({navigation} : Props) => {
   

    function handleGoBack() {
        navigation.navigate('DriverMap');
      }
     

    function submit () {
          navigation.navigate('DriverMap')
      }

    function exit () {
        navigation.navigate('Login')
    }


  return (
    <Container>
      <Terms 
        exit={exit}
        submit={submit}
        goBack={handleGoBack}
      />
    </Container>
  );
};

export default ScreenTerm;
