import React from 'react';

import { Container } from './styles';

/** Components */
import CarDados from './components';

interface Props {
  navigation: any;
}

const ViewGain = ({ navigation }: Props) => {
  function gain() {
    navigation.navigate('HistoryGain');
  }

  function submit(params: any) {
    navigation.navigate('SendCr', params);
  }

  function back() {
    navigation.navigate('Cars');
  }
  return <CarDados goBack={back} submit={submit} gain={gain} />;
};

export default ViewGain;
