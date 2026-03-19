import React from 'react';

import { Container } from './styles';

/** Components */
import Wallet from './components';

interface Props {
  navigation: any;
}

const ViewGain = ({ navigation }: Props) => {
  function histgain() {
    navigation.navigate('History');
  }

  function submit() {
    navigation.navigate('Extrato');
  }

  function back() {
    navigation.navigate('DriverMap');
  }

  function histcar() {
    navigation.navigate('HistoryCar');
  }
  return (
    <Wallet
      goBack={back}
      submit={submit}
      histgain={histgain}
      histcar={histcar}
    />
  );
};

export default ViewGain;
