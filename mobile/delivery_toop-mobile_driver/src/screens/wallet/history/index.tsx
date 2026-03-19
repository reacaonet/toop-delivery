import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

/** Components */
import HistoryRun from './components/screenName';

interface Props {
  navigation: any;
}

const HistoryCar = ({ navigation }: Props) => {
  function handleGoBack() {
    navigation.navigate('Wallet');
  }

  function submit() {
    navigation.navigate('Email');
  }

  function go() {
    navigation.navigate('DetailGain');
  }

  return <HistoryRun goBack={handleGoBack} go={go} />;
};

export default HistoryCar;
