import React from 'react';

import {Container} from './styles';


/** Components */
import ConfirmCn from './components/screenConfirm';


interface Props {
    navigation: any
  }

const Confirm = ({navigation} : Props) => {
   

    function handleGoBack() {
        navigation.navigate('SendCnh');
      }
     

    function submit () {
          navigation.navigate('Dados')
      }
    function again () {
              navigation.navigate('CamCn')
    }

  return (
    <Container>
      <ConfirmCn
        again={again}
        submit={submit}
        goBack={handleGoBack}
      />
    </Container>
  );
};

export default Confirm;
