import React from 'react';

import { Container } from './styles';

/** Components */
import Cars from './components';

interface Props {
  navigation: any;
}

const ViewGain = ({ navigation }: Props) => {
  function open(params = {}) {
    navigation.navigate('CadCar', params);
  }

  function cad() {
    navigation.navigate('CarDados');
  }

  function back() {
    navigation.navigate('DriverMap');
  }
  return <Cars goBack={back} cad={cad} open={open} />;
};

export default ViewGain;
