import React from 'react';

import { Container } from './styles';

/** Components */
import Dados from './components';

interface Props {
  navigation: any;
}

const ViewGain = ({ navigation }: Props) => {
  function gain() {
    navigation.navigate('HistoryGain');
  }

  function cnh() {
    navigation.navigate('SendCnh');
  }

  function back() {
    navigation.navigate('DriverMap');
  }
  return <Dados goBack={back} cnh={cnh} gain={gain} />;
};

export default ViewGain;
